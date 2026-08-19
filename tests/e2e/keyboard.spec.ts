import { expect, type Locator, type Page, test } from "@playwright/test";

// Browser-level proof for persona-navigation: shell ArrowUp/Down wrapping and
// Enter activation, plus focus restoration when returning to the shell.
test.describe("shell keyboard navigation and focus restoration", () => {
	// Land focus deterministically on the first menu item before driving the
	// shell keys (a real user reaches the same state with one Tab).
	const enterMenu = async (page: Page) => {
		await page.goto("/");
		await page.locator("[data-menu-item]").first().focus();
	};

	test("ArrowDown and ArrowUp move the active item, wrapping at the ends", async ({
		page,
	}) => {
		await enterMenu(page);
		await expect(page.getByRole("link", { name: "About" })).toBeFocused();
		await page.keyboard.press("ArrowDown");
		await expect(page.getByRole("link", { name: "Resume" })).toBeFocused();
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("ArrowDown");
		await expect(page.getByRole("link", { name: "Skills" })).toBeFocused();
		await page.keyboard.press("ArrowDown");
		await expect(page.getByRole("link", { name: "About" })).toBeFocused();
		await page.keyboard.press("ArrowUp");
		await expect(page.getByRole("link", { name: "Skills" })).toBeFocused();
		await page.keyboard.press("ArrowUp");
		await page.keyboard.press("ArrowUp");
		await page.keyboard.press("ArrowUp");
		await expect(page.getByRole("link", { name: "About" })).toBeFocused();
	});

	test("Enter activates the focused item and navigates to its route", async ({
		page,
	}) => {
		await enterMenu(page);
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(/\/resume$/);
		await expect(
			page.getByRole("heading", { level: 1, name: "Resume" }),
		).toBeVisible();
	});

	test("clicking the inert shell background keeps ArrowDown/Enter navigation alive", async ({
		page,
	}) => {
		await page.goto("/");
		await page.locator("[data-menu-item]").first().focus();
		await expect(page.getByRole("link", { name: "About" })).toBeFocused();
		// Click an inert shell background point (top-left of the field, away
		// from the menu, the name card, and the mute control): the click blurs
		// the menu and leaves focus on the body — the bug precondition.
		await page.mouse.click(30, 80);
		await expect(page.locator("body")).toBeFocused();
		await expect(page.getByRole("link", { name: "About" })).not.toBeFocused();
		// ArrowDown still moves the cursor and restores focus into the menu.
		await page.keyboard.press("ArrowDown");
		await expect(page.getByRole("link", { name: "Resume" })).toBeFocused();
		await expect(page.getByRole("link", { name: "Resume" })).toHaveAttribute(
			"data-active",
			/.*/,
		);
		// Enter still activates the active item.
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(/\/resume$/);
		await expect(
			page.getByRole("heading", { level: 1, name: "Resume" }),
		).toBeVisible();
	});

	test("returning from a view via Escape restores focus into the shell menu", async ({
		page,
	}) => {
		await page.goto("/projects");
		await page.keyboard.press("Escape");
		await page.keyboard.press("Escape");
		await expect(page).toHaveURL(/\/$/);
		await expect(page.getByRole("link", { name: "About" })).toBeFocused();
	});

	test("returning via native Back restores focus into the shell menu", async ({
		page,
	}) => {
		await page.goto("/");
		await page.getByRole("link", { name: "Projects" }).click();
		await expect(page).toHaveURL(/\/projects$/);
		await page.goBack();
		await expect(page).toHaveURL(/\/$/);
		await expect(page.getByRole("link", { name: "About" })).toBeFocused();
	});
});

// Browser-level proof for the persistent keyboard-active indicator
// (persona-navigation): shell.ts sets data-active + aria-current on init and on
// every ArrowUp/ArrowDown move; the :focus-visible outline stays visible
// alongside the active treatment; hover mirrors the treatment.
test.describe("persistent keyboard-active indicator", () => {
	test("init marks the first menu item with data-active and aria-current", async ({
		page,
	}) => {
		await page.goto("/");
		const about = page.getByRole("link", { name: "About" });
		await expect(about).toHaveAttribute("data-active", /.*/);
		await expect(about).toHaveAttribute("aria-current", "page");
	});

	test("ArrowDown moves data-active and aria-current to the next item", async ({
		page,
	}) => {
		await page.goto("/");
		await page.locator("[data-menu-item]").first().focus();
		const about = page.getByRole("link", { name: "About" });
		const resume = page.getByRole("link", { name: "Resume" });
		await expect(about).toHaveAttribute("aria-current", "page");
		await page.keyboard.press("ArrowDown");
		await expect(resume).toHaveAttribute("data-active", /.*/);
		await expect(resume).toHaveAttribute("aria-current", "page");
		await expect(about).not.toHaveAttribute("data-active", /.*/);
		await expect(about).not.toHaveAttribute("aria-current", /.*/);
	});

	test("ArrowUp wraps the active indicator back to the last item", async ({
		page,
	}) => {
		await page.goto("/");
		await page.locator("[data-menu-item]").first().focus();
		await page.keyboard.press("ArrowUp");
		const skills = page.getByRole("link", { name: "Skills" });
		const about = page.getByRole("link", { name: "About" });
		await expect(skills).toHaveAttribute("data-active", /.*/);
		await expect(skills).toHaveAttribute("aria-current", "page");
		await expect(about).not.toHaveAttribute("aria-current", /.*/);
	});

	test("the shell focus outline is removed; the translucent wedge marks the focused item", async ({
		page,
	}) => {
		await page.goto("/");
		await page.locator("[data-menu-item]").first().focus();
		await page.keyboard.press("ArrowDown");
		const resume = page.getByRole("link", { name: "Resume" });
		await expect(resume).toBeFocused();
		await expect(resume).toHaveAttribute("data-active", /.*/);
		// Home-shell delta: the visible browser outline is dropped on the
		// shell menu anchor — the white wedge is the focus indicator.
		// (Chromium keeps the declared outline-width in the computed style;
		// outline-style none is what makes it invisible.)
		const outline = await resume.evaluate((element) => {
			const style = getComputedStyle(element);
			return { style: style.outlineStyle };
		});
		expect(outline.style).toBe("none");
		// The focused item draws the wedge (its ::before paints translucent
		// white), so focus stays visibly marked.
		const wedge = await resume.evaluate(
			(element) => getComputedStyle(element, "::before").backgroundColor,
		);
		expect(wedge).not.toBe("rgba(0, 0, 0, 0)");
		const underline = await resume.evaluate(
			(element) => getComputedStyle(element, "::after").display,
		);
		expect(underline).toBe("none");
	});

	test("shell hover keeps the cyan label and never overrides the active black", async ({
		page,
	}) => {
		await page.goto("/");
		const about = page.getByRole("link", { name: "About" });
		// The active item stays black while hovered.
		await expect(about).toHaveAttribute("data-active", /.*/);
		await about.hover();
		await expect(about).toHaveCSS("color", "rgb(4, 6, 15)");
		// A hovered non-active item keeps the cyan label color.
		const projects = page.getByRole("link", { name: "Projects" });
		await projects.hover();
		await expect(projects).toHaveCSS("color", "rgb(56, 225, 255)");
	});
});

