import { expect, type Page, test } from "@playwright/test";

// Ambient audio (ambient-audio spec scenarios + design AD5): the wiring
// HEAD-probes /audio/background.mp3 exactly once per fresh load, stashes the
// outcome on the persisted control cluster so swaps never re-probe, waits for
// the first pointer/keyboard gesture before playback, fades 400ms (200ms
// reduced motion), persists the mute preference (try/catch — read/write
// storage failures degrade to the in-memory state, never throw), and renders
// a terminal no-track state when no licensed track exists.

interface TrackCounts {
	heads: number;
	gets: number;
}

const audioState = (page: Page) =>
	page.locator("[data-audio-element]").evaluate((el) => {
		const audio = el as HTMLAudioElement;
		return { paused: audio.paused, volume: audio.volume };
	});

const paused = (page: Page) => audioState(page).then((s) => s.paused);
const volume = (page: Page) => audioState(page).then((s) => s.volume);

const unlock = (page: Page) => page.keyboard.press("Shift");

interface VolumeSample {
	t: number;
	v: number;
}

// In-browser 5ms interval sampler: timestamps come from the page's own clock,
// so the measured fade duration is immune to Playwright roundtrip latency, and
// the sampling-phase error is bounded by one 5ms tick (vs ~16.7ms for rAF),
// which makes the spec's 200–450ms band assertable without harness slack.
function watchVolume(page: Page): Promise<VolumeSample[]> {
	return page.evaluate(
		() =>
			new Promise<VolumeSample[]>((resolve) => {
				const audio = document.querySelector(
					"[data-audio-element]",
				) as HTMLAudioElement | null;
				if (!audio) {
					resolve([]);
					return;
				}
				const samples: VolumeSample[] = [];
				const start = performance.now();
				const timer = window.setInterval(() => {
					const t = performance.now() - start;
					samples.push({ t, v: audio.volume });
					if (t >= 1200) {
						clearInterval(timer);
						resolve(samples);
					}
				}, 5);
			}),
	);
}

// Fade contract: gradual (an intermediate volume exists — never an instant
// cut), ends at the target volume, and the in-page duration lands in the
// spec band (200–450ms; 400ms nominal, 200ms reduced motion). The nominal
// fade is 400ms of wall clock, the driver ticks at 25ms and the sampler at
// 5ms, so the measured duration is 400 ± ~30ms — the spec band is assertable
// directly without extra tolerance.
function assertFade(samples: VolumeSample[], target: number): void {
	expect(samples.length).toBeGreaterThan(2);
	expect(samples.some((s) => s.v > 0 && s.v < 1)).toBe(true);
	expect(samples[samples.length - 1].v).toBe(target);
	const first = samples.findIndex((s) => s.v !== (target === 0 ? 1 : 0));
	const last = samples.findIndex((s) => s.v === target);
	expect(last).toBeGreaterThanOrEqual(0);
	const duration =
		samples[last].t - (first >= 0 ? samples[first].t : samples[0].t);
	expect(duration).toBeGreaterThanOrEqual(200);
	expect(duration).toBeLessThanOrEqual(450);
}

function silentMp3(): Buffer {
	// MPEG-1 Layer III, 128 kbps, 44.1 kHz, no CRC, joint stereo: zero-filled
	// 417-byte frames decode as silence in Chromium.
	const frame = Buffer.alloc(417);
	frame[0] = 0xff;
	frame[1] = 0xfb;
	frame[2] = 0x90;
	frame[3] = 0x00;
	return Buffer.concat(Array.from({ length: 24 }, () => Buffer.from(frame)));
}

// Serves a licensed-looking track and counts probe (HEAD) vs playback (GET)
// requests so the "once per load" and "lazy bytes" contracts are observable.
async function installTrack(page: Page, counts: TrackCounts): Promise<void> {
	const body = silentMp3();
	await page.route("**/audio/background.mp3", (route) => {
		if (route.request().method() === "HEAD") {
			counts.heads += 1;
			return route.fulfill({ status: 200 });
		}
		counts.gets += 1;
		return route.fulfill({ status: 200, contentType: "audio/mpeg", body });
	});
}

