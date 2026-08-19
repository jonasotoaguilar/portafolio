import { expect, type Page, test } from "@playwright/test";

interface VtSample {
	pseudo: string;
	delay: number;
	duration: number;
	endDelay: number;
	properties: string[];
}

// Installs a click-driven sampler for ::view-transition overlay animations:
// clicks the matching link (or a freshly created one for the 404 route) and
// reports every distinct overlay animation observed within the window.
async function installVtSampler(page: Page): Promise<void> {
	await page.addInitScript(() => {
		(window as unknown as { __clickAndSampleVt: unknown }).__clickAndSampleVt =
			(href: string, waitMs = 1200): Promise<VtSample[]> =>
				new Promise((resolve) => {
					const samples: VtSample[] = [];
					const seen = new Set<string>();
					const start = performance.now();
					const record = () => {
						// Transition teardown races (destroyed pseudo-elements
						// mid-swap) must not kill the sampler loop.
						try {
							for (const animation of document.getAnimations()) {
								const effect = animation.effect as KeyframeEffect | null;
								if (!effect) continue;
								const pseudo = effect.pseudoElement ?? "";
								if (!pseudo.includes("view-transition")) continue;
								const timing = effect.getComputedTiming();
								const keyframes =
									(effect.getKeyframes() as Record<string, string>[]) ?? [];
								const properties = [
									...new Set(
										keyframes.flatMap((frame: Record<string, string>) =>
											Object.keys(frame).filter(
												(key) =>
													![
														"offset",
														"composite",
														"easing",
														"computedOffset",
													].includes(key),
											),
										),
									),
								].sort();
								const key = `${pseudo}|${timing.delay}|${timing.duration}|${timing.endDelay}|${properties.join(",")}`;
								if (seen.has(key)) continue;
								seen.add(key);
								samples.push({
									pseudo,
									delay: Number(timing.delay),
									duration: Number(timing.duration),
									endDelay: Number(timing.endDelay),
									properties,
								});
							}
						} catch {
							// ignore per-frame teardown errors
						}
					};
					const frame = () => {
						record();
						if (performance.now() - start < waitMs) {
							requestAnimationFrame(frame);
						} else {
							resolve(samples);
						}
					};
					requestAnimationFrame(frame);
					const link =
						document.querySelector<HTMLAnchorElement>(`a[href="${href}"]`) ??
						Object.assign(document.createElement("a"), { href });
					if (!link.isConnected) document.body.append(link);
					link.click();
				});
	});
}

const sampleVt = (page: Page, href: string) =>
	page.evaluate(
		(hrefToClick) =>
			(
				window as unknown as {
					__clickAndSampleVt: (href: string) => Promise<VtSample[]>;
				}
			).__clickAndSampleVt(hrefToClick),
		href,
	);

const VIEWS: [string, string][] = [
	["/about", "About"],
	["/resume", "Resume"],
	["/projects", "Projects"],
	["/skills", "Skills"],
];