// Browser-level proof for keyboard cursor coherence (reference-driven-view-redesign,
// persona-navigation delta): the keyboard cursor — DOM focus, the active item,
// and (on views) the roving tabindex — moves as one. Tab synchronizes the shell
// cursor so Tab-then-arrow stays coherent and Tab-then-Enter activates the
// focused item; on views, focus rests on the active item on entry, arrows move
// focus and active together, Enter/ArrowRight open the focused item's panel,
// Escape restores focus through the hierarchy, and inactive screens never react.
test.describe("keyboard cursor coherence (#6186)", () => {
	const menuItem = (page: Page, name: string) =>
		page.getByRole("link", { name });

	test("Tab then ArrowDown keeps the cursor coherent", async ({ page }) => {
		await page.goto("/");
		// Keyboard-only entry: the shell focuses its first item on load.
		await expect(menuItem(page, "About")).toBeFocused();
		// Tab to SKILLS: About → Resume → Projects → Skills.
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");
		await expect(menuItem(page, "Skills")).toBeFocused();
		await expect(menuItem(page, "Skills")).toHaveAttribute("data-active", /.*/);
		await expect(menuItem(page, "Skills")).toHaveAttribute(
			"aria-current",
			"page",
		);
		// ArrowDown from the Tab-synced cursor at the last item wraps to
		// ABOUT — no teleport.
		await page.keyboard.press("ArrowDown");
		await expect(menuItem(page, "About")).toBeFocused();
		await expect(menuItem(page, "About")).toHaveAttribute("data-active", /.*/);
		await expect(menuItem(page, "About")).toHaveAttribute(
			"aria-current",
			"page",
		);
		await expect(menuItem(page, "Skills")).not.toHaveAttribute(
			"data-active",
			/.*/,
		);
	});

	test("Tab directly to an item then Enter activates the focused item", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(menuItem(page, "About")).toBeFocused();
		await page.keyboard.press("Tab");
		await expect(menuItem(page, "Resume")).toBeFocused();
		await expect(menuItem(page, "Resume")).toHaveAttribute("data-active", /.*/);
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(/\/resume$/);
		await expect(
			page.getByRole("heading", { level: 1, name: "Resume" }),
		).toBeVisible();
	});

	test("Tab and Shift+Tab wrap inside the menu and keep the cursor synced", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(menuItem(page, "About")).toBeFocused();
		// Tab through all four items to the last one.
		for (let index = 0; index < 3; index += 1) {
			await page.keyboard.press("Tab");
		}
		await expect(menuItem(page, "Skills")).toBeFocused();
		await expect(menuItem(page, "Skills")).toHaveAttribute("data-active", /.*/);
		// Tab wraps back to the first item, cursor follows.
		await page.keyboard.press("Tab");
		await expect(menuItem(page, "About")).toBeFocused();
		await expect(menuItem(page, "About")).toHaveAttribute("data-active", /.*/);
		await expect(menuItem(page, "About")).toHaveAttribute(
			"aria-current",
			"page",
		);
		// Shift+Tab wraps back to the last item, cursor follows.
		await page.keyboard.press("Shift+Tab");
		await expect(menuItem(page, "Skills")).toBeFocused();
		await expect(menuItem(page, "Skills")).toHaveAttribute("data-active", /.*/);
	});

	test("entering a list view focuses the active item", async ({ page }) => {
		await page.goto("/projects");
		await expect(page.getByRole("link", { name: "ServiceFlow" })).toBeFocused();
		// A hash-preselected active item receives focus on entry too.
		await page.goto("/projects#eventcommerce");
		await expect(
			page.getByRole("link", { name: "EventCommerce" }),
		).toBeFocused();
	});

	test("arrows move DOM focus and the active item together", async ({
		page,
	}) => {
		await page.goto("/projects");
		await expect(page.getByRole("link", { name: "ServiceFlow" })).toBeFocused();
		await page.keyboard.press("ArrowDown");
		await expect(page.getByRole("link", { name: "WealthQuest" })).toBeFocused();
		await expect(
			page.getByRole("link", { name: "WealthQuest" }),
		).toHaveAttribute("data-active", /.*/);
		await expect(
			page.getByRole("link", { name: "WealthQuest" }),
		).toHaveAttribute("aria-current", /.*/);
		await page.keyboard.press("ArrowDown");
		await expect(
			page.getByRole("link", { name: "EventCommerce" }),
		).toBeFocused();
		await expect(
			page.getByRole("link", { name: "EventCommerce" }),
		).toHaveAttribute("data-active", /.*/);
		await expect(
			page.getByRole("link", { name: "ServiceFlow" }),
		).not.toHaveAttribute("data-active", /.*/);
		// Wrapping (nine-record collection): walk to the last record, then
		// one more ArrowDown wraps back to the first.
		for (let step = 0; step < 6; step += 1) {
			await page.keyboard.press("ArrowDown");
		}
		await expect(page.getByRole("link", { name: "raguard" })).toBeFocused();
		await page.keyboard.press("ArrowDown");
		await expect(page.getByRole("link", { name: "ServiceFlow" })).toBeFocused();
	});

	test("Enter on a focused project row opens its URL in a new tab; ArrowRight never opens", async ({
		page,
		context,
	}) => {
		await page.goto("/projects");
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("ArrowDown");
		await expect(
			page.getByRole("link", { name: "EventCommerce" }),
		).toBeFocused();
		// ArrowRight is inert on the projects carousel (activation is the
		// link's own; the generic open must not run).
		await page.keyboard.press("ArrowRight");
		await expect(
			page.getByRole("link", { name: "EventCommerce" }),
		).toBeFocused();
		await expect(page.locator("[data-detail-panel]:focus")).toHaveCount(0);
		// Enter is native link activation: the URL opens in a new tab and
		// the row keeps the focus.
		const popupPromise = context.waitForEvent("page");
		await page.keyboard.press("Enter");
		const popup = await popupPromise;
		await popup.waitForURL("https://github.com/jonasotoaguilar/eventcommerce", {
			waitUntil: "commit",
		});
		await expect(
			page.getByRole("link", { name: "EventCommerce" }),
		).toBeFocused();
	});

	test("roving tabindex leaves a single tab stop in the list", async ({
		page,
	}) => {
		await page.goto("/projects");
		const serviceflow = page.getByRole("link", { name: "ServiceFlow" });
		const wealthquest = page.getByRole("link", { name: "WealthQuest" });
		const eventcommerce = page.getByRole("link", { name: "EventCommerce" });
		await expect(serviceflow).toHaveAttribute("tabindex", "0");
		await expect(wealthquest).toHaveAttribute("tabindex", "-1");
		await expect(eventcommerce).toHaveAttribute("tabindex", "-1");
		await page.keyboard.press("ArrowDown");
		await expect(wealthquest).toHaveAttribute("tabindex", "0");
		await expect(serviceflow).toHaveAttribute("tabindex", "-1");
		// Tab leaves the single tab stop — never into a sibling row or into
		// the detail panel (the projects panel is not in the tab order).
		await page.keyboard.press("Tab");
		await expect(eventcommerce).not.toBeFocused();
		await expect(page.locator("[data-detail-panel]:focus")).toHaveCount(0);
	});

	test("Escape on PROJECTS goes straight to the menu (no closable panel)", async ({
		page,
	}) => {
		await page.goto("/projects");
		const serviceflow = page.getByRole("link", { name: "ServiceFlow" });
		await expect(serviceflow).toBeFocused();
		await page.keyboard.press("Escape");
		await expect(page).toHaveURL(/\/$/);
		await expect(menuItem(page, "About")).toBeFocused();
	});

	test("inactive screens never react to cursor keys", async ({ page }) => {
		await page.goto("/about");
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("ArrowUp");
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(/\/about$/);
		await expect(page.locator("body")).toBeFocused();
	});

	test("keyboard-only journey: shell to list view and back, cursor stays coherent", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(menuItem(page, "About")).toBeFocused();
		// Reach PROJECTS with keys only.
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("ArrowDown");
		await expect(menuItem(page, "Projects")).toBeFocused();
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(/\/projects$/);
		await expect(page.getByRole("link", { name: "ServiceFlow" })).toBeFocused();
		// Move the view cursor, then leave with Escape (the projects detail
		// stage never closes; Escape goes straight to the menu).
		await page.keyboard.press("ArrowDown");
		await expect(page.getByRole("link", { name: "WealthQuest" })).toBeFocused();
		await page.keyboard.press("Escape");
		await expect(page).toHaveURL(/\/$/);
		// Back on the shell after the swap, then re-enter the view: the
		// cursor must move exactly one step per key — a leaked before-swap
		// document handler would double-move on the second visit.
		await expect(menuItem(page, "About")).toBeFocused();
		await page.keyboard.press("ArrowDown");
		await expect(menuItem(page, "Resume")).toBeFocused();
		await expect(menuItem(page, "Resume")).toHaveAttribute("data-active", /.*/);
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(/\/projects$/);
		await expect(page.getByRole("link", { name: "ServiceFlow" })).toBeFocused();
		await page.keyboard.press("ArrowDown");
		await expect(page.getByRole("link", { name: "WealthQuest" })).toBeFocused();
		await expect(
			page.getByRole("link", { name: "EventCommerce" }),
		).not.toBeFocused();
	});

	test("clicking the inert projects background keeps ArrowDown/Enter navigation alive", async ({
		page,
		context,
	}) => {
		await page.goto("/projects");
		await expect(page.getByRole("link", { name: "ServiceFlow" })).toBeFocused();
		// Click an inert page background point (top-left of the screen, away
		// from the list, the back link, and the mute control): the click
		// blurs the row and leaves focus on the body — the bug precondition.
		await page.mouse.click(30, 80);
		await expect(page.locator("body")).toBeFocused();
		await expect(
			page.getByRole("link", { name: "ServiceFlow" }),
		).not.toBeFocused();
		// ArrowDown still moves the cursor and restores focus into the list.
		await page.keyboard.press("ArrowDown");
		await expect(page.getByRole("link", { name: "WealthQuest" })).toBeFocused();
		await expect(
			page.getByRole("link", { name: "WealthQuest" }),
		).toHaveAttribute("data-active", /.*/);
		// Enter still opens the active project link in a new tab and the row
		// keeps the focus.
		const popupPromise = context.waitForEvent("page");
		await page.keyboard.press("Enter");
		const popup = await popupPromise;
		await popup.waitForURL("https://jonasotoaguilar.itch.io/wealthquest", {
			waitUntil: "commit",
		});
		await expect(page.getByRole("link", { name: "WealthQuest" })).toBeFocused();
	});
});