test.describe("ambient audio", () => {
	test("no track present: probe 404 keeps the control disabled and silent, swaps never re-probe", async ({
		page,
	}) => {
		// The site now ships the licensed derivative (public/audio/…), so the
		// absent-derivative build is simulated with a deterministic 404 route.
		await page.route("**/audio/background.mp3", (route) =>
			route.fulfill({ status: 404 }),
		);
		const heads: string[] = [];
		const gets: string[] = [];
		page.on("request", (request) => {
			if (!request.url().includes("/audio/background.mp3")) return;
			if (request.method() === "HEAD") heads.push(request.url());
			else gets.push(request.url());
		});
		await page.goto("/");
		const mute = page.getByRole("button", { name: "Sound: Off" });
		await expect(mute).toBeDisabled();
		await expect(mute).toHaveAttribute("aria-pressed", "false");
		await expect(mute).toHaveAttribute("data-audio-state", "no-track");
		await expect.poll(() => heads.length).toBe(1);
		expect(gets).toHaveLength(0);
		// A gesture cannot unlock a missing track (terminal state).
		await unlock(page);
		await expect(mute).toBeDisabled();
		await expect(mute).toHaveAttribute("data-audio-state", "no-track");
		// Swap re-init adopts the stashed probe-fail: still no-track, no re-probe.
		await page.getByRole("link", { name: "About" }).click();
		await expect(
			page.getByRole("heading", { level: 1, name: "About" }),
		).toBeVisible();
		await expect(mute).toBeDisabled();
		await expect(mute).toHaveAttribute("data-audio-state", "no-track");
		expect(heads).toHaveLength(1);
		expect(gets).toHaveLength(0);
	});

	test("track present: silent and byte-free until the first gesture, then plays", async ({
		page,
	}) => {
		const track: TrackCounts = { heads: 0, gets: 0 };
		await installTrack(page, track);
		await page.goto("/");
		const mute = page.getByRole("button", { name: "Sound: On" });
		await expect(mute).toBeEnabled();
		await expect(mute).toHaveAttribute("aria-pressed", "false");
		await expect(mute).toHaveAttribute("data-audio-state", "ready");
		// Probe is HEAD-only; the track bytes stay unloaded until playback.
		await expect.poll(() => track.heads).toBe(1);
		expect(track.gets).toBe(0);
		// First gesture unlocks playback.
		await unlock(page);
		await expect.poll(() => track.gets).toBe(1);
		await expect.poll(() => paused(page)).toBe(false);
		await expect(mute).toHaveAttribute("data-audio-state", "playing");
	});

	test("keyboard toggle fades playing to muted and back; aria-pressed, label and storage update", async ({
		page,
	}) => {
		const track: TrackCounts = { heads: 0, gets: 0 };
		await installTrack(page, track);
		await page.goto("/");
		const mute = page.locator("[data-mute-control]");
		// Unlock only once the probe has armed the track (a gesture fired
		// while still no-track is a no-op per the reducer contract).
		await expect(mute).toHaveAttribute("data-audio-state", "ready");
		await unlock(page);
		await expect.poll(() => paused(page)).toBe(false);
		// "Given audio playing": wait for the fade-in to become audible before
		// muting, so the fade-out provably ramps from full volume.
		await expect.poll(() => volume(page)).toBe(1);
		await mute.focus();
		// Mute: the fade is gradual and lands in the design band; the watcher
		// starts before the keystroke so the whole ramp is captured.
		const fadeOut = watchVolume(page);
		await page.keyboard.press("Enter");
		await expect(mute).toHaveAttribute("aria-pressed", "true");
		await expect(mute).toHaveAttribute("aria-label", "Sound: Off");
		assertFade(await fadeOut, 0);
		await expect.poll(() => paused(page)).toBe(true);
		expect(
			await page.evaluate(() => localStorage.getItem("portfolio:audio:muted")),
		).toBe("1");
		// Unmute restores playback with a fade-in.
		const fadeIn = watchVolume(page);
		await page.keyboard.press("Enter");
		await expect(mute).toHaveAttribute("aria-pressed", "false");
		await expect(mute).toHaveAttribute("aria-label", "Sound: On");
		assertFade(await fadeIn, 1);
		await expect.poll(() => paused(page)).toBe(false);
	});

	test("persisted mute preference restores across reloads and gates the first gesture to silence", async ({
		page,
	}) => {
		const track: TrackCounts = { heads: 0, gets: 0 };
		await installTrack(page, track);
		await page.goto("/");
		await expect(
			page.getByRole("button", { name: "Sound: On" }),
		).toHaveAttribute("data-audio-state", "ready");
		await unlock(page);
		await expect.poll(() => paused(page)).toBe(false);
		await page.getByRole("button", { name: "Sound: On" }).click();
		await expect.poll(() => paused(page)).toBe(true);
		await page.reload();
		// A fresh document re-probes; the restored preference keeps audio
		// silent even after the gesture — no bytes are fetched.
		await expect.poll(() => track.heads).toBe(2);
		const mute = page.getByRole("button", { name: "Sound: Off" });
		await expect(mute).toBeEnabled();
		await expect(mute).toHaveAttribute("aria-pressed", "true");
		await unlock(page);
		await expect(mute).toHaveAttribute("data-audio-state", "muted");
		expect(track.gets).toBe(1);
		await expect.poll(() => paused(page)).toBe(true);
	});

	test("playing audio survives navigation and swaps never re-probe", async ({
		page,
	}) => {
		const track: TrackCounts = { heads: 0, gets: 0 };
		await installTrack(page, track);
		await page.goto("/");
		await expect(
			page.getByRole("button", { name: "Sound: On" }),
		).toHaveAttribute("data-audio-state", "ready");
		await unlock(page);
		await expect.poll(() => paused(page)).toBe(false);
		expect(track.heads).toBe(1);
		expect(track.gets).toBe(1);
		await page.getByRole("link", { name: "About" }).click();
		await expect(
			page.getByRole("heading", { level: 1, name: "About" }),
		).toBeVisible();
		// The persisted element keeps playing; re-init adopts the stashed
		// probe result and never issues a second HEAD or GET.
		await expect.poll(() => paused(page)).toBe(false);
		await expect(
			page.getByRole("button", { name: "Sound: On" }),
		).toHaveAttribute("data-audio-state", "playing");
		expect(track.heads).toBe(1);
		expect(track.gets).toBe(1);
	});

	test("muted state survives navigation: the persisted control stays muted, no re-probe, no resume", async ({
		page,
	}) => {
		const track: TrackCounts = { heads: 0, gets: 0 };
		await installTrack(page, track);
		await page.goto("/");
		await expect(
			page.getByRole("button", { name: "Sound: On" }),
		).toHaveAttribute("data-audio-state", "ready");
		await unlock(page);
		await expect.poll(() => paused(page)).toBe(false);
		// Mute once the fade-in completes so the fade-out starts from full volume.
		await expect.poll(() => volume(page)).toBe(1);
		const mute = page.locator("[data-control-cluster] [data-mute-control]");
		await mute.focus();
		await page.keyboard.press("Enter");
		await expect(mute).toHaveAttribute("aria-pressed", "true");
		await expect(mute).toHaveAttribute("data-audio-state", "muted");
		await expect.poll(() => paused(page)).toBe(true);
		expect(track.heads).toBe(1);
		expect(track.gets).toBe(1);
		// Real view-transition navigation through the persisted shell.
		await page.getByRole("link", { name: "About" }).click();
		await expect(
			page.getByRole("heading", { level: 1, name: "About" }),
		).toBeVisible();
		// The surviving control inside the persisted cluster keeps the muted
		// state; the swap never re-probes and playback never resumes.
		await expect(mute).toHaveAttribute("aria-pressed", "true");
		await expect(mute).toHaveAttribute("data-audio-state", "muted");
		await expect.poll(() => paused(page)).toBe(true);
		expect(track.heads).toBe(1);
		expect(track.gets).toBe(1);
	});

	test("reduced motion: no autostart, control operable, fade still completes", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		const track: TrackCounts = { heads: 0, gets: 0 };
		await installTrack(page, track);
		await page.goto("/");
		// Nothing starts automatically under reduced motion.
		await expect.poll(() => track.heads).toBe(1);
		expect(track.gets).toBe(0);
		const mute = page.getByRole("button", { name: "Sound: On" });
		await expect(mute).toBeEnabled();
		// The control stays operable: gesture starts playback, toggle mutes.
		await unlock(page);
		await expect.poll(() => track.gets).toBe(1);
		await mute.click();
		await expect.poll(() => volume(page)).toBe(0);
		await expect.poll(() => paused(page)).toBe(true);
	});

	test("storage read failure: restore falls back to the in-memory default and playback still works", async ({
		page,
	}) => {
		// Storage throws for the audio key: the wiring's read must degrade to
		// the in-memory default (unmuted) instead of crashing (spec "Storage
		// failure degrades safely", design AD5 try/catch → never throws).
		await page.addInitScript(() => {
			const originalGet = Storage.prototype.getItem;
			Storage.prototype.getItem = function (key: string) {
				if (key === "portfolio:audio:muted") {
					throw new DOMException("storage denied", "SecurityError");
				}
				return originalGet.call(this, key);
			};
		});
		const pageErrors: string[] = [];
		page.on("pageerror", (error) => pageErrors.push(error.message));
		const track: TrackCounts = { heads: 0, gets: 0 };
		await installTrack(page, track);
		await page.goto("/");
		// Prove the override is live: the in-page read genuinely throws.
		expect(
			await page.evaluate(() => {
				try {
					localStorage.getItem("portfolio:audio:muted");
					return false;
				} catch {
					return true;
				}
			}),
		).toBe(true);
		// The failed restore read falls back to unmuted: ready + "Sound: On".
		const mute = page.getByRole("button", { name: "Sound: On" });
		await expect(mute).toHaveAttribute("data-audio-state", "ready");
		await unlock(page);
		await expect.poll(() => paused(page)).toBe(false);
		await expect(mute).toHaveAttribute("data-audio-state", "playing");
		expect(pageErrors).toEqual([]);
	});

	test("storage write failure: toggling still works in memory and no error surfaces", async ({
		page,
	}) => {
		// persistMuted writes throw: the toggle must still flip in memory
		// with no page error (spec "Storage failure degrades safely").
		await page.addInitScript(() => {
			const originalSet = Storage.prototype.setItem;
			Storage.prototype.setItem = function (key: string, value: string) {
				if (key === "portfolio:audio:muted") {
					throw new DOMException("storage denied", "SecurityError");
				}
				return originalSet.call(this, key, value);
			};
		});
		const pageErrors: string[] = [];
		page.on("pageerror", (error) => pageErrors.push(error.message));
		const track: TrackCounts = { heads: 0, gets: 0 };
		await installTrack(page, track);
		await page.goto("/");
		const mute = page.locator("[data-mute-control]");
		await expect(mute).toHaveAttribute("data-audio-state", "ready");
		await unlock(page);
		await expect.poll(() => paused(page)).toBe(false);
		// Mute: the persist write throws; the toggle still flips in memory.
		await mute.click();
		await expect(mute).toHaveAttribute("aria-pressed", "true");
		await expect(mute).toHaveAttribute("aria-label", "Sound: Off");
		await expect.poll(() => paused(page)).toBe(true);
		// And back: the in-memory state keeps cycling without storage.
		await mute.click();
		await expect(mute).toHaveAttribute("aria-pressed", "false");
		await expect(mute).toHaveAttribute("aria-label", "Sound: On");
		await expect.poll(() => paused(page)).toBe(false);
		expect(pageErrors).toEqual([]);
	});
});