test.describe("game shell and view routes", () => {
	test("shell renders exactly four menu links to the four view routes", async ({
		page,
	}) => {
		await page.goto("/");
		const menu = page.getByRole("navigation", { name: "Game menu" });
		await expect(menu.getByRole("link")).toHaveCount(4);
		for (const [path, label] of VIEWS) {
			await expect(menu.getByRole("link", { name: label })).toHaveAttribute(
				"href",
				path,
			);
		}
	});

	test("every view route is directly reachable with its heading and a single main", async ({
		page,
	}) => {
		for (const [path, label] of VIEWS) {
			await page.goto(path);
			await expect(
				page.getByRole("heading", { level: 1, name: label }),
			).toBeVisible();
			await expect(page.getByRole("main")).toHaveCount(1);
			await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
		}
	});

	test("zero-JS: the shell is a plain link list that still navigates", async ({
		browser,
	}) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		await page.goto("/");
		const menu = page.getByRole("navigation", { name: "Game menu" });
		for (const [path, label] of VIEWS) {
			await expect(menu.getByRole("link", { name: label })).toHaveAttribute(
				"href",
				path,
			);
		}
		await page.getByRole("link", { name: "About" }).click();
		await expect(page).toHaveURL(/\/about$/);
		await expect(
			page.getByRole("heading", { level: 1, name: "About" }),
		).toBeVisible();
		await context.close();
	});

	test("Tab focus is confined within the shell menu while active", async ({
		page,
	}) => {
		await page.goto("/");
		const menu = page.getByRole("navigation", { name: "Game menu" });
		for (let index = 0; index < 12; index += 1) {
			await page.keyboard.press("Tab");
			expect(
				await menu.evaluate((el) => el.contains(document.activeElement)),
			).toBe(true);
		}
	});

	test("inactive screens never intercept shell keys", async ({ page }) => {
		await page.goto("/about");
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("ArrowUp");
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(/\/about$/);
	});

	test("native Back returns to the shell", async ({ page }) => {
		await page.goto("/");
		await page
			.getByRole("navigation", { name: "Game menu" })
			.getByRole("link", { name: "Projects" })
			.click();
		await expect(page).toHaveURL(/\/projects$/);
		await page.goBack();
		await expect(page).toHaveURL(/\/$/);
		await expect(
			page.getByRole("navigation", { name: "Game menu" }),
		).toBeVisible();
	});

	test("ABOUT renders the role and focus areas from site config", async ({
		page,
	}) => {
		await page.goto("/about");
		await expect(
			page.getByText("Backend & Full-Stack Engineer", { exact: true }),
		).toBeVisible();
		for (const area of [
			"Go",
			"TypeScript",
			"Python",
			"clean architecture",
			"API design",
		]) {
			await expect(page.getByText(area, { exact: true })).toBeVisible();
		}
	});

	test("SKILLS renders a fixed seven-slot recycled list with listbox semantics and no page growth", async ({
		page,
	}) => {
		await page.goto("/skills");
		// Exactly seven persistent slot options; the 22 fallback cards and
		// any data-list-item hooks are gone from the enhanced DOM (view.ts
		// no-ops on Skills).
		await expect(page.locator("[data-skill-slot]")).toHaveCount(7);
		await expect(page.locator("[data-skill-card]")).toHaveCount(0);
		await expect(page.locator("[data-list-item]")).toHaveCount(0);
		await expect(page.locator("[data-detail-panel]")).toHaveCount(0);
		// Listbox contract: role=listbox list, option slots with setsize.
		await expect(page.locator("[data-list]")).toHaveAttribute(
			"role",
			"listbox",
		);
		await expect(page.locator("[data-skill-slot]").first()).toHaveAttribute(
			"role",
			"option",
		);
		await expect(page.locator("[data-skill-slot]").first()).toHaveAttribute(
			"aria-setsize",
			"22",
		);
		// The enhanced stage is fixed and non-scrolling; the page never
		// grows horizontally or vertically.
		const stage = await page.evaluate(() => {
			const region = document.querySelector(".skills-scroll-region");
			const vp = document.querySelector("[data-skills-viewport]");
			if (!region || !vp) return null;
			return {
				regionHeight: region.getBoundingClientRect().height,
				vpHeight: vp.getBoundingClientRect().height,
				scrollTop: vp.scrollTop,
				overflow: getComputedStyle(vp).overflow,
				docScrollWidth: document.documentElement.scrollWidth,
				innerWidth: window.innerWidth,
				docScrollHeight: document.documentElement.scrollHeight,
				innerHeight: window.innerHeight,
			};
		});
		expect(stage).not.toBeNull();
		expect(stage!.regionHeight).toBeCloseTo(stage!.vpHeight, 0);
		expect(stage!.overflow).toBe("hidden");
		expect(stage!.scrollTop).toBe(0);
		expect(stage!.docScrollWidth).toBeLessThanOrEqual(stage!.innerWidth);
		expect(stage!.docScrollHeight).toBeLessThanOrEqual(stage!.innerHeight);
		// Initial window: skills 1..7 — slot 1 shows Go/Backend/RANK 4 and
		// carries the active + focus state.
		const first = page.locator("[data-skill-slot]").first();
		await expect(first.getByText("Go", { exact: true })).toBeVisible();
		await expect(first.getByText("Backend", { exact: true })).toBeVisible();
		await expect(first.getByText("RANK", { exact: true })).toBeVisible();
		await expect(first.locator(".skill-card-rank-value")).toHaveText("4");
		await expect(first).toBeFocused();
		await expect(first).toHaveAttribute("aria-selected", "true");
		// The window is scoped, not the whole list: all seven visible slots
		// are the backend group's first entries (9 exist in the data).
		await expect(page.getByText("Backend", { exact: true })).toHaveCount(7);
	});

	test("SKILLS ships the 22 skill records once in the inline data blob", async ({
		page,
	}) => {
		await page.goto("/skills");
		const data = await page.evaluate(() => {
			const el = document.getElementById("skills-data");
			if (!el) return null;
			return JSON.parse(el.textContent ?? "");
		});
		expect(data).not.toBeNull();
		expect(data).toHaveLength(22);
		expect(data[0]).toEqual({ name: "Go", category: "Backend", rank: 4 });
		expect(data[21]).toEqual({ name: "Vitest", category: "Tooling", rank: 2 });
		const ranks = (data as { rank: number }[]).map((entry) => entry.rank);
		for (const rank of ranks) {
			expect([1, 2, 3, 4]).toContain(rank);
		}
	});

	test("SKILLS slot geometry is fixed: card boxes never move as the window advances", async ({
		page,
	}) => {
		await page.goto("/skills");
		const boxes = () =>
			page.locator("[data-skill-slot]").evaluateAll((els) =>
				els.map((el) => {
					const rect = el.getBoundingClientRect();
					return { x: rect.x, y: rect.y, w: rect.width, h: rect.height };
				}),
			);
		const before = await boxes();
		// Moving focus through the slots never moves their boxes.
		for (let i = 0; i < 6; i += 1) {
			await page.keyboard.press("ArrowDown");
		}
		expect(await boxes()).toEqual(before);
		// Advancing the data window (2..8) updates content, not geometry.
		await page.keyboard.press("ArrowDown");
		expect(await boxes()).toEqual(before);
		// Uniform card sizes on the diagonal stage.
		expect(before[6]!.w).toBeCloseTo(before[0]!.w, 0);
		expect(before[6]!.h).toBeCloseTo(before[0]!.h, 0);
		// The diagonal stagger still leans within the window.
		expect(before[1]!.x).toBeGreaterThan(before[0]!.x);
		expect(before[1]!.y).toBeGreaterThan(before[0]!.y);
		// The stage is bounded by seven row pitches and may be shorter when the
		// fixed view header leaves less room than the ideal card stack.
		const stage = await page.evaluate(() => {
			const region = document.querySelector(".skills-scroll-region");
			const vp = document.querySelector("[data-skills-viewport]");
			if (!region || !vp) return null;
			const style = getComputedStyle(region);
			const fontSize = parseFloat(
				getComputedStyle(document.documentElement).fontSize,
			);
			const rem = (value: string) => parseFloat(value) * fontSize;
			return {
				vpHeight: vp.getBoundingClientRect().height,
				regionHeight: region.getBoundingClientRect().height,
				pitch:
					rem(style.getPropertyValue("--skill-card-height")) +
					rem(style.getPropertyValue("--skill-row-gap")),
			};
		});
		expect(stage).not.toBeNull();
		expect(stage!.regionHeight).toBeCloseTo(stage!.vpHeight, 0);
		expect(stage!.vpHeight).toBeLessThanOrEqual(7 * stage!.pitch);
		// Coarse/mobile layouts collapse the stagger into a straight column.
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto("/skills");
		const mobile = await boxes();
		expect(Math.abs(mobile[1]!.x - mobile[0]!.x)).toBeLessThanOrEqual(1);
	});

	test("SKILLS active slot shows the red geometric parallelogram behind it", async ({
		page,
	}) => {
		await page.goto("/skills");
		// After hydration exactly one slot carries the active presence; the
		// CSS keys on it (the ::before lives on the slot's <li>, the
		// button's parent).
		await expect(page.locator("[data-skill-slot][data-active]")).toHaveCount(1);
		const active = page
			.locator("[data-skill-slot][data-active]")
			.first()
			.locator("xpath=..");
		const shadow = await active.evaluate((el) => {
			const style = getComputedStyle(el, "::before");
			return {
				background: style.backgroundColor,
				boxShadow: style.boxShadow,
				opacity: style.opacity,
				pointerEvents: style.pointerEvents,
				transform: style.transform,
			};
		});
		// Geometry, not a CSS box-shadow: a red layer offset behind the card.
		expect(shadow.opacity).toBe("1");
		expect(shadow.background).toBe("rgb(228, 0, 43)");
		expect(shadow.boxShadow).toBe("none");
		expect(shadow.transform).not.toBe("none");
		// The decorative layer never intercepts pointers.
		expect(shadow.pointerEvents).toBe("none");
		const inactive = page
			.locator("[data-skill-slot]:not([data-active])")
			.first()
			.locator("xpath=..");
		const inactiveOpacity = await inactive.evaluate(
			(el) => getComputedStyle(el, "::before").opacity,
		);
		expect(inactiveOpacity).toBe("0");
	});

	test("SKILLS arrows: six moves traverse the slots, the seventh advances the window, and it wraps; Escape returns to the menu", async ({
		page,
	}) => {
		await page.goto("/skills");
		const slots = page.locator("[data-skill-slot]");
		const names = () =>
			page.locator("[data-skill-slot] .block").allTextContents();
		const initial = [
			"Go",
			"Python",
			"TypeScript",
			"Node.js",
			"FastAPI",
			"SQLAlchemy 2",
			"Alembic",
		];
		await expect(slots.first()).toBeFocused();
		expect(await names()).toEqual(initial);
		// Slots 2..7: six ArrowDowns move focus with NO content/window change.
		for (let i = 1; i <= 6; i += 1) {
			await page.keyboard.press("ArrowDown");
			await expect(slots.nth(i)).toBeFocused();
			expect(await names()).toEqual(initial);
		}
		// The 7th ArrowDown advances the window to skills 2..8; focus stays
		// visually on slot 7, whose content becomes skill 8 (Appwrite).
		await page.keyboard.press("ArrowDown");
		await expect(slots.nth(6)).toBeFocused();
		expect(await names()).toEqual([
			"Python",
			"TypeScript",
			"Node.js",
			"FastAPI",
			"SQLAlchemy 2",
			"Alembic",
			"Appwrite",
		]);
		await expect(slots.nth(6)).toHaveAttribute("aria-posinset", "8");
		// Repeated moves reach the last skill (22) and wrap last -> first.
		for (let i = 0; i < 14; i += 1) {
			await page.keyboard.press("ArrowDown");
		}
		expect(await names()).toEqual([
			"Docker Compose",
			"Git",
			"GitHub Actions",
			"pnpm",
			"Biome",
			"Playwright",
			"Vitest",
		]);
		await expect(slots.nth(6)).toHaveAttribute("aria-posinset", "22");
		await page.keyboard.press("ArrowDown");
		expect(await names()).toEqual(initial);
		await expect(slots.first()).toBeFocused();
		// Enter keeps the list primary: no detail panel opens.
		await page.keyboard.press("Enter");
		await expect(page.locator("[data-detail-panel]")).toHaveCount(0);
		// With no panel to close, Escape leaves the view for the shell.
		await page.keyboard.press("Escape");
		await expect(page).toHaveURL(/\/$/);
	});

	test("SKILLS ArrowUp mirrors at slot 1 and wraps first -> last", async ({
		page,
	}) => {
		await page.goto("/skills");
		const slots = page.locator("[data-skill-slot]");
		const names = () =>
			page.locator("[data-skill-slot] .block").allTextContents();
		// From the initial window, ArrowUp wraps first -> last: window
		// 16..22 with focus on slot 7.
		await page.keyboard.press("ArrowUp");
		await expect(slots.nth(6)).toBeFocused();
		expect(await names()).toEqual([
			"Docker Compose",
			"Git",
			"GitHub Actions",
			"pnpm",
			"Biome",
			"Playwright",
			"Vitest",
		]);
		// Six ArrowUps walk focus up inside the window with no content change.
		for (let i = 5; i >= 0; i -= 1) {
			await page.keyboard.press("ArrowUp");
			await expect(slots.nth(i)).toBeFocused();
			expect(await names()).toEqual([
				"Docker Compose",
				"Git",
				"GitHub Actions",
				"pnpm",
				"Biome",
				"Playwright",
				"Vitest",
			]);
		}
		// Further ArrowUps shift the window back one skill per press, focus
		// stuck to slot 1, until the initial window is restored.
		await page.keyboard.press("ArrowUp"); // window 15..21
		expect(await names()).toEqual([
			"Docker",
			"Docker Compose",
			"Git",
			"GitHub Actions",
			"pnpm",
			"Biome",
			"Playwright",
		]);
		await expect(slots.first()).toBeFocused();
		for (let i = 0; i < 14; i += 1) {
			await page.keyboard.press("ArrowUp");
		}
		expect(await names()).toEqual([
			"Go",
			"Python",
			"TypeScript",
			"Node.js",
			"FastAPI",
			"SQLAlchemy 2",
			"Alembic",
		]);
		await expect(slots.first()).toBeFocused();
	});

	test("SKILLS click selects the slot in place without stealing unrelated focus", async ({
		page,
	}) => {
		await page.goto("/skills");
		// Focus the back-to-menu link (outside the window).
		await page.locator('a[href="/"]').focus();
		await expect(page.locator('a[href="/"]')).toBeFocused();
		// Clicking a slot moves active + focus to it; the window never moves.
		const third = page.locator("[data-skill-slot]").nth(2);
		await third.click();
		await expect(third).toHaveAttribute("data-active", /.*/);
		await expect(third).toBeFocused();
		await expect(third).toHaveAttribute("aria-selected", "true");
		await expect(third).toHaveAttribute("aria-posinset", "3");
		// Window unchanged by clicks: content stays skills 1..7.
		expect(
			await page.locator("[data-skill-slot] .block").allTextContents(),
		).toEqual([
			"Go",
			"Python",
			"TypeScript",
			"Node.js",
			"FastAPI",
			"SQLAlchemy 2",
			"Alembic",
		]);
	});

	test("CONTACT is no longer a generated page: /contact resolves through the normal 404 behavior", async ({
		page,
	}) => {
		const response = await page.goto("/contact");
		expect(response?.status()).toBe(404);
		await expect(
			page.getByRole("heading", { level: 1, name: "404" }),
		).toBeVisible();
	});

	test("PROJECTS renders the four projects once in declared order", async ({
		page,
	}) => {
		await page.goto("/projects");
		const items = page.locator("[data-list-item]");
		await expect(items).toHaveCount(4);
		expect(await items.allTextContents()).toEqual([
			"ServiceFlow",
			"WealthQuest",
			"EventCommerce",
			"Fintual Sensor",
		]);
		for (const name of [
			"ServiceFlow",
			"WealthQuest",
			"EventCommerce",
			"Fintual Sensor",
		]) {
			await expect(page.getByRole("button", { name })).toHaveCount(1);
		}
	});

	test("/projects#slug preselects the matching project detail", async ({
		page,
	}) => {
		await page.goto("/projects#serviceflow");
		await expect(
			page.locator("[data-detail-panel][data-active]"),
		).toContainText("ServiceFlow");
		await page.goto("/projects#wealthquest");
		await expect(
			page.locator("[data-detail-panel][data-active]"),
		).toContainText("WealthQuest");
	});

	test("Escape closes an open panel first, then returns to the menu", async ({
		page,
	}) => {
		await page.goto("/projects");
		await page.getByRole("button", { name: "ServiceFlow" }).focus();
		await page.keyboard.press("Enter");
		await expect(page.locator("[data-detail-panel][data-active]")).toHaveCount(
			1,
		);
		await expect(
			page.locator("[data-detail-panel][data-active]"),
		).toBeFocused();
		await page.keyboard.press("Escape");
		await expect(page.locator("[data-detail-panel][data-active]")).toHaveCount(
			0,
		);
		await expect(
			page.getByRole("button", { name: "ServiceFlow" }),
		).toBeFocused();
		await page.keyboard.press("Escape");
		await expect(page).toHaveURL(/\/$/);
	});

	test("Escape on a plain view returns to the menu", async ({ page }) => {
		await page.goto("/about");
		await page.keyboard.press("Escape");
		await expect(page).toHaveURL(/\/$/);
	});

	test("unknown paths render the 404 page with a single back action", async ({
		page,
	}) => {
		const response = await page.goto("/missing-page-xyz");
		expect(response?.status()).toBe(404);
		await expect(
			page.getByRole("heading", { level: 1, name: "404" }),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Back to home" }),
		).toHaveAttribute("href", "/");
	});
});