// Browser-level proof for the centered diagonal staggered menu
// (persona-navigation + home-shell contract): the menu column is horizontally
// centered at desktop widths (the nav shrinks to its widest row and the flex
// shell centers it; each row centers its own label), every item carries the
// exact design AD1 inline vars (--item-x / --item-skew / --item-size,
// PROJECTS largest) consumed by one .menu-item rule, with pairwise
// non-overlap; regular rows sit at −14° and PROJECTS at −16°; tablet halves
// offsets and per-item skews (calc(var(--item-skew) / 2)); coarse pointer and
// <768px collapse to uniform-size non-colliding ≥44px targets with a 12px gap.

// Parsed in the browser: returns the CSS transform matrix as
// [a, b, c, d, tx, ty] (identity when no transform applies).
const rowMatrix = (label: string) => (page: Page) =>
	page
		.getByRole("link", { name: label })
		.locator("xpath=..")
		.evaluate((row) => {
			const transform = getComputedStyle(row).transform;
			if (!transform || transform === "none") return [1, 0, 0, 1, 0, 0];
			const values = transform
				.match(/matrix\(([^)]+)\)/)?.[1]
				.split(",")
				.map((value) => Number(value.trim()));
			if (values?.length !== 6) return [1, 0, 0, 1, 0, 0];
			return [values[0], values[1], values[2], values[3], values[4], values[5]];
		});

