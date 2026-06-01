import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders key sections", async ({ page }) => {
    await page.goto("/");

    // Hero
    await expect(page.locator("h1")).toContainText("Jonathan Soto");

    // Projects section visible
    await expect(page.locator("#projects")).toBeAttached();

    // Navigation links
    await expect(page.locator("nav")).toBeAttached();
  });

  test("has proper meta tags", async ({ page }) => {
    await page.goto("/");

    const title = await page.title();
    expect(title).toContain("Jonathan Soto");

    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
    );
  });
});
