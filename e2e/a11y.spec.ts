import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["/", "/projects", "/skills", "/experience", "/about", "/contact"] as const;

async function waitForEntrance(page: import("@playwright/test").Page) {
  await page.waitForFunction(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-entrance]"));
    if (els.length === 0) return true;
    return els.every((el) => getComputedStyle(el).opacity === "1");
  });
}

for (const route of routes) {
  test(`a11y — ${route} has no axe violations`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    await waitForEntrance(page);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations,
      `axe violations on ${route}: ${JSON.stringify(results.violations, null, 2)}`,
    ).toEqual([]);
  });
}

test("a11y — 404 has no axe violations", async ({ page }) => {
  await page.goto("/this-route-does-not-exist-404-check");
  await expect(page.getByRole("heading", { level: 1, name: /404/i })).toBeVisible();
  await waitForEntrance(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations,
    `axe violations on 404: ${JSON.stringify(results.violations, null, 2)}`,
  ).toEqual([]);
});