test.describe("diagonal staggered menu", () => {
	const EXPECTED_DESKTOP = [
		{ label: "About", tx: -36, skewDeg: -14 },
		{ label: "Resume", tx: 24, skewDeg: -14 },
		{ label: "Projects", tx: -48, skewDeg: -16 },
		{ label: "Skills", tx: 36, skewDeg: -14 },
	];

	test("desktop: centered diagonal menu column, exact AD1 offsets and skews, PROJECTS largest, no overlap", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto("/");

		// New contract: the menu column is horizontally centered (no fixed
		// 55vw column) — the nav box's center sits on the viewport center.
		const nav = await page.locator("[data-menu]").boundingBox();
		if (!nav) throw new Error("expected a visible menu column");
		expect(Math.abs(nav.x + nav.width / 2 - 640)).toBeLessThanOrEqual(2);

		for (const { label, tx, skewDeg } of EXPECTED_DESKTOP) {
			const [a, b, c, d, actualTx, actualTy] = await rowMatrix(label)(page);
			expect(a).toBe(1);
			expect(b).toBe(0);
			expect(d).toBe(1);
			expect(Math.abs(actualTx - tx)).toBeLessThanOrEqual(1);
			expect(actualTy).toBe(0);
			expect(
				Math.abs(c - Math.tan((skewDeg * Math.PI) / 180)),
			).toBeLessThanOrEqual(0.01);
		}

		// PROJECTS is the largest item (design AD1).
		const fontSizes = await page
			.locator("[data-menu-item]")
			.evaluateAll((items) =>
				items.map((item) => parseFloat(getComputedStyle(item).fontSize)),
			);
		expect(fontSizes).toHaveLength(4);
		expect(fontSizes[2]).toBeGreaterThan(
			Math.max(fontSizes[0], fontSizes[1], fontSizes[3]),
		);

		// Pairwise non-overlap once the entrance animation settles.
		await expect
			.poll(async () => {
				const rects = await page
					.locator("[data-menu-item]")
					.evaluateAll((items) =>
						items.map((item) => {
							const box = item.getBoundingClientRect();
							return {
								top: box.top,
								bottom: box.bottom,
								left: box.left,
								right: box.right,
							};
						}),
					);
				let maxOverlap = -Infinity;
				for (let i = 0; i < rects.length; i++) {
					for (let j = i + 1; j < rects.length; j++) {
						const overlapX =
							Math.min(rects[i].right, rects[j].right) -
							Math.max(rects[i].left, rects[j].left);
						const overlapY =
							Math.min(rects[i].bottom, rects[j].bottom) -
							Math.max(rects[i].top, rects[j].top);
						maxOverlap = Math.max(maxOverlap, Math.min(overlapX, overlapY));
					}
				}
				return maxOverlap;
			})
			.toBeLessThanOrEqual(0.5);
	});

	test("tablet 768–1023px: half offsets and half per-item skews", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 900, height: 800 });
		await page.goto("/");

		// The tablet contract halves the desktop values per item: −5° regular,
		// −6° for PROJECTS (skewDeg / 2).
		for (const { label, tx, skewDeg } of EXPECTED_DESKTOP) {
			const [, , c, , actualTx] = await rowMatrix(label)(page);
			expect(Math.abs(actualTx - tx / 2)).toBeLessThanOrEqual(1);
			expect(
				Math.abs(c - Math.tan(((skewDeg / 2) * Math.PI) / 180)),
			).toBeLessThanOrEqual(0.01);
		}
	});
});

