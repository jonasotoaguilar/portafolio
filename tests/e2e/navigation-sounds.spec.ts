import { expect, type Page, test } from "@playwright/test";

// Navigation effect sounds (button_click / button_select / menu_close):
// played independently of the ambient music mute, on clicks, keyboard
// moves/activation, hover, Escape, and the back action. Playback is proven
// by counting the effect AUDIO responses — each effect plays through its
// own Audio element and fetches its mp3 once, so a non-zero audio-response
// count is deterministic proof that the effect played. (The static
// `?import` module requests for the assets fire on every page load, so
// responses are filtered to audio/mpeg to observe real playback only.)

interface EffectCounts {
	click: number;
	select: number;
	close: number;
}

const effectCounts = (page: Page): EffectCounts => {
	const counts: EffectCounts = { click: 0, select: 0, close: 0 };
	page.on("response", (response) => {
		if (!response.headers()["content-type"]?.includes("audio/mpeg")) return;
		const url = response.url();
		if (url.includes("button_click")) counts.click += 1;
		if (url.includes("button_select")) counts.select += 1;
		if (url.includes("menu_close")) counts.close += 1;
	});
	return counts;
};

test.describe("navigation effect sounds", () => {
	test("initial page load plays no effects", async ({ page }) => {
		const counts = effectCounts(page);
		await page.goto("/");
		await expect(
			page.getByRole("navigation", { name: "Game menu" }),
		).toBeVisible();
		expect(counts).toEqual({ click: 0, select: 0, close: 0 });
	});

	test("hovering a menu item plays select", async ({ page }) => {
		const counts = effectCounts(page);
		await page.goto("/");
		await page.getByRole("link", { name: "About" }).hover();
		await expect.poll(() => counts.select).toBeGreaterThanOrEqual(1);
		expect(counts.click).toBe(0);
		expect(counts.close).toBe(0);
	});

	test("hovering the mute control plays select once, never repeatedly inside it", async ({
		page,
	}) => {
		const counts = effectCounts(page);
		// Response counting proves the first fetch but cannot see replays of
		// an already-buffered effect (the Audio element is created once and
		// reused), so an in-page hook counts every play() attempt per effect.
		// Registered as an init script so it survives the goto below.
		await page.addInitScript(() => {
			const seen: string[] = [];
			(globalThis as { __effectPlays?: string[] }).__effectPlays = seen;
			const original = HTMLMediaElement.prototype.play;
			HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
				// currentSrc is still empty at play() time (the resource is
				// only selected after the fetch starts); src reflects the
				// assigned asset URL immediately.
				const src = this.src;
				if (src.includes("button_select")) seen.push("select");
				else if (src.includes("button_click")) seen.push("click");
				else if (src.includes("menu_close")) seen.push("close");
				return original.call(this);
			};
		});
		const selectPlays = () =>
			page.evaluate(() => {
				const seen = (globalThis as { __effectPlays?: string[] }).__effectPlays;
				return (seen ?? []).filter((name) => name === "select").length;
			});
		await page.goto("/");
		const mute = page.locator("[data-mute-control]");
		await expect(mute).toBeVisible();
		// Entering the control plays select exactly once.
		await mute.hover();
		await expect.poll(() => counts.select).toBe(1);
		await expect.poll(() => selectPlays()).toBe(1);
		// Moving between the control's SVG descendants stays silent.
		const box = await mute.boundingBox();
		if (!box) throw new Error("expected a bounding box for the mute control");
		await page.mouse.move(box.x + box.width - 3, box.y + box.height / 2);
		await page.mouse.move(box.x + box.width / 2, box.y + 3);
		await page.waitForTimeout(300);
		expect(await selectPlays()).toBe(1);
		// Leaving the control resets the hover state; re-entering replays once.
		await page.mouse.move(10, 10);
		await mute.hover();
		await expect.poll(() => selectPlays()).toBe(2);
		expect(counts.click).toBe(0);
		expect(counts.close).toBe(0);
	});

	test("clicking a menu item plays click (hover also plays select)", async ({
		page,
	}) => {
		const counts = effectCounts(page);
		await page.goto("/");
		await page.getByRole("link", { name: "About" }).click();
		await expect(
			page.getByRole("heading", { level: 1, name: "About" }),
		).toBeVisible();
		await expect.poll(() => counts.click).toBe(1);
		await expect.poll(() => counts.select).toBeGreaterThanOrEqual(1);
		expect(counts.close).toBe(0);
	});

	test("keyboard arrow move plays select and Enter plays click on the shell", async ({
		page,
	}) => {
		const counts = effectCounts(page);
		await page.goto("/");
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("Enter");
		await expect(
			page.getByRole("heading", { level: 1, name: "Projects" }),
		).toBeVisible();
		await expect.poll(() => counts.select).toBeGreaterThanOrEqual(1);
		await expect.poll(() => counts.click).toBe(1);
		expect(counts.close).toBe(0);
	});

	test("Escape on a view with no open panel plays close (back to menu)", async ({
		page,
	}) => {
		const counts = effectCounts(page);
		await page.goto("/about");
		await page.keyboard.press("Escape");
		await expect(page).toHaveURL("/");
		await expect.poll(() => counts.close).toBe(1);
		expect(counts.click).toBe(0);
		expect(counts.select).toBe(0);
	});

	test("clicking the Back to menu link plays close", async ({ page }) => {
		const counts = effectCounts(page);
		// The Back to menu link stays visible on every view except About
		// (which uses Escape as its documented return path), so the link
		// contract is exercised on a view that still renders it.
		await page.goto("/resume");
		await page.getByRole("link", { name: "Back to menu" }).click();
		await expect(page).toHaveURL("/");
		await expect.poll(() => counts.close).toBe(1);
		expect(counts.click).toBe(0);
		expect(counts.select).toBe(0);
	});

	test("browser Back from a view plays close", async ({ page }) => {
		const counts = effectCounts(page);
		await page.goto("/");
		await page.getByRole("link", { name: "About" }).click();
		await expect(
			page.getByRole("heading", { level: 1, name: "About" }),
		).toBeVisible();
		// Let the inbound view transition settle before traversing back: a
		// back issued mid-transition races the router's swap and can skip
		// the close sound's popstate moment.
		await page.waitForFunction(() =>
			document.getAnimations().every((animation) => {
				const pseudo =
					(animation.effect as KeyframeEffect | null)?.pseudoElement ?? "";
				return !pseudo.includes("view-transition");
			}),
		);
		await page.goBack();
		await expect(page).toHaveURL("/");
		await expect.poll(() => counts.close).toBe(1);
	});

	test("muting ambient music does not mute navigation effects", async ({
		page,
	}) => {
		const counts = effectCounts(page);
		await page.goto("/");
		const mute = page.locator("[data-mute-control]");
		await expect(mute).toHaveAttribute("data-audio-state", "ready");
		// Unlock ambient playback, then mute the bed via the control. The
		// control is a button, so its click also plays the click effect —
		// effects must stay independent of the ambient mute.
		await page.keyboard.press("Shift");
		await mute.click();
		await expect(mute).toHaveAttribute("data-audio-state", "muted");
		await expect.poll(() => counts.click).toBe(1);
		// Menu cursor feedback still plays while ambient is muted.
		await page.locator("[data-menu-item]").first().focus();
		await page.keyboard.press("ArrowDown");
		await expect.poll(() => counts.select).toBeGreaterThanOrEqual(1);
		expect(counts.close).toBe(0);
	});
});