// SKILLS overlay scrollbar (skills contract): the list owns its scroll
// viewport — .skills-viewport scrolls while the view header stays fixed —
// with native scrollbar visuals hidden and a small diagonal custom thumb
// near the list's lower-left. The thumb is decorative (aria-hidden, never a
// tab stop), appears only on hover/focus when the list overflows, mirrors
// scrollTop, and can be dragged. Browser overlay scrollbars make paint
// assertions unreliable, so these tests assert DOM geometry, computed CSS,
// and scroll metrics instead of screenshots.
test.describe("SKILLS diagonal scrollbar (fixed affordance)", () => {
	const viewport = (page: Page) => page.locator("[data-skills-viewport]");
	const track = (page: Page) => page.locator("[data-skills-scrollbar]");
	const thumb = (page: Page) => page.locator("[data-skills-thumb]");

	test("the enhanced list never scrolls: scrollTop stays 0 and the page does not scroll", async ({
		page,
	}) => {
		await page.goto("/skills");
		const vp = viewport(page);
		// Fixed stage: overflow hidden, no native scrolling.
		const metrics = await vp.evaluate((el) => ({
			overflow: getComputedStyle(el).overflow,
			scrollTop: el.scrollTop,
		}));
		expect(metrics.overflow).toBe("hidden");
		expect(metrics.scrollTop).toBe(0);
		// Wheel over the list emits transitions but never scrolls anything.
		await vp.hover();
		await page.mouse.wheel(0, 300);
		await page.mouse.wheel(0, -300);
		await expect.poll(() => vp.evaluate((el) => el.scrollTop)).toBe(0);
		expect(await page.evaluate(() => window.scrollY)).toBe(0);
		// main and the page have no scroll container of their own.
		const main = await page.locator("main").evaluate((el) => ({
			overflowY: getComputedStyle(el).overflowY,
			scrollHeight: el.scrollHeight,
			clientHeight: el.clientHeight,
		}));
		expect(main.overflowY).not.toBe("auto");
		expect(main.scrollHeight).toBeLessThanOrEqual(main.clientHeight);
	});

	test("the scrollbar is a fixed decorative affordance: static thumb, no drag, no pointer targets", async ({
		page,
	}) => {
		await page.goto("/skills");
		const vp = viewport(page);
		// Revealed on hover or focus within the list.
		await vp.hover();
		await expect(track(page)).toBeVisible();
		await expect(thumb(page)).toBeVisible();
		const vpBox = await vp.boundingBox();
		const trackBox = await track(page).boundingBox();
		const thumbBox = await thumb(page).boundingBox();
		if (!vpBox || !trackBox || !thumbBox) {
			throw new Error("expected visible viewport, track, and thumb boxes");
		}
		// Near the list's lower-left — not the page edge.
		expect(trackBox.x - vpBox.x).toBeGreaterThanOrEqual(0);
		expect(trackBox.x - vpBox.x).toBeLessThan(24);
		expect(
			vpBox.y + vpBox.height - (trackBox.y + trackBox.height),
		).toBeLessThan(24);
		// The track is a short horizontal diagonal, not a page scrollbar.
		expect(trackBox.width).toBeGreaterThan(80);
		expect(trackBox.height).toBeLessThan(trackBox.width);
		// The thumb mirrors the recycled window progress without becoming a
		// native drag target.
		expect(thumbBox.height).toBeLessThan(trackBox.height);
		const beforeLeft = await thumb(page).evaluate((el) =>
			getComputedStyle(el).getPropertyValue("--skills-thumb-left"),
		);
		// Diagonal geometry: the thumb is clipped to a parallelogram.
		const clipPath = await thumb(page).evaluate(
			(el) => getComputedStyle(el).clipPath,
		);
		expect(clipPath).toMatch(/polygon/);
		// Decorative: aria-hidden, never a tab stop, never a pointer target.
		await expect(track(page)).toHaveAttribute("aria-hidden", "true");
		expect(
			await thumb(page).evaluate((el) => el.getAttribute("tabindex")),
		).toBeNull();
		expect(
			await track(page).evaluate((el) => getComputedStyle(el).pointerEvents),
		).toBe("none");
		expect(
			await thumb(page).evaluate((el) => getComputedStyle(el).pointerEvents),
		).toBe("none");
		// Window steps change progress, never the thumb's interaction contract.
		for (let i = 0; i < 8; i += 1) await page.keyboard.press("ArrowDown");
		const after = await thumb(page).boundingBox();
		const afterLeft = await thumb(page).evaluate((el) =>
			getComputedStyle(el).getPropertyValue("--skills-thumb-left"),
		);
		expect(afterLeft).not.toBe(beforeLeft);
		expect(after?.y).toBeDefined();
		expect(after?.height).toBe(thumbBox.height);
		expect(await vp.evaluate((el) => el.scrollTop)).toBe(0);
	});

	test("the fixed seven-slot window never grows on tall screens", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1280, height: 2400 });
		await page.goto("/skills");
		const tall = await viewport(page).evaluate(
			(el) => el.getBoundingClientRect().height,
		);
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto("/skills");
		const defaultHeight = await viewport(page).evaluate(
			(el) => el.getBoundingClientRect().height,
		);
		expect(tall).toBeGreaterThanOrEqual(defaultHeight);
		expect(tall).toBeLessThanOrEqual(7 * 97);
		// The stage fits exactly seven row pitches (card + gap).
		const pitch = await viewport(page).evaluate((el) => {
			const style = getComputedStyle(el.closest(".skills-scroll-region")!);
			const fontSize = parseFloat(
				getComputedStyle(document.documentElement).fontSize,
			);
			const rem = (value: string) => parseFloat(value) * fontSize;
			return (
				rem(style.getPropertyValue("--skill-card-height")) +
				rem(style.getPropertyValue("--skill-row-gap"))
			);
		});
		expect(defaultHeight).toBeLessThanOrEqual(7 * pitch);
	});

	test("no horizontal overflow exists on the list or the page", async ({
		page,
	}) => {
		await page.goto("/skills");
		const metrics = await viewport(page).evaluate((el) => ({
			scrollWidth: el.scrollWidth,
			clientWidth: el.clientWidth,
		}));
		expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
		const doc = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			innerWidth: window.innerWidth,
		}));
		expect(doc.scrollWidth).toBeLessThanOrEqual(doc.innerWidth);
	});

	test.describe("coarse pointer", () => {
		test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

		test("custom scrollbar never renders; the seven slots still work", async ({
			page,
		}) => {
			await page.goto("/skills");
			expect(
				await track(page).evaluate((el) => getComputedStyle(el).display),
			).toBe("none");
			await expect(page.locator("[data-skill-slot]")).toHaveCount(7);
			// Keyboard navigation still works on coarse pointers.
			await page.locator("[data-skill-slot]").first().focus();
			await page.keyboard.press("ArrowDown");
			await expect(page.locator("[data-skill-slot]").nth(1)).toBeFocused();
		});
	});
});

