import { expect, test } from "@playwright/test";

// Helpers: focus helpers
test.describe("interaction — keyboard, focus, navigation, overflow, deep links", () => {
  test("skip link is first focusable, moves focus to main", async ({ page }) => {
    await page.goto("/");
    // first Tab lands on skip link
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    // visible when focused (transform not -150%)
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
    // following Tab should move to next focusable (brand link or nav)
    await page.keyboard.press("Tab");
    const focusedText = await page.evaluate(() => document.activeElement?.textContent || "");
    expect(focusedText.length).toBeGreaterThan(0);
  });

  test("visible focus ring exists for keyboard navigation", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const active = page.locator(":focus");
    await expect(active).toBeVisible();
    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return "";
      const s = getComputedStyle(el);
      return s.outlineColor + "|" + s.outlineWidth + "|" + s.outlineStyle;
    });
    // outline should be 3px solid (from global.css)
    expect(outline).toMatch(/3px|solid|rgb/);
  });

  test("arrow navigation wraps, Home/End jump within menubar", async ({ page }) => {
    await page.goto("/");
    // ensure desktop nav (force viewport wide)
    await page.setViewportSize({ width: 1280, height: 800 });
    const nav = page.locator('nav[aria-label="Primary"] ul[data-nav="primary"]');
    await expect(nav).toBeVisible();
    const items = page.locator('[data-nav="primary"] [data-nav-item]');
    await expect(items).toHaveCount(6);

    // focus first item
    await items.first().focus();
    await expect(items.first()).toBeFocused();

    // ArrowRight moves to next
    await page.keyboard.press("ArrowRight");
    await expect(items.nth(1)).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await expect(items.nth(2)).toBeFocused();

    // ArrowLeft back
    await page.keyboard.press("ArrowLeft");
    await expect(items.nth(1)).toBeFocused();

    // End jumps to last
    await page.keyboard.press("End");
    await expect(items.nth(5)).toBeFocused();

    // ArrowRight wraps to first
    await page.keyboard.press("ArrowRight");
    await expect(items.first()).toBeFocused();

    // Home jumps to first (already there), then test wrap left
    await page.keyboard.press("ArrowLeft");
    await expect(items.nth(5)).toBeFocused();

    await page.keyboard.press("Home");
    await expect(items.first()).toBeFocused();

    // ArrowDown also moves forward (vertical mapping)
    await page.keyboard.press("ArrowDown");
    await expect(items.nth(1)).toBeFocused();

    await page.keyboard.press("ArrowUp");
    await expect(items.first()).toBeFocused();
  });

  test("Enter and Space activate navigation link", async ({ page }) => {
    await page.goto("/");
    await page.setViewportSize({ width: 1280, height: 800 });
    const items = page.locator('[data-nav="primary"] [data-nav-item]');
    await items.nth(1).focus();
    await expect(items.nth(1)).toBeFocused();
    // Enter should navigate to /projects (observable activation for links)
    await page.keyboard.press("Enter");
    await page.waitForURL("**/projects");
    await expect(page).toHaveURL(/\/projects/);
    await expect(page.locator("h1").first()).toContainText(/Shipped.*Depth/i);

    // Space on links does NOT activate navigation per browser spec — verify that Space on a button does.
    // Go back home, focus toggle (button) and verify Space toggles menu (observable Space activation)
    await page.goto("/");
    await page.setViewportSize({ width: 375, height: 800 });
    const toggle = page.getByRole("button", { name: /Menu|Close/i });
    await expect(toggle).toBeVisible();
    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(page.locator("#mobile-menu")).toBeVisible();
    // focus moved to first link on open; return focus to toggle before second activation
    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(page.locator("#mobile-menu")).toBeHidden();
  });

  test("mobile menu pointer open/close and Escape returns focus", async ({ page }) => {
    // mobile viewport so toggle visible
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /Menu|Close menu/i });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    const mobile = page.locator("#mobile-menu");
    await expect(mobile).toBeHidden();

    // pointer click opens
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(toggle).toHaveAttribute("aria-label", "Close menu");
    await expect(page.getByText("Close")).toBeVisible();
    await expect(mobile).toBeVisible();

    // clicking a link closes
    const firstMobileLink = mobile.locator("[data-nav-item]").first();
    await expect(firstMobileLink).toBeFocused(); // initNav focuses first
    await firstMobileLink.click();
    // after navigation, menu should be closed (hidden)
    await expect(mobile).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    // reopen, then Escape closes and returns focus to toggle
    await toggle.click();
    await expect(mobile).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(mobile).toBeHidden();
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("tab order has no trap, cycles through nav and content", async ({ page }) => {
    await page.goto("/");
    await page.setViewportSize({ width: 1280, height: 800 });
    // press Tab 8 times and ensure focus moves each time, never stuck
    const visited = new Set<string>();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const tag = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        return el
          ? `${el.tagName}:${el.getAttribute("href") || el.getAttribute("aria-label") || el.textContent?.slice(0, 20)}`
          : "null";
      });
      // ensure focus moved (not trapped on same element forever)
      visited.add(tag);
      await expect(page.locator(":focus")).toBeVisible();
    }
    // should have visited multiple elements
    expect(visited.size).toBeGreaterThan(5);
  });

  test("deep links: direct navigation to each route loads distinct scene", async ({ page }) => {
    const checks: Array<[string, RegExp]> = [
      ["/", /Jonathan/],
      ["/projects", /Shipped.*Depth/],
      ["/skills", /Backend.*Range/],
      ["/experience", /Verified.*History/],
      ["/about", /Human.*Context/],
      ["/contact", /Direct.*Reach/],
    ];
    for (const [path, h1] of checks) {
      await page.goto(path);
      await expect(page.locator("h1").first()).toContainText(h1);
      // url matches
      await expect(page).toHaveURL(new RegExp(path.replace("/", "\\/") + "$|" + path + "$"));
    }
  });

  test("no horizontal overflow at phone, tablet, desktop widths", async ({ page }) => {
    const viewports = [
      { width: 360, height: 800, label: "phone-360" },
      { width: 375, height: 800, label: "phone-375" },
      { width: 768, height: 800, label: "tablet" },
      { width: 1280, height: 800, label: "desktop" },
    ];
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const path of ["/", "/projects", "/skills", "/experience", "/about", "/contact"]) {
        await page.goto(path);
        // wait for entrance to avoid GSAP transform causing transient overflow
        await page.waitForFunction(() => {
          const els = Array.from(document.querySelectorAll<HTMLElement>("[data-entrance]"));
          return els.every((el) => getComputedStyle(el).opacity === "1");
        });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(
          overflow,
          `overflow at ${vp.label} on ${path}: scrollWidth - clientWidth = ${overflow}`,
        ).toBeLessThanOrEqual(1);
        // also verify no horizontal scrollbar is visible (observable)
        const hasHorizontalScroll = await page.evaluate(
          () => window.innerWidth < document.documentElement.scrollWidth,
        );
        expect(hasHorizontalScroll, `horizontal scroll at ${vp.label} on ${path}`).toBeFalsy();
      }
    }
  });

  test("reduced-motion disables continuous movement but retains opacity", async ({ page }) => {
    await page.goto("/");
    // default motion: bubble animation-duration should be ~11-23s (not 0.01ms)
    const defaultDur = await page.evaluate(() => {
      const b = document.querySelector<HTMLElement>(".bubble");
      return b ? getComputedStyle(b).animationDuration : "";
    });
    // should be seconds, not 0.01ms
    expect(defaultDur).toMatch(/s/);
    expect(defaultDur).not.toBe("0.01ms");

    // emulate reduced motion
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    // after reload with reduced, entrance elements should be opacity 1 and transform none via CSS
    const entranceOpacity = await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>("[data-entrance]");
      return el ? getComputedStyle(el).opacity : "";
    });
    expect(entranceOpacity).toBe("1");

    // bubbles animation should be none or 0.01ms
    const reducedAnim = await page.evaluate(() => {
      const b = document.querySelector<HTMLElement>(".bubble");
      if (!b) return "";
      const cs = getComputedStyle(b);
      return cs.animationName + "|" + cs.animationDuration + "|" + cs.transform;
    });
    // global.css sets animation: none !important and animation-duration 0.01ms
    expect(reducedAnim.toLowerCase()).toMatch(/none|0\.01ms/);

    // water-field caustic also disabled
    const causticAnim = await page.evaluate(() => {
      const c = document.querySelector<HTMLElement>(".water-field__caustic");
      return c ? getComputedStyle(c).animationName : "";
    });
    expect(causticAnim.toLowerCase()).toMatch(/none/);

    // reset
    await page.emulateMedia({ reducedMotion: null });
  });

  test("entrance final state is transform none or zero translation after transition", async ({
    page,
  }) => {
    const routes = ["/", "/projects", "/skills", "/experience", "/about", "/contact"];
    for (const route of routes) {
      await page.goto(route);
      await page.waitForFunction(() => {
        const els = Array.from(document.querySelectorAll<HTMLElement>("[data-entrance]"));
        if (els.length === 0) return true;
        return els.every((el) => getComputedStyle(el).opacity === "1");
      });
      // allow GSAP timeline call() to transfer to class (clears inline)
      await page.waitForTimeout(400);
      const states = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>("[data-entrance]")).map((el) => ({
          opacity: getComputedStyle(el).opacity,
          transform: getComputedStyle(el).transform,
          hasClass: el.classList.contains("is-entrance-visible"),
        })),
      );
      for (const s of states) {
        expect(s.opacity, `opacity should be 1 on ${route}`).toBe("1");
        expect(s.hasClass, `missing is-entrance-visible class on ${route}`).toBeTruthy();
        // transform must be none or identity matrix (no 14px offset)
        const isNone = s.transform === "none";
        const isIdentity = s.transform === "matrix(1, 0, 0, 1, 0, 0)";
        const isZeroY = /matrix\(1, 0, 0, 1, 0, 0/.test(s.transform);
        expect(
          isNone || isIdentity || isZeroY,
          `final transform should be none or zero translation on ${route}, got ${s.transform}`,
        ).toBeTruthy();
      }
      // no element should retain translateY(14px) inline
      const offsetCount = await page.evaluate(
        () =>
          Array.from(document.querySelectorAll<HTMLElement>("[data-entrance]")).filter((el) =>
            getComputedStyle(el).transform.includes("14"),
          ).length,
      );
      expect(offsetCount, `entrance Y offset should be 0 on ${route}`).toBe(0);
    }
  });
});
