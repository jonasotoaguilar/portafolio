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