// SKILLS recycled seven-slot list (skills contract): the enhanced UI is a
// fixed-slot recycled list — seven persistent slot buttons whose
// text/category/rank content is updated as the data window advances. Wheel
// and keyboard drive the same discrete one-step transitions; there is no
// scrollTop and no native scrollbar. The no-JS fallback keeps all 22 cards
// in normal document flow.
test.describe("SKILLS recycled seven-slot list", () => {
	const viewport = (page: Page) => page.locator("[data-skills-viewport]");
	const slots = (page: Page) => page.locator("[data-skill-slot]");
	const names = (page: Page) =>
		page.locator("[data-skill-slot] .block").allTextContents();
	const initialWindow = [
		"Go",
		"Python",
		"TypeScript",
		"Node.js",
		"FastAPI",
		"SQLAlchemy 2",
		"Alembic",
	];

	test("wheel emits one discrete transition per threshold; scrollTop and page scroll stay 0; ctrl+wheel is untouched", async ({
		page,
	}) => {
		await page.goto("/skills");
		await expect(slots(page).first()).toBeFocused();
		await viewport(page).hover();
		const scrollState = () =>
			page.evaluate(() => ({
				vp: document.querySelector("[data-skills-viewport]")?.scrollTop ?? -1,
				page: window.scrollY,
			}));
		// One threshold step (53px) moves focus to slot 2; nothing scrolls.
		await page.mouse.wheel(0, 53);
		await expect(slots(page).nth(1)).toBeFocused();
		expect(await scrollState()).toEqual({ vp: 0, page: 0 });
		// Sub-threshold deltas accumulate across events (40 + 40 + 40 emits
		// two steps, carrying the remainder).
		await page.mouse.wheel(0, 40);
		await expect(slots(page).nth(1)).toBeFocused();
		await page.mouse.wheel(0, 40);
		await expect(slots(page).nth(2)).toBeFocused();
		await page.mouse.wheel(0, 40);
		await expect(slots(page).nth(3)).toBeFocused();
		// One large delta emits one step only (53 * 3 + 10).
		await page.mouse.wheel(0, 169);
		await expect(slots(page).nth(4)).toBeFocused();
		// Wheel down at the bottom slot advances the data window.
		for (let i = 0; i < 3; i += 1) await page.mouse.wheel(0, 53);
		await expect(slots(page).nth(6)).toBeFocused();
		await page.mouse.wheel(0, 53);
		expect(await names(page)).toEqual([
			"TypeScript",
			"Node.js",
			"FastAPI",
			"SQLAlchemy 2",
			"Alembic",
			"Appwrite",
			"AMQP",
		]);
		// Wheel up mirrors: from a slot stuck to the bottom edge, up-steps
		// first walk focus up inside the window (carrying the accumulated
		// remainder); only when focus reaches slot 1 does the window shift
		// back one skill per press.
		await page.mouse.wheel(0, -53); // absorbed: no step yet (remainder)
		expect(await names(page)).toEqual([
			"TypeScript",
			"Node.js",
			"FastAPI",
			"SQLAlchemy 2",
			"Alembic",
			"Appwrite",
			"AMQP",
		]);
		await page.mouse.wheel(0, -53); // focus slot 5 (sixth visible)
		await expect(slots(page).nth(5)).toBeFocused();
		expect(await names(page)).toEqual([
			"TypeScript",
			"Node.js",
			"FastAPI",
			"SQLAlchemy 2",
			"Alembic",
			"Appwrite",
			"AMQP",
		]);
		// Walk focus up to slot 1...
		for (let i = 0; i < 4; i += 1) {
			await page.mouse.wheel(0, -53);
		}
		await expect(slots(page).nth(1)).toBeFocused();
		expect(await names(page)).toEqual([
			"TypeScript",
			"Node.js",
			"FastAPI",
			"SQLAlchemy 2",
			"Alembic",
			"Appwrite",
			"AMQP",
		]);
		// ...then the window shifts back to skills 1..7.
		await page.mouse.wheel(0, -53); // within-window move to the top slot
		await expect(slots(page).first()).toBeFocused();
		expect(await names(page)).toEqual([
			"TypeScript",
			"Node.js",
			"FastAPI",
			"SQLAlchemy 2",
			"Alembic",
			"Appwrite",
			"AMQP",
		]);
		await page.mouse.wheel(0, -53); // one more step toward the first window
		expect(await names(page)).toEqual([
			"Python",
			"TypeScript",
			"Node.js",
			"FastAPI",
			"SQLAlchemy 2",
			"Alembic",
			"Appwrite",
		]);
		await expect(slots(page).first()).toBeFocused();
		// scrollTop and page scroll never move.
		expect(await scrollState()).toEqual({ vp: 0, page: 0 });
		// Ctrl+wheel is never hijacked: content and focus stay put.
		await page.keyboard.down("Control");
		await page.mouse.wheel(0, 400);
		await page.keyboard.up("Control");
		expect(await names(page)).toEqual([
			"Python",
			"TypeScript",
			"Node.js",
			"FastAPI",
			"SQLAlchemy 2",
			"Alembic",
			"Appwrite",
		]);
		expect(await scrollState()).toEqual({ vp: 0, page: 0 });
	});

	test("click and hover effects fire once per slot, never duplicated", async ({
		page,
	}) => {
		// In-page hook counting every effect play() attempt (see
		// navigation-sounds.spec.ts): response counting can only see the
		// first fetch of a buffered effect.
		await page.addInitScript(() => {
			const seen: string[] = [];
			(globalThis as { __effectPlays?: string[] }).__effectPlays = seen;
			const original = HTMLMediaElement.prototype.play;
			HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
				const src = this.src;
				if (src.includes("button_select")) seen.push("select");
				else if (src.includes("button_click")) seen.push("click");
				else if (src.includes("menu_close")) seen.push("close");
				return original.call(this);
			};
		});
		const plays = (name: string) =>
			page.evaluate((effect) => {
				const seen = (globalThis as { __effectPlays?: string[] }).__effectPlays;
				return (seen ?? []).filter((entry) => entry === effect).length;
			}, name);
		await page.goto("/skills");
		await expect(slots(page).first()).toBeFocused();
		// Clicking a slot plays the click effect exactly once (delegated
		// wiring; the controller itself never plays it). The pre-click
		// hover plays one select.
		await slots(page).nth(2).click();
		await expect.poll(() => plays("click")).toBe(1);
		await expect.poll(() => plays("select")).toBe(1);
		// Hover select: once per slot on fine pointers.
		await slots(page).nth(3).hover();
		await expect.poll(() => plays("select")).toBe(2);
		await slots(page).nth(4).hover();
		await expect.poll(() => plays("select")).toBe(3);
		// Moving between the descendants of one slot stays silent. The probe
		// points sit well inside the slot's bounding box: the cards are
		// skewed (skewX +8°), so the AABB corners lie OUTSIDE the painted
		// parallelogram and a point near them would leave the slot.
		const box = await slots(page).nth(4).boundingBox();
		if (!box) throw new Error("expected a slot bounding box");
		await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.65);
		await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.35);
		await page.waitForTimeout(300);
		expect(await plays("select")).toBe(3);
		// Keyboard arrow moves play exactly one select per transition.
		await page.keyboard.press("ArrowDown");
		await expect.poll(() => plays("select")).toBe(4);
		// The red layer always paints behind the active slot.
		const red = await page
			.locator("[data-skill-slot][data-active]")
			.first()
			.locator("xpath=..")
			.evaluate((el) => getComputedStyle(el, "::before").opacity);
		expect(red).toBe("1");
	});

	test("no-JS: the fallback keeps all 22 skills in normal document flow", async ({
		browser,
	}) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto("/skills");
		// All 22 cards render; the enhanced UI and its gate are absent.
		await expect(page.locator("[data-skill-card]")).toHaveCount(22);
		await expect(page.locator("[data-skill-slot]")).toHaveCount(0);
		await expect(page.locator("[data-skills-enhanced]")).toHaveCount(0);
		await expect(page.locator('[data-list][role="listbox"]')).toHaveCount(0);
		// Content stays in flow: the page scrolls to the last card.
		const scrollable = await page.evaluate(
			() => document.documentElement.scrollHeight > window.innerHeight,
		);
		expect(scrollable).toBe(true);
		await page.evaluate(() =>
			window.scrollTo(0, document.documentElement.scrollHeight),
		);
		await expect(page.getByText("Vitest", { exact: true })).toBeVisible();
		await context.close();
	});
});

