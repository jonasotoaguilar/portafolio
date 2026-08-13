import { expect, type Page, test } from "@playwright/test";

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
		await page.keyboard.press("ArrowDown");
		await expect(page.getByRole("link", { name: "Contact" })).toBeFocused();
		await page.keyboard.press("ArrowDown");
		await expect(page.getByRole("link", { name: "About" })).toBeFocused();
		await page.keyboard.press("ArrowUp");
		await expect(page.getByRole("link", { name: "Contact" })).toBeFocused();
		await page.keyboard.press("ArrowUp");
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
		const contact = page.getByRole("link", { name: "Contact" });
		const about = page.getByRole("link", { name: "About" });
		await expect(contact).toHaveAttribute("data-active", /.*/);
		await expect(contact).toHaveAttribute("aria-current", "page");
		await expect(about).not.toHaveAttribute("aria-current", /.*/);
	});

	test("the keyboard-focused item keeps a visible focus-visible outline", async ({
		page,
	}) => {
		await page.goto("/");
		await page.locator("[data-menu-item]").first().focus();
		await page.keyboard.press("ArrowDown");
		const resume = page.getByRole("link", { name: "Resume" });
		await expect(resume).toBeFocused();
		await expect(resume).toHaveAttribute("data-active", /.*/);
		const outline = await resume.evaluate((element) => {
			const style = getComputedStyle(element);
			return { width: style.outlineWidth, style: style.outlineStyle };
		});
		expect(outline.width).toBe("2px");
		expect(outline.style).not.toBe("none");
	});

	test("hover mirrors the active treatment color", async ({ page }) => {
		await page.goto("/");
		const projects = page.getByRole("link", { name: "Projects" });
		await projects.hover();
		await expect(projects).toHaveCSS("color", "rgb(93, 117, 255)");
	});
});

// Browser-level proof for the centered diagonal staggered menu
// (persona-navigation): a 55vw column at desktop widths where every item
// carries the exact design AD1 inline vars (--item-x / --item-skew /
// --item-size, PROJECTS largest) consumed by one .menu-item rule, with
// pairwise non-overlap; tablet halves offsets at −4°; coarse pointer and
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
		{ label: "About", tx: -36, skewDeg: -6 },
		{ label: "Resume", tx: 24, skewDeg: -6 },
		{ label: "Projects", tx: -48, skewDeg: -8 },
		{ label: "Skills", tx: 36, skewDeg: -6 },
		{ label: "Contact", tx: -16, skewDeg: -8 },
	];

	test("desktop: center-right 55vw column, exact AD1 offsets and skews, PROJECTS largest, no overlap", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto("/");

		const nav = await page.locator("[data-menu]").boundingBox();
		if (!nav) throw new Error("expected a visible menu column");
		expect(nav.width).toBeGreaterThan(0.53 * 1280);
		expect(nav.width).toBeLessThan(0.57 * 1280);
		// Column straddles (or sits right of) the horizontal center.
		expect(nav.x).toBeLessThanOrEqual(640);
		expect(nav.x + nav.width).toBeGreaterThanOrEqual(640);

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
		expect(fontSizes).toHaveLength(5);
		expect(fontSizes[2]).toBeGreaterThan(
			Math.max(fontSizes[0], fontSizes[1], fontSizes[3], fontSizes[4]),
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

	test("tablet 768–1023px: half offsets at −4° skew", async ({ page }) => {
		await page.setViewportSize({ width: 900, height: 800 });
		await page.goto("/");

		for (const { label, tx } of EXPECTED_DESKTOP) {
			const [, , c, , actualTx] = await rowMatrix(label)(page);
			expect(Math.abs(actualTx - tx / 2)).toBeLessThanOrEqual(1);
			expect(Math.abs(c - Math.tan((-4 * Math.PI) / 180))).toBeLessThanOrEqual(
				0.01,
			);
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
		expect(transforms).toHaveLength(5);
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
		expect(boxes).toHaveLength(5);
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