test.describe("diagonal staggered menu — coarse collapse", () => {
	const assertCollapsed = async (page: Page) => {
		await page.goto("/");

		// Stagger and skew collapse to identity transforms.
		const transforms = await page
			.locator("[data-menu-item]")
			.evaluateAll((items) =>
				items.map((item) => {
					const row = item.parentElement;
					if (!row) throw new Error("menu item missing its row");
					const transform = getComputedStyle(row).transform;
					if (!transform || transform === "none") return "collapsed";
					const values = transform
						.match(/matrix\(([^)]+)\)/)?.[1]
						.split(",")
						.map((value) => Number(value.trim()));
					return values && values[4] === 0 && values[2] === 0
						? "collapsed"
						: "staggered";
				}),
			);
		expect(transforms).toHaveLength(4);
		for (const state of transforms) expect(state).toBe("collapsed");

		// Uniform clamp size across all items.
		const fontSizes = await page
			.locator("[data-menu-item]")
			.evaluateAll((items) =>
				items.map((item) => parseFloat(getComputedStyle(item).fontSize)),
			);
		expect(Math.max(...fontSizes) - Math.min(...fontSizes)).toBeLessThanOrEqual(
			0.5,
		);

		// Every item stays a non-colliding target of at least 44px with a 12px gap.
		const boxes = await page.locator("[data-menu-item]").evaluateAll((items) =>
			items.map((item) => {
				const box = item.getBoundingClientRect();
				return {
					top: box.top,
					bottom: box.bottom,
					left: box.left,
					right: box.right,
					height: box.height,
				};
			}),
		);
		expect(boxes).toHaveLength(4);
		for (const box of boxes) expect(box.height).toBeGreaterThanOrEqual(44);

		// The 12px gap lives on the flex rows (li boxes), not the label line box.
		const rows = await page.locator("[data-menu-item]").evaluateAll((items) =>
			items.map((item) => {
				const row = item.parentElement;
				if (!row) throw new Error("menu item missing its row");
				const box = row.getBoundingClientRect();
				return { top: box.top, bottom: box.bottom };
			}),
		);
		for (let i = 1; i < rows.length; i++) {
			expect(rows[i].top - rows[i - 1].bottom).toBeGreaterThanOrEqual(10);
			expect(rows[i].top - rows[i - 1].bottom).toBeLessThanOrEqual(14);
		}

		for (let i = 0; i < boxes.length; i++) {
			for (let j = i + 1; j < boxes.length; j++) {
				const overlapX =
					Math.min(boxes[i].right, boxes[j].right) -
					Math.max(boxes[i].left, boxes[j].left);
				const overlapY =
					Math.min(boxes[i].bottom, boxes[j].bottom) -
					Math.max(boxes[i].top, boxes[j].top);
				expect(Math.min(overlapX, overlapY)).toBeLessThanOrEqual(0.5);
			}
		}
	};

	test.use({
		hasTouch: true,
		isMobile: true,
		viewport: { width: 390, height: 844 },
	});

	test("coarse mobile viewport collapses the stagger to ≥44px uniform targets", async ({
		page,
	}) => {
		await assertCollapsed(page);
	});

	test.use({ hasTouch: true, viewport: { width: 1024, height: 768 } });

	test("coarse pointer at desktop width still collapses the stagger", async ({
		page,
	}) => {
		await assertCollapsed(page);
	});
});