// SKILLS field watermark (skills contract): one giant DEVELOPER word in the
// display face (Anton, same typography as the shell's PORTFOLIO watermark)
// rotated along the white parallelogram's diagonal, anchored in the lower
// white field. Structure: an outer full-viewport mask (.skills-watermark)
// clipped with the SAME polygon as the white field's ::before cutout — both
// consume the shared --skills-band-polygon — and an inner word span
// (.skills-watermark-text) that carries the typography, alignment, and
// rotation. Purely decorative: aria-hidden in the markup, pointer-events
// none, user-select none, painted behind the cards inside an isolated
// stacking context. It renders on /skills alone — every other route keeps
// its own surface (the shell's PORTFOLIO watermark is asserted in
// keyboard.spec.ts; this word must never leak onto other views).
test.describe("SKILLS decorative DEVELOPER watermark", () => {
	const watermark = (page: Page) => page.locator(".skills-watermark");
	const word = (page: Page) => page.locator(".skills-watermark-text");
	// Serialization-safe polygon check: browsers may normalize spacing, "%"
	// suffixes, or unitless zeros to "0px", so parse coordinate pairs.
	const polygonPoints = (clipPath: string) =>
		[...clipPath.matchAll(/(-?[\d.]+)(?:%|px)?\s+(-?[\d.]+)(?:%|px)?/g)].map(
			(m) => [Number.parseFloat(m[1]), Number.parseFloat(m[2])],
		);
	const near = (actual: number, expected: number) =>
		Math.abs(actual - expected) <= 3;

	test("one masked outer plus one DEVELOPER inner, hidden and non-interactive", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto("/skills");
		// Exactly one outer mask and one inner word.
		await expect(watermark(page)).toHaveCount(1);
		await expect(word(page)).toHaveCount(1);
		await expect(word(page)).toHaveText("DEVELOPER");
		// Hidden from the accessibility tree and never interactive: no
		// tabindex, pointer-events none (clicks fall through), user-select
		// none (never selected as text).
		await expect(watermark(page)).toHaveAttribute("aria-hidden", "true");
		expect(
			await watermark(page).evaluate((el) => el.getAttribute("tabindex")),
		).toBeNull();
		expect(
			await watermark(page).evaluate(
				(el) => getComputedStyle(el).pointerEvents,
			),
		).toBe("none");
		expect(
			await watermark(page).evaluate((el) => getComputedStyle(el).userSelect),
		).toBe("none");
		// The outer is a full-viewport fixed mask: bounding box equals the
		// viewport, clipped by the approved parallelogram.
		const outer = await watermark(page).evaluate((el) => {
			const s = getComputedStyle(el);
			const rect = el.getBoundingClientRect();
			return {
				position: s.position,
				zIndex: s.zIndex,
				clipPath: s.clipPath,
				x: rect.x,
				y: rect.y,
				width: rect.width,
				height: rect.height,
			};
		});
		expect(outer.position).toBe("fixed");
		expect(outer.x).toBe(0);
		expect(outer.y).toBe(0);
		expect(outer.width).toBe(1280);
		expect(outer.height).toBe(720);
		const maskPoints = polygonPoints(outer.clipPath);
		expect(outer.clipPath).toContain("polygon");
		for (const [x, y] of [
			[65, 0],
			[130, 0],
			[65, 100],
			[0, 100],
		]) {
			expect(
				maskPoints.some(([px, py]) => near(px, x) && near(py, y)),
				`watermark mask touches (${x}%, ${y}%)`,
			).toBe(true);
		}
		// The white field cutout and the watermark mask share ONE polygon:
		// both consume --skills-band-polygon, so their computed clip paths
		// are identical and can never drift.
		const glowClip = await page
			.locator(".glow-layer")
			.evaluate((el) => getComputedStyle(el, "::before").clipPath);
		expect(glowClip).toBe(outer.clipPath);
		// The inner word keeps the display face (Anton), a large clamp()
		// size, the diagonal rotation, and a translucent near-black ink
		// (subtle shadow, not content). color-mix serializes as rgba(...)
		// or color(srgb ... / alpha) depending on the engine; either way the
		// trailing alpha must be below 0.5.
		const inner = await word(page).evaluate((el) => {
			const s = getComputedStyle(el);
			return {
				position: s.position,
				left: s.left,
				bottom: s.bottom,
				fontFamily: s.fontFamily,
				fontSize: parseFloat(s.fontSize),
				transform: s.transform,
				color: s.color,
			};
		});
		expect(inner.position).toBe("absolute");
		// left: 57% and bottom: 0 resolve against the full-viewport mask:
		// 57% of 1280px is 729.6px.
		expect(Math.abs(parseFloat(inner.left) - 1280 * 0.57)).toBeLessThanOrEqual(
			1,
		);
		expect(inner.bottom).toBe("0px");
		expect(inner.fontFamily).toContain("Anton");
		expect(inner.fontSize).toBeGreaterThanOrEqual(80);
		// translate(2vw, 2vh) rotate(atan2(-100vh, 65vw)) serializes as one
		// matrix: at 1280×720 the responsive angle resolves to
		// atan2(-720, 832) ≈ -40.9° and the translation to (25.6, 14.4)px.
		// Parsing the matrix proves both the retained diagonal rotation and
		// the small shift toward the boundary.
		expect(inner.transform).toContain("matrix");
		const m = inner.transform.match(
			/matrix\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/,
		);
		if (!m) throw new Error("expected a 2D matrix transform");
		const [, a, b] = m.map(Number);
		const angle = (Math.atan2(b, a) * 180) / Math.PI;
		expect(Math.abs(angle + 41)).toBeLessThanOrEqual(2);
		expect(Math.abs(Number(m[5]) - 25.6)).toBeLessThanOrEqual(1);
		expect(Math.abs(Number(m[6]) - 14.4)).toBeLessThanOrEqual(1);
		const alpha = Number(inner.color.match(/[\d.]+(?=\)$)/)?.[0]);
		expect(Number.isNaN(alpha)).toBe(false);
		expect(alpha).toBeGreaterThan(0);
		expect(alpha).toBeLessThan(0.5);
		// Explicit stacking context: the view isolates, the mask paints
		// behind it (z-index -1), and it never blocks pointers at its own
		// center — hits fall through to the field below.
		expect(outer.zIndex).toBe("-1");
		const view = page.locator("main");
		expect(await view.evaluate((el) => getComputedStyle(el).isolation)).toBe(
			"isolate",
		);
		const blocked = await watermark(page).evaluate((el) => {
			const rect = el.getBoundingClientRect();
			const hit = document.elementFromPoint(
				rect.x + rect.width / 2,
				rect.y + rect.height / 2,
			);
			return hit === el || el.contains(hit);
		});
		expect(blocked).toBe(false);
	});

	test("4:3 viewport: rotation follows atan2(-100vh, 65vw), mask and route scope intact", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1024, height: 768 });
		await page.goto("/skills");
		// The band edge spans -100vh vertically over 65vw horizontally, so
		// the expected angle is computed from the LIVE viewport: on 4:3 that
		// is atan2(-768, 665.6) ≈ -49.1°, not the 16:9-only -41°.
		const probe = await word(page).evaluate((el) => {
			const s = getComputedStyle(el);
			const outer = getComputedStyle(el.parentElement!);
			return { transform: s.transform, clipPath: outer.clipPath };
		});
		expect(probe.transform).toContain("matrix");
		const m = probe.transform.match(
			/matrix\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/,
		);
		if (!m) throw new Error("expected a 2D matrix transform");
		const [, a, b, , , e, f] = m.map(Number);
		const angle = (Math.atan2(b, a) * 180) / Math.PI;
		const viewport = page.viewportSize()!;
		const expected =
			(Math.atan2(-viewport.height, viewport.width * 0.65) * 180) / Math.PI;
		expect(Math.abs(angle - expected)).toBeLessThanOrEqual(1);
		// 2vw/2vh translation at 1024×768 resolves to (20.48, 15.36)px.
		expect(Math.abs(e - 20.48)).toBeLessThanOrEqual(1);
		expect(Math.abs(f - 15.36)).toBeLessThanOrEqual(1);
		// The word stays clipped at this aspect ratio: the outer mask still
		// consumes the shared band polygon, identical to the white field
		// cutout's, so the two shapes cannot drift apart.
		expect(probe.clipPath).toContain("polygon");
		const maskPoints = polygonPoints(probe.clipPath);
		for (const [x, y] of [
			[65, 0],
			[130, 0],
			[65, 100],
			[0, 100],
		]) {
			expect(
				maskPoints.some(([px, py]) => near(px, x) && near(py, y)),
				`watermark mask touches (${x}%, ${y}%) at 4:3`,
			).toBe(true);
		}
		const glowClip = await page
			.locator(".glow-layer")
			.evaluate((el) => getComputedStyle(el, "::before").clipPath);
		expect(glowClip).toBe(probe.clipPath);
		// Route isolation stays intact at 4:3: the word is a /skills-only
		// decoration and never leaks onto other routes.
		await page.goto("/");
		expect(await watermark(page).count()).toBe(0);
		expect(await word(page).count()).toBe(0);
	});

	test("400×800 viewport: font size follows the band diagonal magnitude, not the width alone", async ({
		page,
	}) => {
		// A width-only size underfills long diagonals on narrow/tall
		// windows: at 400×800 the 14vw term resolves to just 56px, below
		// even the 4rem floor. The size must track the same 65vw/100vh
		// edge vector as the atan2 rotation — hypot(65vw, 100vh) * 0.163,
		// clamped between the 4rem floor and the 18.75rem watermark cap.
		await page.setViewportSize({ width: 400, height: 800 });
		await page.goto("/skills");
		const fontSize = await word(page).evaluate((el) =>
			parseFloat(getComputedStyle(el).fontSize),
		);
		const viewport = page.viewportSize()!;
		const cap = 18.75 * 16; // 300px — the documented watermark maximum.
		const expected = Math.min(
			Math.hypot(viewport.width * 0.65, viewport.height) * 0.163,
			cap,
		);
		// Materially above the 4rem (64px) width-only fallback...
		expect(fontSize).toBeGreaterThan(4 * 16 * 1.5);
		// ...and close to the viewport-derived diagonal magnitude.
		expect(Math.abs(fontSize - expected)).toBeLessThanOrEqual(1);
	});

	test("DEVELOPER renders on /skills only, absent from every other route", async ({
		page,
	}) => {
		for (const path of ["/", "/about", "/resume", "/projects", "/404"]) {
			await page.goto(path);
			expect(await watermark(page).count(), `${path} has no watermark`).toBe(0);
			expect(await word(page).count(), `${path} has no watermark word`).toBe(0);
		}
		await page.goto("/skills");
		await expect(watermark(page)).toHaveCount(1);
		await expect(word(page)).toHaveCount(1);
	});
});

