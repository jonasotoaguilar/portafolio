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