// Browser-level proof for the global light contrast-cut field (field
// contract): the shell shares the static white-to-light-blue-to-sea-blue
// diagonal gradient family at 112deg, while the 404 keeps the dark radial
// glow untouched. /skills (skills contract) swaps the gradient for a solid
// sea-blue base plus a corner-to-corner white parallelogram; /about
// (about-view contract) swaps it for the sea-blue band variant (solid
// sea-blue field with a white polygon-cut band).
test.describe("global light field composition", () => {
	// Computed backgroundImage serializes as
	// "linear-gradient(112deg, rgb(...) 0%, rgb(...) 20%, ...)"; two-position
	// stops ("rgb(...) 0% 40%") may serialize either expanded (one stop per
	// position) or compact (both positions after one color), so parse every
	// (color, position) pair from either shape. Assertions then survive
	// serialization differences in spacing, position shape, and color syntax.
	const parseStops = (image: string) =>
		[
			...image.matchAll(
				/((?:rgb|rgba)\([^)]*\))\s+(-?[\d.]+)%(?:\s+(-?[\d.]+)%)?/g,
			),
		].flatMap((m) => {
			const first = { color: m[1], pos: Number.parseFloat(m[2]) };
			return m[3] !== undefined
				? [first, { color: m[1], pos: Number.parseFloat(m[3]) }]
				: [first];
		});
	const lastWhite = (stops: { color: string; pos: number }[]) =>
		stops.filter((s) => s.color === "rgb(255, 255, 255)").at(-1)?.pos;
	const firstSeaBlue = (stops: { color: string; pos: number }[]) =>
		stops.find((s) => s.color === "rgb(22, 119, 200)")?.pos;
	const near = (actual: number | undefined, expected: number) =>
		actual !== undefined && Math.abs(actual - expected) <= 3;

	test("shell shares the left-biased diagonal gradient; skills and about overlay their band variants; the 404 keeps the dark glow", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1280, height: 720 });

		// The shell keeps the original left-biased field:
		// white through ~20%, sea blue from ~30%, at 112deg.
		for (const path of ["/"]) {
			await page.goto(path);
			const image = await page
				.locator(".glow-layer")
				.evaluate((el) => getComputedStyle(el).backgroundImage);
			expect(image, `${path} is the static light field`).toContain(
				"linear-gradient",
			);
			expect(image).toContain("112deg");
			expect(image).toContain("rgb(255, 255, 255)");
			expect(image).toContain("rgb(188, 212, 255)");
			expect(image).toContain("rgb(22, 119, 200)");
			const stops = parseStops(image);
			expect(
				near(lastWhite(stops), 20),
				`${path} keeps the left-biased white cut`,
			).toBe(true);
			expect(
				near(firstSeaBlue(stops), 30),
				`${path} keeps the left-biased sea-blue start`,
			).toBe(true);
		}

		// The shell glow is static: no breathing animation.
		await page.goto("/");
		const shellAnimation = await page
			.locator(".glow-layer")
			.evaluate((el) => getComputedStyle(el).animationName);
		expect(shellAnimation).toBe("none");

		// About (about-view contract) swaps the shared gradient for the
		// sea-blue band variant: a solid sea-blue field with a white
		// polygon-cut band.
		await page.goto("/about");
		const aboutGlow = await page.locator(".glow-layer").evaluate((el) => {
			const style = getComputedStyle(el);
			return {
				image: style.backgroundImage,
				color: style.backgroundColor,
				cutout: getComputedStyle(el, "::before").backgroundColor,
				cutoutClip: getComputedStyle(el, "::before").clipPath,
			};
		});
		expect(aboutGlow.image).toBe("none");
		expect(aboutGlow.color).toBe("rgb(22, 119, 200)");
		expect(aboutGlow.cutout).toBe("rgb(255, 255, 255)");
		expect(aboutGlow.cutoutClip).not.toBe("none");

		// /skills replaces the gradient transition with a solid sea-blue base
		// plus a single wide white parallelogram painted by a ::before child,
		// clipped corner-to-corner (upper-right and lower-left) so the
		// upper-left and lower-right corners stay blue.
		await page.goto("/skills");
		const skillsBase = await page.locator(".glow-layer").evaluate((el) => {
			const style = getComputedStyle(el);
			return { color: style.backgroundColor, image: style.backgroundImage };
		});
		expect(
			skillsBase.image,
			"skills base is a solid color, not a gradient band",
		).toBe("none");
		expect(skillsBase.color, "skills base is sea blue").toBe(
			"rgb(22, 119, 200)",
		);
		const skillsCutout = await page.locator(".glow-layer").evaluate((el) => {
			const style = getComputedStyle(el, "::before");
			return {
				color: style.backgroundColor,
				position: style.position,
				clipPath: style.clipPath,
			};
		});
		expect(
			skillsCutout.position,
			"skills ::before is absolutely positioned",
		).toBe("absolute");
		expect(skillsCutout.color, "skills ::before is white").toBe(
			"rgb(255, 255, 255)",
		);
		expect(skillsCutout.clipPath, "skills ::before is a polygon").toContain(
			"polygon",
		);
		// Serialization-safe polygon check: browsers may normalize spacing,
		// "%" suffixes, or unitless zeros to "0px", so parse the coordinate
		// pairs and match the approved corner-to-corner points within the
		// same tolerance as the stops.
		const polygonPoints = [
			...skillsCutout.clipPath.matchAll(
				/(-?[\d.]+)(?:%|px)?\s+(-?[\d.]+)(?:%|px)?/g,
			),
		].map((m) => [Number.parseFloat(m[1]), Number.parseFloat(m[2])]);
		for (const [x, y] of [
			[65, 0],
			[130, 0],
			[65, 100],
			[0, 100],
		]) {
			expect(
				polygonPoints.some(([px, py]) => near(px, x) && near(py, y)),
				`skills parallelogram touches (${x}%, ${y}%)`,
			).toBe(true);
		}

		// The 404 error route keeps the dark radial glow untouched — both the
		// literal /404 route and unknown paths (e.g. /contact), which render
		// 404.astro with their own data-route value.
		for (const path of ["/404", "/contact"]) {
			await page.goto(path);
			const notFoundGlow = await page
				.locator(".glow-layer")
				.evaluate((el) => getComputedStyle(el).backgroundImage);
			expect(notFoundGlow, `${path} keeps the dark glow`).toContain(
				"radial-gradient",
			);
			expect(notFoundGlow).toContain("rgb(13, 37, 96)");
		}
	});

	test("vertical PORTFOLIO watermark bleeds off the left edge, aria-hidden", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto("/");
		const watermark = page.locator(".shell-watermark");
		await expect(watermark).toHaveText("PORTFOLIO");
		await expect(watermark).toHaveAttribute("aria-hidden", "true");
		await expect(watermark).toHaveCSS("writing-mode", "vertical-rl");
		await expect(watermark).toHaveCSS("color", "rgb(4, 6, 15)");
		const box = await watermark.boundingBox();
		if (!box) throw new Error("expected a visible watermark");
		// Intentionally cropped: the word starts off the left edge and only a
		// vertical strip of the glyphs is visible, filling most of the height.
		expect(box.x).toBeLessThan(0);
		expect(box.x + box.width).toBeGreaterThan(0);
		expect(box.width).toBeGreaterThan(30);
		expect(box.height).toBeGreaterThan(0.8 * 720);
	});

	test("name card removed: the top-right utility position holds only the mute control", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto("/");
		// The outlined identity card is gone from the shell; the owner name
		// still exists as the page's sr-only heading.
		await expect(page.locator(".shell-name-card")).toHaveCount(0);
		await expect(
			page.getByRole("heading", { name: "Jonathan Soto" }),
		).toBeVisible();
		// The utility position is occupied by the mute control alone, and the
		// name never surfaces as an interactive control.
		await expect(page.locator("[data-mute-control]")).toBeVisible();
		await expect(page.getByRole("link", { name: "Jonathan Soto" })).toHaveCount(
			0,
		);
		await expect(
			page.getByRole("button", { name: "Jonathan Soto" }),
		).toHaveCount(0);
	});
});