test.describe("RESUME view", () => {
	test("renders the verified CV facts across every section", async ({
		page,
	}) => {
		await page.goto("/resume");
		// Content-region scope: dev-only Astro toolbar buttons live outside
		// <main> and would otherwise inflate the page-wide button count.
		await expect(page.locator("main").getByRole("button")).toHaveCount(5);
		const panel = page.locator("[data-detail-panel][data-active]");

		await expect(panel).toContainText("USACH");
		await expect(panel).toContainText(
			"Ingeniería de Ejecución en Computación e Informática",
		);
		await expect(panel).toContainText("Mar 2020–Apr 2025");
		await expect(panel).toContainText("Mar 2017–Nov 2019");

		await page.getByRole("button", { name: "Experience" }).click();
		await expect(panel).toContainText("Productos Barber Chile");
		await expect(panel).toContainText("2020–2026");
		await expect(panel).toContainText("Policomp");
		await expect(panel).toContainText("Jan–Mar 2020");

		await page.getByRole("button", { name: "Projects" }).click();
		await expect(panel).toContainText("ServiceFlow");
		await expect(panel).toContainText("WealthQuest");
		await expect(panel).toContainText("Academic publication");
		await expect(panel).toContainText("May 2025");

		await page.getByRole("button", { name: "Skills" }).click();
		for (const skill of [
			"Python",
			"Java",
			"Spring Boot",
			"TypeScript/JavaScript",
			"SQL and related tooling",
		]) {
			await expect(panel.getByText(skill, { exact: true })).toBeVisible();
		}

		await page.getByRole("button", { name: "Languages" }).click();
		await expect(panel).toContainText("Spanish");
		await expect(panel).toContainText("native");
		await expect(panel).toContainText("English");
		await expect(panel).toContainText("basic technical reading");
	});

	test("renders no contact-number content in any route's HTML", async ({
		page,
	}) => {
		for (const path of [
			"/",
			"/about",
			"/resume",
			"/projects",
			"/skills",
			"/missing-page-xyz",
		]) {
			await page.goto(path);
			// Dev-server injection (style/script blocks) carries Tailwind
			// utility noise (e.g. cursor-cell, unsplash asset ids); the
			// rendered document surface is the HTML minus those blocks.
			const html = await page
				.content()
				.then((content) =>
					content
						.replace(/<style[\s\S]*?<\/style>/g, "")
						.replace(/<script[\s\S]*?<\/script>/g, ""),
				);

			expect(html, `${path} must not contain tel:`).not.toMatch(/tel:/);
			expect(html, `${path} must not contain 9+ digit runs`).not.toMatch(
				/[0-9]{9,}/,
			);
			expect(html, `${path} must not contain phone words`).not.toMatch(
				/\b(?:telephone|mobile|cell)\b/,
			);
		}
	});

	test("detail panel stacks below the list and scrolls internally on small screens", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 375, height: 720 });
		await page.goto("/resume");

		const listBox = await page.locator("[data-list]").boundingBox();
		const panelBox = await page
			.locator("[data-detail-panel][data-active]")
			.boundingBox();
		if (!listBox || !panelBox) {
			throw new Error("expected visible list and panel boxes");
		}
		expect(panelBox.y).toBeGreaterThanOrEqual(listBox.y + listBox.height);
		const overflowY = await page
			.locator("[data-detail-panel][data-active]")
			.evaluate((el) => getComputedStyle(el).overflowY);
		expect(overflowY).toBe("auto");
	});
});

