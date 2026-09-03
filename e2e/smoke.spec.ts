import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Smoke — verifies Playwright wiring and axe integration for the six-page build.
// Full coverage deferred per PRD R19.
test("smoke — index is accessible and routes exist", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Jonathan Soto/);
  // Wait for entrance animation to finish before axe (opacity transition causes false contrast)
  await page.waitForFunction(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-entrance]"));
    if (els.length === 0) return true;
    return els.every((el) => getComputedStyle(el).opacity === "1");
  });
  // Skip link must be focusable (after entrance, re-check focus)
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

for (const route of ["/projects", "/skills", "/experience", "/about", "/contact"]) {
  test(`smoke — ${route} loads`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator('nav[aria-label="Primary"]').first()).toBeVisible();
  });
}