// Browser-level proof for the home-shell light-field palette (home-shell
// contract delta): menu labels are cyan on the shell — Resume (2nd) and
// Skills (4th) one lighter step — the keyboard-active and :focus-visible item
// turns near-black in both states (hover never overrides it), and the
// auxiliary text (key hints, MOVE/SELECT/BACK labels, mute control) is
// white with a black outline over the blue gradient. Dark-route palettes
// stay untouched.
test.describe("home shell light-field palette", () => {
	// Relative luminance (WCAG): true lightness ordering independent of the
	// exact resolved color-mix rounding.
	const luminance = (rgb: string): number => {
		const [r, g, b] = rgb
			.match(/\d+/g)!
			.map(Number)
			.map((v) => {
				const c = v / 255;
				return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
			});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	};

	test("menu labels are cyan, with Resume and Skills one lighter step", async ({
		page,
	}) => {
		await page.goto("/");
		// About carries data-active on load, so it is black, not cyan; the
		// auto-waiting assertion lets its 150ms color transition settle.
		const about = page.getByRole("link", { name: "About" });
		await expect(about).toHaveCSS("color", "rgb(4, 6, 15)");
		const color = async (name: string) =>
			page
				.getByRole("link", { name })
				.evaluate((el) => getComputedStyle(el).color);
		const resume = await color("Resume");
		const projects = await color("Projects");
		const skills = await color("Skills");
		expect(projects).toBe("rgb(56, 225, 255)");
		expect(resume).not.toBe(projects);
		expect(skills).not.toBe(projects);
		expect(luminance(resume)).toBeGreaterThan(luminance(projects));
		expect(luminance(skills)).toBeGreaterThan(luminance(projects));
	});

	test("the active and focus-visible shell item turns black; hover never overrides it", async ({
		page,
	}) => {
		await page.goto("/");
		const about = page.getByRole("link", { name: "About" });
		await expect(about).toHaveCSS("color", "rgb(4, 6, 15)");
		await about.hover();
		await expect(about).toHaveCSS("color", "rgb(4, 6, 15)");
		// Tab-focusing a lighter item turns it black too.
		await page.keyboard.press("Tab");
		const resume = page.getByRole("link", { name: "Resume" });
		await expect(resume).toBeFocused();
		await expect(resume).toHaveCSS("color", "rgb(4, 6, 15)");
	});

	test("only the active/focus-visible item draws the translucent white wedge accent", async ({
		page,
	}) => {
		await page.goto("/");
		// About carries data-active + focus on load, so its ::before is the
		// large translucent white wedge laid over the whole word; the item
		// isolates its stacking context so the pseudo paints at z-index 1
		// under the crisp black .menu-label at z-index 2.
		const beforeStyle = (locator: Locator) =>
			locator.evaluate((el) => {
				const style = getComputedStyle(el, "::before");
				const rect = el.getBoundingClientRect();
				const px = (v: string) => parseFloat(v);
				return {
					background: style.backgroundColor,
					clipPath: style.clipPath,
					zIndex: style.zIndex,
					// The wedge's own box, from the item's rect plus its insets.
					rect: {
						left: rect.left + px(style.left),
						right: rect.right - px(style.right),
						top: rect.top + px(style.top),
						bottom: rect.bottom - px(style.bottom),
					},
				};
			});
		const about = page.getByRole("link", { name: "About" });
		await expect(about).toHaveCSS("isolation", "isolate");
		const active = await beforeStyle(about);
		// Brighter translucent white wedge: 60% white over the light-blue
		// field (color(srgb 1 1 1 / 0.6) in Chromium), not the old cyan
		// triangle.
		expect(active.background).toBe("color(srgb 1 1 1 / 0.6)");
		// Angular wedge shape with BOTH edges diagonal — left edge from 0% to
		// 10%, right edge from 100% to 86% — a long slanted panel with a
		// pointed end, NOT the previous 0.7em point (50% 100% apex) and not a
		// rectangle with a straight vertical left edge (0% 100% corner).
		expect(active.clipPath).toContain("polygon(");
		expect(active.clipPath).toContain("86% 100%");
		expect(active.clipPath).toContain("10% 100%");
		expect(active.clipPath).not.toContain("50% 100%");
		expect(active.clipPath).not.toContain("0 100%");
		expect(active.zIndex).toBe("1");
		// The wedge spans the whole item box — within a few px of every
		// edge (≤5% of the item's em) — so it covers the entire word; it is
		// NOT a small point accent. The em-based slack absorbs sub-pixel
		// flex centering of the label span.
		const anchor = await about.boundingBox();
		if (!anchor) throw new Error("expected a visible menu item");
		const fontSize = parseFloat(
			await about.evaluate((el) => getComputedStyle(el).fontSize),
		);
		const emSlack = 0.05 * fontSize;
		expect(active.rect.left).toBeLessThanOrEqual(anchor.x + 2);
		expect(active.rect.right).toBeGreaterThanOrEqual(
			anchor.x + anchor.width - 2,
		);
		expect(active.rect.top).toBeLessThanOrEqual(anchor.y + emSlack);
		expect(active.rect.bottom).toBeGreaterThanOrEqual(
			anchor.y + anchor.height - emSlack,
		);
		// And it is wider than the label span on both sides.
		const label = await about.locator(".menu-label").boundingBox();
		if (!label) throw new Error("expected a visible menu label span");
		expect(active.rect.left).toBeLessThanOrEqual(label.x);
		expect(active.rect.right).toBeGreaterThanOrEqual(label.x + label.width);
		// The black label stays crisp above the wedge.
		await expect(about.locator(".menu-label")).toHaveCSS("z-index", "2");
		await expect(about.locator(".menu-label")).toHaveCSS(
			"position",
			"relative",
		);

		// An inactive, non-hovered item has no accent layer at all.
		const projects = page.getByRole("link", { name: "Projects" });
		const inactive = await beforeStyle(projects);
		expect(inactive.background).toBe("rgba(0, 0, 0, 0)");
		expect(inactive.clipPath).toBe("none");

		// Moving focus moves the wedge: the newly focused item gets it and
		// the previously active one loses it.
		await page.keyboard.press("Tab");
		const resume = page.getByRole("link", { name: "Resume" });
		await expect(resume).toBeFocused();
		await expect(resume).toHaveCSS("isolation", "isolate");
		expect((await beforeStyle(resume)).background).toBe(
			"color(srgb 1 1 1 / 0.6)",
		);
		expect((await beforeStyle(about)).background).toBe("rgba(0, 0, 0, 0)");
	});

	test("auxiliary shell text is white with a subtle black outline in the display face; views share it, dark error routes keep their palette", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await page.goto("/");
		const strokeWidth = (locator: Locator) =>
			locator.evaluate((el) =>
				getComputedStyle(el).getPropertyValue("-webkit-text-stroke-width"),
			);
		const fontFamily = (locator: Locator) =>
			locator.evaluate((el) => getComputedStyle(el).fontFamily);
		const hints = page.locator(".key-hints");
		await expect(hints).toHaveCSS("color", "rgb(255, 255, 255)");
		// Very subtle outline: 0.3px, down from the previous 0.5px.
		expect(await strokeWidth(hints)).toBe("0.3px");
		// Shell auxiliary text uses the display face (Anton — the menu voice),
		// never a system sans or the condensed label face (Bebas Neue).
		expect(await fontFamily(hints)).toContain("Anton");
		expect(await fontFamily(hints)).not.toContain("Bebas");
		await expect(hints.locator("span").first()).toHaveCSS(
			"color",
			"rgb(255, 255, 255)",
		);
		const kbd = hints.locator("kbd").first();
		await expect(kbd).toHaveCSS("color", "rgb(255, 255, 255)");
		expect(await fontFamily(kbd)).toContain("Anton");
		// Keycaps grow to the label step (1.25rem) so the arrow glyphs stay
		// large and readable over the busy shell field.
		const kbdSize = parseFloat(
			await kbd.evaluate((el) => getComputedStyle(el).fontSize),
		);
		expect(kbdSize).toBeGreaterThanOrEqual(20);
		const mute = page.locator(".mute-control");
		await expect(mute).toHaveCSS("color", "rgb(255, 255, 255)");
		expect(await strokeWidth(mute)).toBe("0.3px");
		// A view route shares the same light-field auxiliary treatment.
		await page.goto("/projects");
		await expect(page.locator(".key-hints")).toHaveCSS(
			"color",
			"rgb(255, 255, 255)",
		);
		expect(await fontFamily(page.locator(".key-hints"))).toContain("Anton");
		// The dark error route keeps the dark palette and the condensed label
		// face.
		await page.goto("/404");
		await expect(page.locator(".key-hints")).toHaveCSS(
			"color",
			"rgb(167, 167, 171)",
		);
		await expect(page.locator(".key-hints kbd").first()).toHaveCSS(
			"color",
			"rgb(255, 255, 255)",
		);
		expect(await fontFamily(page.locator(".key-hints"))).toContain("Bebas");
	});
});

test.describe("mute shortcut hint", () => {
	test("shows M mute immediately before Esc back", async ({ page }) => {
		await page.goto("/");
		const hints = page.locator(".key-hints");
		await expect(hints.locator("kbd").nth(2)).toHaveText("M");
		await expect(hints.locator("span").nth(2)).toContainText("mute");
		await expect(hints.locator("kbd").nth(3)).toHaveText("Esc");
		await expect(hints.locator("span").nth(3)).toContainText("back");

		const order = await hints.evaluate((element) => {
			const keys = [...element.querySelectorAll("kbd")];
			return Boolean(
				keys[2] &&
					keys[3] &&
					keys[2].compareDocumentPosition(keys[3]) &
						Node.DOCUMENT_POSITION_FOLLOWING,
			);
		});
		expect(order).toBe(true);
	});
});