test.describe("view-transition overlays", () => {
	const assertWithin = (samples: VtSample[], maxMs: number) => {
		expect(samples.length).toBeGreaterThanOrEqual(2);
		for (const sample of samples) {
			expect(sample.pseudo).toMatch(/::view-transition-/);
			expect(
				sample.delay + sample.duration + sample.endDelay,
			).toBeLessThanOrEqual(maxMs);
		}
	};

	test("overlays complete within 400ms between the shell and a view", async ({
		page,
	}) => {
		await installVtSampler(page);
		await page.goto("/");
		const samples = await sampleVt(page, "/about");

		assertWithin(samples, 400);
		// The default overlay is a wipe (transform + opacity), not a fade.
		expect(
			samples.some((sample) => sample.properties.includes("transform")),
		).toBe(true);
		for (const sample of samples) {
			for (const property of sample.properties) {
				expect(["opacity", "transform"]).toContain(property);
			}
		}
		await expect(
			page.getByRole("heading", { level: 1, name: "About" }),
		).toBeVisible();
	});

	test("overlays cover the 404 route within 400ms", async ({ page }) => {
		await installVtSampler(page);
		await page.goto("/");
		const samples = await sampleVt(page, "/missing-page-xyz");

		assertWithin(samples, 400);
		for (const sample of samples) {
			for (const property of sample.properties) {
				expect(["opacity", "transform"]).toContain(property);
			}
		}
		await expect(
			page.getByRole("heading", { level: 1, name: "404" }),
		).toBeVisible();
	});

	// Reduced-motion overlay contract from the authored stylesheet: the
	// html[data-route] rules must declare 200ms opacity-only fades for the
	// outgoing/incoming root snapshots (Chromium's UA skips VT animations
	// entirely under prefers-reduced-motion, so the stylesheet is the
	// contract that browsers without that UA behavior must honor).
	const overlayRules = (page: Page) =>
		page.evaluate(() => {
			const parseCssTime = (value: string): number => {
				const n = Number.parseFloat(value);
				return value.trim().endsWith("ms") ? n : n * 1000;
			};
			const found: {
				selector: string;
				duration: number;
				delay: number;
				keyframes: string[];
			}[] = [];
			const keyframeProps = (name: string): string[] => {
				const props = new Set<string>();
				for (const sheet of document.styleSheets) {
					try {
						for (const rule of sheet.cssRules) {
							if (rule instanceof CSSKeyframesRule && rule.name === name) {
								for (const frame of rule.cssRules) {
									for (const prop of (frame as CSSStyleRule).style) {
										props.add(prop);
									}
								}
							}
						}
					} catch {
						// cross-origin sheet access is not expected in dev
					}
				}
				return [...props];
			};
			const walk = (rules: CSSRuleList) => {
				for (const rule of rules) {
					if (rule instanceof CSSMediaRule) {
						if (!rule.conditionText.includes("reduced-motion: reduce"))
							continue;
						for (const inner of rule.cssRules) {
							if (
								inner instanceof CSSStyleRule &&
								/view-transition-(?:old|new)\(root\)/.test(inner.selectorText)
							) {
								const duration = parseCssTime(inner.style.animationDuration);
								const delay = parseCssTime(inner.style.animationDelay);
								found.push({
									selector: inner.selectorText,
									duration: Number.isNaN(duration) ? 0 : duration,
									delay: Number.isNaN(delay) ? 0 : delay,
									keyframes: keyframeProps(inner.style.animationName),
								});
							}
						}
					}
				}
			};
			for (const sheet of document.styleSheets) {
				try {
					walk(sheet.cssRules);
				} catch {
					// cross-origin sheet access is not expected in dev
				}
			}
			return found;
		});

	test("reduced motion keeps overlays opacity-only at most 200ms, 404 included", async ({
		page,
	}) => {
		await installVtSampler(page);
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/");
		const samples = await sampleVt(page, "/skills");

		if (samples.length > 0) {
			// Browsers that do not natively skip VT animations under reduced
			// motion must run the authored opacity-only <=200ms overlay.
			assertWithin(samples, 200);
			for (const sample of samples) {
				expect(sample.properties).toEqual(["opacity"]);
			}
		} else {
			// Chromium's UA skips VT animations entirely under reduced
			// motion; the stylesheet contract still must hold.
			const rules = await overlayRules(page);
			expect(rules.length).toBeGreaterThanOrEqual(2);
			for (const rule of rules) {
				expect(rule.duration).toBeLessThanOrEqual(200);
				expect(rule.delay).toBe(0);
				for (const property of rule.keyframes) {
					expect(["opacity"]).toContain(property);
				}
			}
		}
		await expect(
			page.getByRole("heading", { level: 1, name: "Skills" }),
		).toBeVisible();

		const notFound = await sampleVt(page, "/missing-page-xyz");
		if (notFound.length > 0) {
			assertWithin(notFound, 200);
			for (const sample of notFound) {
				expect(sample.properties).toEqual(["opacity"]);
			}
		} else {
			const rules = await overlayRules(page);
			expect(rules.length).toBeGreaterThanOrEqual(2);
			for (const rule of rules) {
				expect(rule.duration).toBeLessThanOrEqual(200);
				for (const property of rule.keyframes) {
					expect(["opacity"]).toContain(property);
				}
			}
		}
		await expect(
			page.getByRole("heading", { level: 1, name: "404" }),
		).toBeVisible();
	});

	test("without view-transition support navigation falls back to full-page loads", async ({
		page,
	}) => {
		await page.addInitScript(() => {
			Object.defineProperty(document, "startViewTransition", {
				configurable: true,
				value: undefined,
			});
			// Per-document identity: a full-page load creates a NEW document,
			// while a client-side swap keeps the same document object.
			(window as unknown as { __docId: string }).__docId = Math.random()
				.toString(36)
				.slice(2);
		});
		await page.goto("/");
		const docBefore = await page.evaluate(
			() => (window as unknown as { __docId: string }).__docId,
		);
		// Keyboard activation (focus + Enter) is a real user activation that
		// avoids hover-triggered prefetch commits racing the init scripts.
		await page.locator("[data-menu-item]").first().focus();
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(/\/about$/);
		await expect(
			page.getByRole("heading", { level: 1, name: "About" }),
		).toBeVisible();
		const sVT = await page.evaluate(() => typeof document.startViewTransition);
		const docAfter = await page.evaluate(
			() => (window as unknown as { __docId: string }).__docId,
		);
		expect(sVT).toBe("undefined");
		expect(
			docAfter,
			"full-page fallback must create a new document (startViewTransition masked)",
		).not.toBe(docBefore);
	});
});

// Control placement (persona-navigation spec scenarios "Hints cluster
// bottom-right without overlap" and "Coarse pointer hides hints"; design
// AD4): the persisted control root holds two corners — the decorative key
// hints stay fixed at bottom 1.5rem / right 1.75rem, and the mute control
// sits fixed top-right at 1.5rem/1.5rem (the former shell identity card is
// removed, so the mute control owns the top-right utility position). Hints
// hide on short (<560px) or coarse-pointer viewports; the mute control
// keeps a ≥44px target. Anchor boxes (the visible menu items) are the
// non-overlap measure on the shell; the heading and the back link stand
// for view content, which never reaches the corners.
test.describe("control placement", () => {
	const hints = (page: Page) => page.locator(".key-hints");
	const mute = (page: Page) => page.locator("[data-mute-control]");

	const hintsBox = async (page: Page) => {
		const box = await hints(page).boundingBox();
		if (!box) throw new Error("expected a visible key-hints box");
		return box;
	};

	const assertCorner = (
		box: { x: number; y: number; width: number; height: number },
		viewportWidth: number,
		viewportHeight: number,
	) => {
		expect(
			Math.abs(viewportWidth - 28 - (box.x + box.width)),
		).toBeLessThanOrEqual(2);
		expect(
			Math.abs(viewportHeight - 24 - (box.y + box.height)),
		).toBeLessThanOrEqual(2);
	};

	const assertNoOverlap = (
		a: { x: number; y: number; width: number; height: number },
		b: { x: number; y: number; width: number; height: number },
	) => {
		const overlapX =
			Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
		const overlapY =
			Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
		expect(Math.min(overlapX, overlapY)).toBeLessThanOrEqual(0.5);
	};

	const assertMuteTarget = async (page: Page) => {
		// Attribute locator: the accessible name flips with the probe/state,
		// so a name-scoped locator would be non-deterministic here.
		const control = mute(page);
		await expect(control).toBeVisible();
		const box = await control.boundingBox();
		if (!box) throw new Error("expected a visible mute button box");
		expect(box.height).toBeGreaterThanOrEqual(44);
		expect(box.width).toBeGreaterThanOrEqual(44);
	};

	test.use({ viewport: { width: 1280, height: 720 } });

	test.describe("desktop 1280x720", () => {
		test("shell: hints fixed bottom-right, mute fixed top-right, no overlaps", async ({
			page,
		}) => {
			await page.goto("/");
			await expect(hints(page)).toBeVisible();
			expect(
				await hints(page).evaluate((el) => getComputedStyle(el).position),
			).toBe("fixed");
			assertCorner(await hintsBox(page), 1280, 720);
			const control = mute(page);
			expect(
				await control.evaluate((el) => getComputedStyle(el).position),
			).toBe("fixed");
			const muteBox = await control.boundingBox();
			if (!muteBox) throw new Error("expected a visible mute button box");
			// Top-right utility position: right 1.5rem and top 1.5rem — the
			// former identity card is removed, so the mute control anchors
			// the corner directly.
			expect(
				Math.abs(1280 - 24 - (muteBox.x + muteBox.width)),
			).toBeLessThanOrEqual(2);
			expect(Math.abs(muteBox.y - 24)).toBeLessThanOrEqual(2);
			const items = await page.locator("[data-menu-item]").evaluateAll((els) =>
				els.map((el) => {
					const rect = el.getBoundingClientRect();
					return {
						x: rect.x,
						y: rect.y,
						width: rect.width,
						height: rect.height,
					};
				}),
			);
			expect(items).toHaveLength(4);
			const hintRect = await hintsBox(page);
			for (const item of items) {
				assertNoOverlap(item, hintRect);
				assertNoOverlap(item, muteBox);
			}
			await assertMuteTarget(page);
		});

		test("every view: hints fixed bottom-right, mute fixed top-right, no header overlap", async ({
			page,
		}) => {
			// The view heading is a full-width block, so the overlap contract
			// measures the heading's TEXT box (Range rect), not the block box.
			const headingTextBox = async () =>
				page.getByRole("heading", { level: 1 }).evaluate((el) => {
					const range = document.createRange();
					range.selectNodeContents(el);
					const rect = range.getBoundingClientRect();
					return {
						x: rect.x,
						y: rect.y,
						width: rect.width,
						height: rect.height,
					};
				});
			for (const [path] of VIEWS) {
				await page.goto(path);
				await expect(hints(page)).toBeVisible();
				assertCorner(await hintsBox(page), 1280, 720);
				const muteBox = await mute(page).boundingBox();
				if (!muteBox) {
					throw new Error(`expected a visible mute button box on ${path}`);
				}
				expect(
					Math.abs(1280 - 24 - (muteBox.x + muteBox.width)),
				).toBeLessThanOrEqual(2);
				// Top-right utility position (1.5rem) on views too — the
				// identity card is removed, so the mute control anchors the
				// corner directly.
				expect(Math.abs(muteBox.y - 24)).toBeLessThanOrEqual(2);
				const heading = await headingTextBox();
				for (const target of [
					heading,
					await page.getByRole("link", { name: "Back to menu" }).boundingBox(),
				]) {
					if (!target) {
						throw new Error(`expected a visible header box on ${path}`);
					}
					assertNoOverlap(target, await hintsBox(page));
					assertNoOverlap(target, muteBox);
				}
			}
		});
	});

	test.describe("coarse mobile 390x844", () => {
		test.use({
			hasTouch: true,
			isMobile: true,
			viewport: { width: 390, height: 844 },
		});

		test("hints hidden, mute control stays a ≥44px target", async ({
			page,
		}) => {
			await page.goto("/");
			await expect(page.locator(".key-hints")).toBeHidden();
			await assertMuteTarget(page);
		});
	});

	test.describe("coarse desktop-width 1024x768", () => {
		test.use({ hasTouch: true, viewport: { width: 1024, height: 768 } });

		test("hints hidden, mute stays reachable", async ({ page }) => {
			await page.goto("/");
			await expect(page.locator(".key-hints")).toBeHidden();
			await assertMuteTarget(page);
		});
	});

	test.describe("short viewport 1280x500", () => {
		test.use({ viewport: { width: 1280, height: 500 } });

		test("hints hidden below 560px, mute control stays a ≥44px target", async ({
			page,
		}) => {
			await page.goto("/");
			await expect(page.locator(".key-hints")).toBeHidden();
			await assertMuteTarget(page);
		});
	});
});

