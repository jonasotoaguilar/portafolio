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
		// The stage is exactly seven row pitches tall.
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
		expect(stage!.vpHeight).toBeCloseTo(7 * stage!.pitch, 0);
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
		// Narrow track: 6–8px.
		expect(trackBox.width).toBeGreaterThanOrEqual(6);
		expect(trackBox.width).toBeLessThanOrEqual(8);
		// FIXED: the thumb fills the track and never moves (no scrollTop to
		// mirror, no drag).
		expect(thumbBox.height).toBe(trackBox.height);
		expect(thumbBox.x).toBe(trackBox.x);
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
		// Wheel steps change focus, never the thumb.
		await page.mouse.wheel(0, 106);
		const after = await thumb(page).boundingBox();
		expect(after?.x).toBe(thumbBox.x);
		expect(after?.y).toBe(thumbBox.y);
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
		expect(tall).toBe(defaultHeight);
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
		expect(defaultHeight).toBeCloseTo(7 * pitch, 0);
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
		// One large delta emits several steps (53 * 3 + 10).
		await page.mouse.wheel(0, 169);
		await expect(slots(page).nth(6)).toBeFocused();
		// Wheel down at the bottom slot advances the data window.
		await page.mouse.wheel(0, 53);
		expect(await names(page)).toEqual([
			"Python",
			"TypeScript",
			"Node.js",
			"FastAPI",
			"SQLAlchemy 2",
			"Alembic",
			"Appwrite",
		]);
		// Wheel up mirrors: from a slot stuck to the bottom edge, up-steps
		// first walk focus up inside the window (carrying the accumulated
		// remainder); only when focus reaches slot 1 does the window shift
		// back one skill per press.
		await page.mouse.wheel(0, -53); // absorbed: no step yet (remainder)
		expect(await names(page)).toEqual([
			"Python",
			"TypeScript",
			"Node.js",
			"FastAPI",
			"SQLAlchemy 2",
			"Alembic",
			"Appwrite",
		]);
		await page.mouse.wheel(0, -53); // focus slot 5 (sixth visible)
		await expect(slots(page).nth(5)).toBeFocused();
		expect(await names(page)).toEqual([
			"Python",
			"TypeScript",
			"Node.js",
			"FastAPI",
			"SQLAlchemy 2",
			"Alembic",
			"Appwrite",
		]);
		// Walk focus up to slot 1...
		for (let i = 0; i < 4; i += 1) {
			await page.mouse.wheel(0, -53);
		}
		await expect(slots(page).nth(1)).toBeFocused();
		expect(await names(page)).toEqual([
			"Python",
			"TypeScript",
			"Node.js",
			"FastAPI",
			"SQLAlchemy 2",
			"Alembic",
			"Appwrite",
		]);
		// ...then the window shifts back to skills 1..7.
		await page.mouse.wheel(0, -53); // within-window move to the top slot
		await expect(slots(page).first()).toBeFocused();
		expect(await names(page)).toEqual([
			"Python",
			"TypeScript",
			"Node.js",
			"FastAPI",
			"SQLAlchemy 2",
			"Alembic",
			"Appwrite",
		]);
		await page.mouse.wheel(0, -53); // window shifts to skills 1..7
		expect(await names(page)).toEqual(initialWindow);
		await expect(slots(page).first()).toBeFocused();
		// scrollTop and page scroll never move.
		expect(await scrollState()).toEqual({ vp: 0, page: 0 });
		// Ctrl+wheel is never hijacked: content and focus stay put.
		await page.keyboard.down("Control");
		await page.mouse.wheel(0, 400);
		await page.keyboard.up("Control");
		expect(await names(page)).toEqual(initialWindow);
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
				assertNoOverlap(heading, await hintsBox(page));
				assertNoOverlap(heading, muteBox);
				if (path === "/about") {
					// About (about-view contract) hides the Back to menu link:
					// Escape is its documented return path, so there is no
					// visible back link to measure on this route.
					await expect(
						page.getByRole("link", { name: "Back to menu" }),
					).toHaveCount(0);
				} else {
					const back = await page
						.getByRole("link", { name: "Back to menu" })
						.boundingBox();
					if (!back) {
						throw new Error(`expected a visible header box on ${path}`);
					}
					assertNoOverlap(back, await hintsBox(page));
					assertNoOverlap(back, muteBox);
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
// ABOUT profile band (about-view contract): the about route composes a
// single white diagonal band over a SOLID sea-blue field, plus two right-side
// diagonal layers — a large gray band BEHIND the white band and a translucent
// crystalline glass band (holding the optimized persona portrait) ABOVE it.
// One route-scoped custom property (--about-band-polygon) is the geometry
// source of truth for the white band, consumed verbatim by BOTH the white
// background cutout (.glow-layer::before) and the profile's clipping surface
// (.about-stage), so the white field and the profile share one boundary and
// can never drift apart. The polygon enters MUCH higher from the left than
// the original contract (16vh vs 44vh) while keeping the previously
// established 36vh band height and the upper-right diagonal character: the
// top edge starts near the top-left and reaches the viewport's upper-right
// corner. .about-band is the ONLY transformed element (the rotated parent) —
// profile blocks, dividers, and text are ordinary flow children, so the whole
// profile shares the band's diagonal. The giant 18 is a decorative aria-hidden
// numeral whose zone tracks the Anton glyph advance, so the content column
// hugs it with a tight 0.125-0.5rem flex gap and consumes the full row width
// (flex 1, no artificial max-width), so the black strips reach the right-side
// layout edge behind the layers. The gray band and the glass band are
// decorative layers: aria-hidden, pointer-events none, clipped as genuine
// diagonals (slanted left boundaries, not vertical edges), and stacked below
// (z -1) / above (z +1) the white band respectively. Below 1280px the same
// diagonal row scales its internal geometry together and the right-side
// layers narrow; no alternate card layout is introduced.
test.describe("ABOUT profile band", () => {
	test("desktop: high left entry, shared polygon clip, one rotated parent, tight profile, gray + glass layers, no overflow", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto("/about");
		// The polygon is a single route-scoped custom property; its second
		// point is the upper-right corner, its left entry is MUCH higher than
		// the original 44vh contract (16vh), and the band height is back to
		// the previously established 36vh (not thickened).
		const poly = await page.evaluate(() => {
			const root = document.documentElement;
			const style = getComputedStyle(root);
			const glow = document.querySelector(".glow-layer")!;
			// The resolved stage clip (same geometry as the white cutout) is
			// returned in px, so we can assert the exact band proportions.
			const resolved = getComputedStyle(
				document.querySelector(".about-stage")!,
			).clipPath;
			return {
				raw: style.getPropertyValue("--about-band-polygon").trim(),
				height: style.getPropertyValue("--about-band-height").trim(),
				resolved,
				innerWidth: window.innerWidth,
				innerHeight: window.innerHeight,
				glowColor: getComputedStyle(glow).backgroundColor,
				glowImage: getComputedStyle(glow).backgroundImage,
			};
		});
		const points = poly.raw
			.replace(/^polygon\((.*)\)$/s, "$1")
			.split(",")
			.map((p) => p.trim().split(/\s+/));
		expect(points).toHaveLength(4);
		// Height restored to 36vh; the resolved clip must match the exact
		// approved polygon: left entry 16vh, upper-right corner, right height
		// 36vh, left bottom 52vh (16vh + 36vh).
		expect(poly.height).toBe("36vh");
		expect(points[1]).toEqual(["100%", "0"]);
		expect(points[0]).toEqual(["0", "16vh"]);
		const rpts = poly.resolved
			.replace(/^polygon\((.*)\)$/s, "$1")
			.split(",")
			.map((p) =>
				p
					.trim()
					.split(/\s+/)
					.map((v, i) => {
						if (v.endsWith("%"))
							return (
								(parseFloat(v) / 100) *
								(i === 0 ? poly.innerWidth : poly.innerHeight)
							);
						return parseFloat(v);
					}),
			);
		const toPx = (v: number) => (v / 100) * poly.innerHeight;
		expect(rpts[0][0]).toBeCloseTo(0, 0);
		expect(rpts[0][1]).toBeCloseTo(toPx(16), 0);
		expect(rpts[1][0]).toBeCloseTo(poly.innerWidth, 0);
		expect(rpts[1][1]).toBeCloseTo(0, 0);
		expect(rpts[2][0]).toBeCloseTo(poly.innerWidth, 0);
		expect(rpts[2][1]).toBeCloseTo(toPx(36), 0);
		expect(rpts[3][0]).toBeCloseTo(0, 0);
		expect(rpts[3][1]).toBeCloseTo(toPx(52), 0);
		// The field is solid sea-blue (no shared light-field gradient).
		expect(poly.glowColor).toBe("rgb(22, 119, 200)");
		expect(poly.glowImage).toBe("none");
		// The white cutout and the profile surface share the same resolved
		// clip boundary: one geometry source of truth.
		const shared = await page.evaluate(() => {
			const glow = document.querySelector(".glow-layer")!;
			const stage = document.querySelector(".about-stage")!;
			return {
				cutout: getComputedStyle(glow, "::before").clipPath,
				stage: getComputedStyle(stage).clipPath,
			};
		});
		expect(shared.cutout).not.toBe("none");
		expect(shared.stage).toBe(shared.cutout);
		// One rotated parent; children are untransformed flow children.
		const band = await page.evaluate(() => {
			const bandEl = document.querySelector(".about-band")!;
			const name = document.querySelector(".about-name")!;
			const divider = document.querySelector(".about-divider")!;
			const style = (el: Element) => getComputedStyle(el);
			return {
				transform: style(bandEl).transform,
				gap: style(bandEl).gap,
				childTransforms: [name, divider].map((el) => style(el).transform),
				numeralWidth: document
					.querySelector(".about-numeral")!
					.getBoundingClientRect().width,
			};
		});
		expect(band.transform).not.toBe("none");
		expect(band.childTransforms).toEqual(["none", "none"]);
		// Tighter profile geometry: the flex gap between the 18 and the
		// content column is at most 0.5rem (old contract allowed 0.75rem).
		const gapPx = parseFloat(band.gap);
		expect(gapPx).toBeGreaterThanOrEqual(2);
		expect(gapPx).toBeLessThanOrEqual(8);
		// The numeral zone tracks the Anton glyph advance (~0.85em of the
		// font), so the content truly hugs the 18 instead of trailing a wide
		// empty box (the old zone was ~450px; the glyph-tracking zone is well
		// under 260px).
		expect(band.numeralWidth).toBeLessThan(260);
		// Containment: the stage clip trims the rotated row to the band, so
		// painted content can never escape the band. The meaningful contracts
		// are that the numeral (the leftmost member) stays inside the resolved
		// polygon and that the full-width rotated row never creates document
		// overflow (no horizontal scrollbar).
		const containment = await page.evaluate(() => {
			const clip = getComputedStyle(
				document.querySelector(".about-stage")!,
			).clipPath;
			const toPx = (v: string) => {
				v = v.trim();
				if (v.endsWith("vh")) return (parseFloat(v) / 100) * window.innerHeight;
				if (v.endsWith("vw")) return (parseFloat(v) / 100) * window.innerWidth;
				if (v.endsWith("%")) return (parseFloat(v) / 100) * window.innerWidth;
				return parseFloat(v);
			};
			const pts = clip
				.replace(/^polygon\((.*)\)$/s, "$1")
				.split(",")
				.map((p) => {
					const [x, y] = p.trim().split(/\s+/);
					return [toPx(x), toPx(y)];
				});
			const inside = (px: number, py: number) => {
				let hit = false;
				for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
					const [xi, yi] = pts[i];
					const [xj, yj] = pts[j];
					if (
						yi > py !== yj > py &&
						px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
					)
						hit = !hit;
				}
				return hit;
			};
			const corners = (el: Element) => {
				const r = el.getBoundingClientRect();
				return [
					[r.left, r.top],
					[r.right, r.top],
					[r.left, r.bottom],
					[r.right, r.bottom],
				] as const;
			};
			const fullyInside = (sel: string) =>
				corners(document.querySelector(sel)!).every(([x, y]) => inside(x, y));
			return {
				numeralInside: fullyInside(".about-numeral"),
				scrollWidth: document.documentElement.scrollWidth,
				innerWidth: window.innerWidth,
				stageClip: clip,
			};
		});
		expect(containment.numeralInside).toBe(true);
		expect(containment.scrollWidth).toBeLessThanOrEqual(containment.innerWidth);
		expect(containment.stageClip).not.toBe("none");
		// Decorative members: the giant 18 and the divider are aria-hidden.
		await expect(page.locator(".about-numeral")).toHaveAttribute(
			"aria-hidden",
			"true",
		);
		await expect(page.locator(".about-numeral")).toBeVisible();
		await expect(page.locator(".about-divider")).toHaveAttribute(
			"aria-hidden",
			"true",
		);
		// The content column hugs the 18 and consumes the full row width with
		// NO artificial max-width, so the black strips reach the right-side
		// layout edge (the glass portrait overlays the far-right portion; the
		// black elements' layout width reaches behind it).
		const geometry = await page.evaluate(() => {
			const numeral = document.querySelector(".about-numeral")!;
			const content = document.querySelector(".about-content")!;
			const glass = document.querySelector(".about-glass")!;
			const n = numeral.getBoundingClientRect();
			const c = content.getBoundingClientRect();
			const glassRect = glass.getBoundingClientRect();
			return {
				numeralLeft: n.left,
				contentLeft: c.left,
				contentRight: c.right,
				contentWidth: c.width,
				innerWidth: window.innerWidth,
				glassLeft: glassRect.left,
				contentMaxWidth: getComputedStyle(content).maxWidth,
				scrollWidth: document.documentElement.scrollWidth,
			};
		});
		expect(geometry.numeralLeft).toBeLessThan(geometry.contentLeft);
		expect(geometry.contentWidth).toBeGreaterThan(0);
		// No artificial width cap: the column is free to fill the row, and the
		// black strips reach the right-side layout edge behind the glass.
		expect(geometry.contentMaxWidth).toBe("none");
		expect(geometry.contentRight).toBeGreaterThanOrEqual(
			geometry.innerWidth * 0.9,
		);
		expect(geometry.contentRight).toBeGreaterThan(geometry.glassLeft);
		expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.innerWidth);

		// Gray diagonal band BEHIND the white band: decorative layer on the
		// right, stacked below the stage, clipped with its own polygon.
		await expect(page.locator(".about-band-gray")).toHaveCount(1);
		await expect(page.locator(".about-band-gray")).toHaveAttribute(
			"aria-hidden",
			"true",
		);
		const gray = await page.evaluate(() => {
			const el = document.querySelector(".about-band-gray")!;
			const s = getComputedStyle(el);
			const clip = s.clipPath;
			const points = clip
				.replace(/^polygon\((.*)\)$/s, "$1")
				.split(",")
				.map((p) => p.trim().split(/\s+/));
			// Normalize either rgb()/rgba() or color(srgb r g b) serialization
			// to 0-255 channels.
			const toRGB = (c: string): number[] => {
				const rgb = c.match(/rgba?\(([^)]+)\)/);
				if (rgb)
					return rgb[1]
						.split(/[\s,/]+/)
						.slice(0, 3)
						.map((v) => parseFloat(v));
				const srgb = c.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
				if (srgb)
					return [srgb[1], srgb[2], srgb[3]].map((v) =>
						Math.round(parseFloat(v) * 255),
					);
				return [0, 0, 0];
			};
			return {
				pointer: s.pointerEvents,
				z: s.zIndex,
				clip,
				bg: toRGB(s.backgroundColor),
				distinctX: new Set(points.map((p) => p[0])).size,
				distinctY: new Set(points.map((p) => p[1])).size,
				stageZ: getComputedStyle(document.querySelector(".about-stage")!)
					.zIndex,
			};
		});
		expect(gray.pointer).toBe("none");
		expect(gray.clip).not.toBe("none");
		// Genuinely diagonal (a slanted left boundary), not a rectangle with a
		// vertical left edge: the clip resolves to >=3 distinct x values (a
		// vertical-edge rectangle has exactly 2), and the band covers the full
		// viewport height (y present at both 0 and 100%).
		expect(gray.distinctX).toBeGreaterThanOrEqual(3);
		expect(gray.distinctY).toBeGreaterThanOrEqual(2);
		// Visibly dark charcoal, not white or a saturated tint.
		const [gr, gg, gb] = gray.bg;
		expect(Math.max(gr, gg, gb)).toBeLessThanOrEqual(100);
		expect(Math.min(gr, gg, gb)).toBeGreaterThanOrEqual(20);
		expect(Math.max(gr, gg, gb) - Math.min(gr, gg, gb)).toBeLessThanOrEqual(20);
		// Stacked below the white band (z-index -1 < stage z-index 0).
		expect(parseInt(gray.z, 10)).toBeLessThan(parseInt(gray.stageZ, 10));

		// Translucent crystalline glass panel ABOVE the white band: clipped,
		// overflow-hidden, containing the loaded persona portrait.
		await expect(page.locator(".about-glass")).toHaveCount(1);
		await expect(page.locator(".about-glass")).toHaveAttribute(
			"aria-hidden",
			"true",
		);
		await expect(page.locator(".about-glass img")).toHaveCount(1);
		// The portrait derivative loads (natural size 800x1200).
		const img = page.locator(".about-glass img");
		await expect
			.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth), {
				timeout: 5000,
			})
			.toBeGreaterThan(0);
		await expect(img).toHaveAttribute("alt", "");
		const glass = await page.evaluate(() => {
			const el = document.querySelector(".about-glass")!;
			const s = getComputedStyle(el);
			const img = document.querySelector(".about-glass img")!;
			const is = getComputedStyle(img);
			const ir = img.getBoundingClientRect();
			const er = el.getBoundingClientRect();
			const clip = s.clipPath;
			const points = clip
				.replace(/^polygon\((.*)\)$/s, "$1")
				.split(",")
				.map((p) => p.trim().split(/\s+/));
			return {
				pointer: s.pointerEvents,
				z: s.zIndex,
				clip,
				overflow: s.overflow,
				stageZ: getComputedStyle(document.querySelector(".about-stage")!)
					.zIndex,
				distinctX: new Set(points.map((p) => p[0])).size,
				distinctY: new Set(points.map((p) => p[1])).size,
				fullHeight: er.height >= window.innerHeight - 1,
				imgObjFit: is.objectFit,
				imgObjPos: is.objectPosition,
				imgCoversPanel: ir.width >= er.width && ir.height >= er.height,
			};
		});
		expect(glass.pointer).toBe("none");
		expect(glass.clip).not.toBe("none");
		expect(glass.overflow).toBe("hidden");
		// Genuinely diagonal (a slanted left boundary), not a panel with a
		// vertical left edge (>=3 distinct x values); and full-height enough
		// to read as a band.
		expect(glass.distinctX).toBeGreaterThanOrEqual(3);
		expect(glass.distinctY).toBeGreaterThanOrEqual(2);
		expect(glass.fullHeight).toBe(true);
		// Stacked above the white band (z-index 1 > stage z-index 0).
		expect(parseInt(glass.z, 10)).toBeGreaterThan(parseInt(glass.stageZ, 10));
		// The image fills the glass frame with object-fit: cover and a tuned
		// object-position, and it covers the whole panel surface.
		expect(glass.imgObjFit).toBe("cover");
		expect(glass.imgObjPos).not.toBe("50% 50%");
		expect(glass.imgCoversPanel).toBe(true);
	});

	test("desktop: the Back to menu link is hidden but the Escape fallback anchor stays", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto("/about");
		await expect(page.getByRole("link", { name: "Back to menu" })).toHaveCount(
			0,
		);
		// The non-visible route-safe fallback stays in the DOM so the shared
		// view script's Escape -> goToMenu() still resolves an anchor.
		const fallback = page.locator('a[href="/"]');
		await expect(fallback).toHaveCount(1);
		await expect(fallback).toBeHidden();
	});

	test("medium widths: the same diagonal row scales without overlap", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1239, height: 829 });
		await page.goto("/about");
		const collapsed = await page.evaluate(() => {
			const stage = document.querySelector(".about-stage");
			const band = document.querySelector(".about-band");
			const glow = document.querySelector(".glow-layer");
			if (!stage || !band || !glow) return null;
			return {
				stagePosition: getComputedStyle(stage).position,
				stageClip: getComputedStyle(stage).clipPath,
				bandTransform: getComputedStyle(band).transform,
				cutoutDisplay: getComputedStyle(glow, "::before").display,
			};
		});
		expect(collapsed).not.toBeNull();
		expect(collapsed!.stagePosition).toBe("fixed");
		expect(collapsed!.stageClip).not.toBe("none");
		expect(collapsed!.bandTransform).not.toBe("none");
		expect(collapsed!.cutoutDisplay).not.toBe("none");
		await expect(page.locator(".about-numeral")).toBeVisible();
		const boxes = await page.evaluate(() => {
			const content = document.querySelector(".about-content")!;
			const c = content.getBoundingClientRect();
			return {
				contentWidth: c.width,
				contentRight: c.right,
				contentMaxWidth: getComputedStyle(content).maxWidth,
				scrollWidth: document.documentElement.scrollWidth,
				innerWidth: window.innerWidth,
				glassCount: document.querySelectorAll(".about-glass").length,
				grayCount: document.querySelectorAll(".about-band-gray").length,
			};
		});
		expect(boxes.contentWidth).toBeGreaterThan(0);
		expect(boxes.contentMaxWidth).toBe("none");
		expect(boxes.contentRight).toBeGreaterThanOrEqual(boxes.innerWidth * 0.9);
		expect(boxes.glassCount).toBe(1);
		expect(boxes.grayCount).toBe(1);
		expect(boxes.scrollWidth).toBeLessThanOrEqual(boxes.innerWidth);
	});

	test("narrow mobile: the same diagonal row remains readable and contained", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto("/about");
		const flow = await page.evaluate(() => {
			const stage = document.querySelector(".about-stage")!;
			const band = document.querySelector(".about-band")!;
			const numeral = document.querySelector(".about-numeral")!;
			const content = document.querySelector(".about-content")!;
			const glass = document.querySelector(".about-glass")!;
			const gray = document.querySelector(".about-band-gray")!;
			const n = numeral.getBoundingClientRect();
			const c = content.getBoundingClientRect();
			const glassRect = glass.getBoundingClientRect();
			// Resolve the band polygon and confirm the numeral stays inside it
			// at mobile width too (the full-width rotated row is trimmed by
			// the stage clip, so the meaningful contracts are numeral
			// containment plus no document overflow).
			const clip = getComputedStyle(stage).clipPath;
			const toPx = (v: string) => {
				v = v.trim();
				if (v.endsWith("vh")) return (parseFloat(v) / 100) * window.innerHeight;
				if (v.endsWith("vw")) return (parseFloat(v) / 100) * window.innerWidth;
				if (v.endsWith("%")) return (parseFloat(v) / 100) * window.innerWidth;
				return parseFloat(v);
			};
			const pts = clip
				.replace(/^polygon\((.*)\)$/s, "$1")
				.split(",")
				.map((p) => {
					const [x, y] = p.trim().split(/\s+/);
					return [toPx(x), toPx(y)];
				});
			const inside = (px: number, py: number) => {
				let hit = false;
				for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
					const [xi, yi] = pts[i];
					const [xj, yj] = pts[j];
					if (
						yi > py !== yj > py &&
						px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
					)
						hit = !hit;
				}
				return hit;
			};
			const cornersInside = (r: DOMRect) => {
				return (
					inside(r.left, r.top) &&
					inside(r.right, r.top) &&
					inside(r.left, r.bottom) &&
					inside(r.right, r.bottom)
				);
			};
			const glassClip = getComputedStyle(glass).clipPath;
			const grayClip = getComputedStyle(gray).clipPath;
			const distinctX = (p: string) =>
				new Set(
					p
						.replace(/^polygon\((.*)\)$/s, "$1")
						.split(",")
						.map((pt) => pt.trim().split(/\s+/)[0]),
				).size;
			return {
				stagePosition: getComputedStyle(stage).position,
				bandTransform: getComputedStyle(band).transform,
				numeral: [n.left, n.top, n.right, n.bottom],
				content: [c.left, c.top, c.right, c.bottom],
				numeralInside: cornersInside(n),
				contentMaxWidth: getComputedStyle(content).maxWidth,
				glassLeft: glassRect.left,
				glassNarrow: glassRect.width <= window.innerWidth * 0.5,
				glassDiagonal: distinctX(glassClip) >= 3,
				grayDiagonal: distinctX(grayClip) >= 3,
				scrollWidth: document.documentElement.scrollWidth,
				innerWidth: window.innerWidth,
			};
		});
		expect(flow.stagePosition).toBe("fixed");
		expect(flow.bandTransform).not.toBe("none");
		expect(flow.content[2]).toBeGreaterThan(flow.content[0]);
		expect(flow.numeralInside).toBe(true);
		// The content keeps the same diagonal row: no width cap, reaches the
		// right-side layout edge, and still starts left of the (narrowed)
		// glass so a readable portion remains.
		expect(flow.contentMaxWidth).toBe("none");
		expect(flow.content[2]).toBeGreaterThanOrEqual(flow.innerWidth * 0.9);
		expect(flow.content[0]).toBeLessThan(flow.glassLeft);
		// Right-side layers narrow proportionally but keep diagonal boundaries.
		expect(flow.glassNarrow).toBe(true);
		expect(flow.glassDiagonal).toBe(true);
		expect(flow.grayDiagonal).toBe(true);
		expect(flow.scrollWidth).toBeLessThanOrEqual(flow.innerWidth);
	});
});
