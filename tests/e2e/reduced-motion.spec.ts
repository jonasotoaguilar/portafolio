import { expect, type Page, test } from "@playwright/test";

interface EntranceSample {
	t: number;
	opacity: string;
	transform: string;
}

const entranceSamples = (page: Page) =>
	page.evaluate(
		() =>
			(window as unknown as { __entranceSamples: EntranceSample[] })
				.__entranceSamples,
	);

const canvasDataUrl = (page: Page) =>
	page.evaluate(() =>
		(
			document.getElementById("living-background") as HTMLCanvasElement
		).toDataURL(),
	);

// Cyan-band coverage in the lower half of the canvas: the removed procedural
// wave bands were the only painter of solid cyan/light-blue strips (b-r >=
// 100). With waves gone, every route must stay near zero — the deep caustic
// gradient (b-r <= 83) and the sparse particles/bubbles (<1% of the sampled
// area) never reach the threshold.
const getCyanBandCoverage = (page: Page) =>
	page.evaluate(() => {
		const canvas = document.getElementById(
			"living-background",
		) as HTMLCanvasElement;
		const context = canvas.getContext("2d");
		const pixels = context
			? context.getImageData(0, 0, canvas.width, canvas.height).data
			: new Uint8ClampedArray(0);
		let total = 0;
		let cyan = 0;
		for (let y = Math.floor(canvas.height / 2); y < canvas.height; y += 8) {
			for (let x = 0; x < canvas.width; x += 8) {
				total++;
				const i = (y * canvas.width + x) * 4;
				if (pixels[i + 2] - pixels[i] >= 100) cyan++;
			}
		}
		return cyan / total;
	});

test.describe("reduced motion", () => {
	test("canvas paints one static frame with no ongoing progression", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/");
		await expect(page.locator("#living-background")).toBeVisible();
		const samples = await page.evaluate(async () => {
			const canvas = document.getElementById(
				"living-background",
			) as HTMLCanvasElement;
			const first = canvas.toDataURL();
			await new Promise((resolve) => setTimeout(resolve, 250));
			return [first, canvas.toDataURL()];
		});
		expect(samples[0]).toBe(samples[1]);
	});

	test("glow layer holds without breathing animation", async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/");
		const glow = await page.locator(".glow-layer").evaluate((el) => {
			const style = getComputedStyle(el);
			return { animation: style.animationName, opacity: style.opacity };
		});
		expect(glow.animation).toBe("none");
		expect(glow.opacity).toBe("1");
	});

	test("entrances are opacity-only and at most 200ms", async ({ page }) => {
		await page.addInitScript(() => {
			const samples: EntranceSample[] = [];
			(
				window as unknown as { __entranceSamples: typeof samples }
			).__entranceSamples = samples;
			const start = performance.now();
			const frame = () => {
				const element = document.querySelector<HTMLElement>("[data-entrance]");
				if (element) {
					const style = getComputedStyle(element);
					samples.push({
						t: performance.now() - start,
						opacity: style.opacity,
						transform: style.transform,
					});
				}
				if (samples.length < 1000) requestAnimationFrame(frame);
			};
			requestAnimationFrame(frame);
		});
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/");

		await expect
			.poll(
				async () =>
					(await entranceSamples(page)).filter((s) => s.opacity !== "1").length,
				{ timeout: 15000 },
			)
			.toBeGreaterThan(0);
		const samples = await entranceSamples(page);
		const transitions = samples.filter((sample) => sample.opacity !== "1");
		expect(new Set(samples.map((sample) => sample.transform)).size).toBe(1);
		const first = transitions[0]?.t ?? 0;
		const last = transitions[transitions.length - 1]?.t ?? 0;
		expect(last - first).toBeLessThanOrEqual(240);
		expect(last).toBeLessThanOrEqual(1000);
	});

	test("animation loop runs continuously by default", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("#living-background")).toBeVisible();
		const initial = await canvasDataUrl(page);
		await expect
			.poll(() => canvasDataUrl(page), { timeout: 2000 })
			.not.toBe(initial);
	});

	test("no procedural wave bands render on any route", async ({ page }) => {
		// The procedural wave layer is removed (living-background contract):
		// no route — shell or view — paints solid cyan wave bands. The static
		// frame keeps caustic gradient + bubbles + particles only.
		await page.emulateMedia({ reducedMotion: "reduce" });
		for (const path of ["/", "/about", "/projects"]) {
			await page.goto(path);
			await expect(page.locator("#living-background")).toBeVisible();
			expect(
				await getCyanBandCoverage(page),
				`${path} must not paint cyan wave bands`,
			).toBeLessThan(0.01);
		}
	});

	test("canvas renders procedurally and the hidden tab pauses the loop", async ({
		page,
	}) => {
		// living-background specs "Procedural rendering" + "Hidden tab pauses
		// the loop": the canvas animation fetches no image/media assets
		// (favicons are page chrome; the audio probe is a HEAD request), and
		// the visibilitychange lifecycle freezes the canvas until the tab
		// returns.
		const loaded: string[] = [];
		page.on("request", (request) => {
			const type = request.resourceType();
			if (
				type === "image" ||
				(type === "media" && !request.url().includes("/audio/"))
			) {
				loaded.push(request.url());
			}
		});
		await page.goto("/");
		await expect(page.locator("#living-background")).toBeVisible();
		expect(loaded).toEqual([]);
		const frame = () => canvasDataUrl(page);
		await expect.poll(frame, { timeout: 2000 }).not.toBe(await frame());
		await page.evaluate(() => {
			Object.defineProperty(document, "hidden", {
				configurable: true,
				value: true,
			});
			document.dispatchEvent(new Event("visibilitychange"));
		});
		const paused = await frame();
		// A running loop repaints every frame, so a ~250ms window of identical
		// samples proves the loop is stopped. Timing runs page-side (same
		// pattern as the static-frame test above); no Playwright-side sleep.
		const frozen = await page.evaluate(async (baseline) => {
			const canvas = document.getElementById(
				"living-background",
			) as HTMLCanvasElement;
			let same = true;
			for (let i = 0; i < 5; i++) {
				await new Promise((resolve) => setTimeout(resolve, 50));
				same = same && canvas.toDataURL() === baseline;
			}
			return same;
		}, paused);
		expect(frozen).toBe(true);
		await page.evaluate(() => {
			Object.defineProperty(document, "hidden", {
				configurable: true,
				value: false,
			});
			document.dispatchEvent(new Event("visibilitychange"));
		});
		await expect.poll(frame, { timeout: 2000 }).not.toBe(paused);
	});
});

test.describe("removed decorative figure layer", () => {
	// The decorative figure/artifact layer (FigureLayer.astro) is removed:
	// no route — shell, views, or 404 — renders a .figure-layer element or
	// its data hook. The background contract is now CSS gradient/scanlines +
	// canvas (caustic, bubbles, particles) only.
	const routes = ["/", "/about", "/resume", "/projects", "/skills", "/404"];

	test("no route renders the removed figure layer", async ({ page }) => {
		for (const path of routes) {
			await page.goto(path);
			await expect(
				page.locator(".figure-layer"),
				`${path} must not render a figure layer`,
			).toHaveCount(0);
			await expect(
				page.locator("[data-figure-layer]"),
				`${path} must not render the figure-layer hook`,
			).toHaveCount(0);
		}
	});
});