// Regression boundaries for the remediated system (portfolio-page spec
// "Remediation regression boundaries"): the shell active indicator is
// re-established when returning from a view, and the mute control stays
// keyboard-operable on view routes. (The removed decorative figure layer is
// asserted absent on every route in reduced-motion.spec.ts; shell indicator
// movement in keyboard.spec.ts; shell keyboard toggle in
// ambient-audio.spec.ts — the cases below cover the view-boundary angles
// those specs do not.)
test.describe("remediation regression boundaries", () => {
	// A zero-filled MPEG-1 Layer III frame decodes as silence in Chromium;
	// serves as the "licensed track present" setup for view-route playback.
	function silentMp3(): Buffer {
		const frame = Buffer.alloc(417);
		frame[0] = 0xff;
		frame[1] = 0xfb;
		frame[2] = 0x90;
		frame[3] = 0x00;
		return Buffer.concat(Array.from({ length: 24 }, () => Buffer.from(frame)));
	}

	test("returning to the shell restores the active indicator on the first item", async ({
		page,
	}) => {
		// shell.ts re-inits on astro:page-load after the swap: exactly one
		// item carries data-active + aria-current again (design AD2).
		await page.goto("/about");
		await page.keyboard.press("Escape");
		await expect(page).toHaveURL(/\/$/);
		const about = page.getByRole("link", { name: "About" });
		await expect(about).toHaveAttribute("data-active", /.*/);
		await expect(about).toHaveAttribute("aria-current", "page");
		await expect(page.locator("[data-menu-item][data-active]")).toHaveCount(1);
		await expect(page.locator("[data-menu-item][aria-current]")).toHaveCount(1);
	});

	test("keyboard mute stays operable on a view route", async ({ page }) => {
		// The cluster renders on every route; the mute control must be
		// keyboard-reachable there too (persona-navigation cluster contract,
		// ambient-audio spec "Keyboard toggles mute" on a direct view load).
		const track = { heads: 0, gets: 0 };
		const body = silentMp3();
		await page.route("**/audio/background.mp3", (route) => {
			if (route.request().method() === "HEAD") {
				track.heads += 1;
				return route.fulfill({ status: 200 });
			}
			track.gets += 1;
			return route.fulfill({ status: 200, contentType: "audio/mpeg", body });
		});
		await page.goto("/about");
		await expect(
			page.getByRole("heading", { level: 1, name: "About" }),
		).toBeVisible();
		// Attribute locator: the accessible name flips with the state, so a
		// name-scoped locator would go stale mid-test.
		const mute = page.locator("[data-mute-control]");
		await expect(mute).toHaveAttribute("data-audio-state", "ready");
		await expect(page.getByRole("button", { name: "Sound: On" })).toBeVisible();
		await page.keyboard.press("Shift"); // first gesture unlocks playback
		await expect.poll(() => track.gets).toBe(1);
		await expect
			.poll(() =>
				page
					.locator("[data-audio-element]")
					.evaluate((el) => (el as HTMLAudioElement).paused),
			)
			.toBe(false);
		await expect.poll(() => track.heads).toBe(1);
		await mute.focus();
		await page.keyboard.press("Enter");
		await expect(mute).toHaveAttribute("aria-pressed", "true");
		await expect(mute).toHaveAttribute("aria-label", "Sound: Off");
		await expect
			.poll(() =>
				page
					.locator("[data-audio-element]")
					.evaluate((el) => (el as HTMLAudioElement).paused),
			)
			.toBe(true);
	});
});

// Sprite pattern bounds (design route-asset-matrix): owner-created sprite
// derivatives may repeat as decorative patterns ONLY inside the locked
// bounds — 8–15% opacity, ≤160px desktop / ≤96px mobile, pointer-events none.
// Instances are mounted by Unit D (SpriteAccent.astro) with aria-hidden and
// one-per-route placement (tasks 4.1/4.4); this contract guards the shared
// utility and the canonical data-sprite-pattern hook that D must use.
test.describe("sprite pattern bounds", () => {
	const patternProbe = (page: Page) =>
		page.evaluate(() => {
			const el = document.createElement("div");
			el.className = "sprite-pattern";
			document.body.append(el);
			// getComputedStyle returns a live object: read every value before
			// removing the probe (a detached element resets to defaults).
			const style = getComputedStyle(el);
			const probe = {
				opacity: parseFloat(style.opacity),
				pointerEvents: style.pointerEvents,
				maxWidth: parseFloat(style.maxWidth) || 0,
				maxHeight: parseFloat(style.maxHeight) || 0,
			};
			el.remove();
			return probe;
		});

	test("utility enforces the bounds: 8–15% opacity, ≤160px, pointer-events none", async ({
		page,
	}) => {
		await page.goto("/");
		const probe = await patternProbe(page);
		expect(probe.opacity).toBeGreaterThanOrEqual(0.08);
		expect(probe.opacity).toBeLessThanOrEqual(0.15);
		expect(probe.pointerEvents).toBe("none");
		expect(probe.maxWidth).toBeGreaterThan(0);
		expect(probe.maxWidth).toBeLessThanOrEqual(160);
		expect(probe.maxHeight).toBeGreaterThan(0);
		expect(probe.maxHeight).toBeLessThanOrEqual(160);
	});

	test("mobile caps the pattern at 96px", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto("/");
		const probe = await patternProbe(page);
		expect(probe.maxWidth).toBeGreaterThan(0);
		expect(probe.maxWidth).toBeLessThanOrEqual(96);
		expect(probe.maxHeight).toBeLessThanOrEqual(96);
	});

	test("canonical instances stay decorative: density ceiling, no overflow, never blocking", async ({
		page,
	}) => {
		// Per-instance aria-hidden and one-per-route placement are composition
		// concerns Unit D mounts and verifies (tasks 4.1/4.4). Here a canonical
		// probe (class + data hook, as D will mount it) proves the shared
		// utility really bounds it: an over-wide 200vw instance is capped to
		// ≤160px, so it can never overflow the viewport or block pointers.
		for (const [path] of VIEWS) {
			await page.goto(path);
			const accents = page.locator("[data-sprite-pattern]");
			expect(
				await accents.count(),
				`${path} at most one accent`,
			).toBeLessThanOrEqual(1);
			const probe = await page.evaluate(() => {
				const el = document.createElement("div");
				el.className = "sprite-pattern";
				el.setAttribute("data-sprite-pattern", "");
				el.style.position = "absolute";
				el.style.left = "0";
				el.style.top = "0";
				el.style.width = "200vw";
				el.style.height = "160px";
				document.body.append(el);
				const style = getComputedStyle(el);
				const rect = el.getBoundingClientRect();
				const top = document.elementFromPoint(
					rect.x + rect.width / 2,
					rect.y + rect.height / 2,
				);
				const result = {
					opacity: parseFloat(style.opacity),
					pointerEvents: style.pointerEvents,
					rectRight: rect.right,
					viewport: window.innerWidth,
					// pointer-events:none → the accent is never the top hit at
					// its own center; pointers fall through to content.
					blocked: top === el || el.contains(top),
				};
				el.remove();
				return result;
			});
			expect(probe.opacity, `${path} opacity 8–15%`).toBeGreaterThanOrEqual(
				0.08,
			);
			expect(probe.opacity, `${path} opacity 8–15%`).toBeLessThanOrEqual(0.15);
			expect(probe.pointerEvents, `${path} pointer-events none`).toBe("none");
			expect(
				probe.rectRight,
				`${path} capped width never overflows`,
			).toBeLessThanOrEqual(probe.viewport);
			expect(probe.blocked, `${path} never blocks pointers`).toBe(false);
		}
	});
});
