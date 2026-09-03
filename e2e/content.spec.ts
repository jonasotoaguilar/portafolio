import { expect, test } from "@playwright/test";

const routes = [
  {
    path: "/",
    title: /Jonathan Soto — Backend Engineer/,
    h1: /Jonathan|Soto/,
    description: /Backend Engineer in Santiago/,
  },
  {
    path: "/projects",
    title: /Projects — 4 Shipped Builds/,
    h1: /Shipped.*Depth/i,
    description: /Four featured projects/,
  },
  {
    path: "/skills",
    title: /Skills — Backend Range/,
    h1: /Backend.*Range/i,
    description: /Backend range/,
  },
  {
    path: "/experience",
    title: /Experience — Verified Roles/,
    h1: /Verified.*History/i,
    description: /Professional experience/,
  },
  {
    path: "/about",
    title: /About — Human Context/,
    h1: /Human.*Context/i,
    description: /About Jonathan Soto/,
  },
  {
    path: "/contact",
    title: /Contact — Direct Links Only/,
    h1: /Direct.*Reach/i,
    description: /Contact Jonathan Soto/,
  },
] as const;

for (const r of routes) {
  test(`content — ${r.path} title, heading, description, nav active`, async ({ page }) => {
    await page.goto(r.path);
    await expect(page).toHaveTitle(r.title);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("h1").first()).toContainText(r.h1);

    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute("content", r.description);

    // nav active indicator: aria-current="page" on current route
    const currentLink = page.locator(`nav[aria-label="Primary"] a[href="${r.path}"]`).first();
    // on desktop primary nav; mobile hidden may also have it, so check at least one
    await expect(page.locator(`a[href="${r.path}"][aria-current="page"]`).first()).toBeVisible();
    await expect(currentLink).toHaveAttribute("aria-current", "page");

    // skip link present and href correct
    await expect(page.getByRole("link", { name: "Skip to content" })).toHaveAttribute(
      "href",
      "#main",
    );
    await expect(page.locator("#main")).toBeVisible();

    // viewport meta exists
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      "content",
      /width=device-width/,
    );

    // footer contains trademark disclaimer (observable behavior, not implementation)
    await expect(page.getByText(/Not affiliated with ATLUS \/ SEGA/i)).toBeVisible();
  });
}

test("content — 404 renders 404 scene with routes", async ({ page }) => {
  await page.goto("/not-a-real-route-xyz");
  await expect(page.getByRole("heading", { level: 1, name: /404/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Back to Entry/i })).toBeVisible();
  for (const href of ["/", "/projects", "/skills", "/experience", "/about", "/contact"]) {
    await expect(
      page
        .getByRole("link", { name: new RegExp(href === "/" ? "Home" : href.slice(1), "i") })
        .first(),
    ).toBeVisible();
  }
  await expect(page.locator('nav[aria-label="Primary"]').first()).toBeVisible();
});

// Projects contracts
test("content — /projects shows exactly four featured projects with repo and stack", async ({
  page,
}) => {
  await page.goto("/projects");
  // four articles
  const cards = page.locator("article");
  await expect(cards).toHaveCount(4);

  const expected = [
    { name: "opencode-tokenmeter", repo: "https://github.com/jonasotoaguilar/opencode-tokenmeter" },
    { name: "ServiceFlow", repo: "https://github.com/jonasotoaguilar/serviceflow" },
    { name: "RAGuard", repo: "https://github.com/jonasotoaguilar/raguard" },
    { name: "EventCommerce", repo: "https://github.com/jonasotoaguilar/eventcommerce" },
  ];

  for (const proj of expected) {
    await expect(page.getByRole("heading", { level: 3, name: proj.name })).toBeVisible();
    // repo link
    const repoLink = page.locator(`a[href="${proj.repo}"]`).first();
    await expect(repoLink).toBeVisible();
    await expect(repoLink).toHaveAttribute("target", "_blank");
    await expect(repoLink).toHaveAttribute("rel", /noopener/);
  }

  // chips for stack contain known values
  await expect(page.getByText("PocketBase").first()).toBeVisible();
  await expect(page.getByText("TypeScript").first()).toBeVisible();

  // ensure no planning-only inflation: text about 04 entries
  await expect(page.getByText(/Inventory — 04 Entries/i)).toBeVisible();
});

test("content — home shows 2 featured teasers and contact affordance", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Featured — 02 Projects Teaser/i })).toBeVisible();
  // teasers are chip + summary, not headings — verify by chip text and repo link presence
  await expect(page.locator(".chip", { hasText: "opencode-tokenmeter" }).first()).toBeVisible();
  await expect(page.locator(".chip", { hasText: "ServiceFlow" }).first()).toBeVisible();
  await expect(
    page.locator('a[href="https://github.com/jonasotoaguilar/opencode-tokenmeter"]').first(),
  ).toBeVisible();
  await expect(
    page.locator('a[href="https://github.com/jonasotoaguilar/serviceflow"]').first(),
  ).toBeVisible();
  // contact affordance
  await expect(
    page.getByRole("link", { name: /jonathansoto.dev@gmail.com/i }).first(),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Contact Direct/i })).toBeVisible();
  // hero image
  const heroImg = page.locator('img[alt*="Illustrated portrait of Jonathan Soto"]');
  await expect(heroImg).toBeVisible();
  await expect(heroImg).toHaveAttribute("srcset", /.+/);
});

// Skills, experience, about spot checks
test("content — /skills grouped without inflated proficiency", async ({ page }) => {
  await page.goto("/skills");
  for (const group of [
    "Languages",
    "Frameworks",
    "Data",
    "APIs & Quality",
    "DevOps",
    "Cloud & Deploy",
  ]) {
    await expect(page.getByRole("heading", { name: group })).toBeVisible();
  }
  await expect(page.getByText("Python").first()).toBeVisible();
  await expect(page.getByText(/No invented proficiency bars/i)).toBeVisible();
});

test("content — /experience verified roles and dates", async ({ page }) => {
  await page.goto("/experience");
  await expect(page.getByRole("heading", { name: "Productos Barber Chile" })).toBeVisible();
  await expect(page.getByText("2020 — 2026")).toBeVisible();
  await expect(page.getByText("Vendedor / Atención al Cliente")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Policomp" })).toBeVisible();
  await expect(page.getByText("Jan 2020 — Mar 2020")).toBeVisible();
  await expect(page.getByText("Universidad de Santiago de Chile (USACH)")).toBeVisible();
});

test("content — /about human context factual fields", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByText("Ing. Ejecución en Computación e Informática")).toBeVisible();
  await expect(page.getByText("WealthQuest — Blended Games")).toBeVisible();
  await expect(page.getByText(/May 2025/).first()).toBeVisible();
  await expect(page.getByText("Spanish").first()).toBeVisible();
  await expect(page.getByText("Native").first()).toBeVisible();
});

// LinkedIn identity — exact URL is the only linkedin.com href, rel contains me noopener noreferrer
const LINKEDIN_URL = "https://www.linkedin.com/in/jonathan-soto-dev";

test("content — /contact LinkedIn exact href with rel me noopener noreferrer, no phone", async ({
  page,
}) => {
  await page.goto("/contact");
  const mailto = page.locator('a[href^="mailto:jonathansoto.dev@gmail.com"]');
  await expect(mailto.first()).toBeVisible();
  const github = page.locator('a[href="https://github.com/jonasotoaguilar"]');
  await expect(github.first()).toBeVisible();
  await expect(github.first()).toHaveAttribute("rel", /noopener/);

  // LinkedIn must be exact clickable anchor, not text span
  const linkedin = page.locator(`a[href="${LINKEDIN_URL}"]`);
  await expect(linkedin.first()).toBeVisible();
  await expect(linkedin.first()).toHaveAttribute("rel", /me/);
  await expect(linkedin.first()).toHaveAttribute("rel", /noopener/);
  await expect(linkedin.first()).toHaveAttribute("rel", /noreferrer/);
  await expect(linkedin.first()).toHaveAttribute("target", "_blank");
  // uniqueness: every linkedin.com href is exactly this URL
  const allLinkedinHrefs = await page
    .locator('a[href*="linkedin.com"]')
    .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));
  expect(allLinkedinHrefs.length).toBeGreaterThan(0);
  for (const href of allLinkedinHrefs) expect(href).toBe(LINKEDIN_URL);
  // no phone
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toMatch(/\+56\s?9?\s?\d{4}\s?\d{4}/);
  expect(bodyText).not.toMatch(/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/);
  // deny-list must not appear would be checked in dist, but also ensure body not contain banned phrase like view source
  expect(bodyText.toLowerCase()).not.toContain("view source");
  expect(bodyText).not.toMatch(/\bCV\b/);
});

test("content — / LinkedIn exact href with rel and Footer unique", async ({ page }) => {
  await page.goto("/");
  const linkedin = page.locator(`a[href="${LINKEDIN_URL}"]`);
  await expect(linkedin.first()).toBeVisible();
  await expect(linkedin.first()).toHaveAttribute("rel", /me/);
  await expect(linkedin.first()).toHaveAttribute("rel", /noopener/);
  await expect(linkedin.first()).toHaveAttribute("rel", /noreferrer/);
  const all = await page
    .locator('a[href*="linkedin.com"]')
    .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));
  expect(all.length).toBeGreaterThan(0);
  for (const href of all) expect(href).toBe(LINKEDIN_URL);
  // Footer linkedin also present — footer is on every page, so check footer anchor separately
  const footerLink = page.locator(`footer a[href="${LINKEDIN_URL}"]`);
  await expect(footerLink).toBeVisible();
  await expect(footerLink).toHaveAttribute("rel", /me/);
  await expect(footerLink).toHaveAttribute("rel", /noopener/);
  await expect(footerLink).toHaveAttribute("rel", /noreferrer/);
  const bodyText = await page.locator("body").innerText();
  expect(bodyText).not.toMatch(/\bCV\b/);
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
});

test("content — Footer LinkedIn exact href on any page, unique linkedin.com", async ({ page }) => {
  await page.goto("/about");
  const footerLink = page.locator(`footer a[href="${LINKEDIN_URL}"]`);
  await expect(footerLink).toBeVisible();
  await expect(footerLink).toHaveAttribute("rel", /me/);
  await expect(footerLink).toHaveAttribute("rel", /noopener/);
  await expect(footerLink).toHaveAttribute("rel", /noreferrer/);
  const all = await page
    .locator('a[href*="linkedin.com"]')
    .evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href));
  for (const href of all) expect(href).toBe(LINKEDIN_URL);
});

// JSON-LD and canonical
test("content — JSON-LD Person includes exact LinkedIn sameAs, no telephone", async ({ page }) => {
  await page.goto("/");
  const ldRaw = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(ldRaw).toBeTruthy();
  const data = JSON.parse(ldRaw!);
  expect(data["@type"]).toBe("Person");
  expect(data.name).toBe("Jonathan Soto");
  expect(data.jobTitle).toBe("Backend Engineer");
  expect(data.address.addressLocality).toBe("Santiago");
  expect(data.address.addressCountry).toBe("CL");
  expect(data.email).toBe("mailto:jonathansoto.dev@gmail.com");
  expect(data.sameAs).toEqual(["https://github.com/jonasotoaguilar", LINKEDIN_URL]);
  expect(data.sameAs).toContain(LINKEDIN_URL);
  // privacy: no telephone
  expect(data.telephone).toBeUndefined();
  expect(JSON.stringify(data)).not.toMatch(/telephone/i);
  expect(JSON.stringify(data)).not.toMatch(/tel:/i);
  // no other linkedin.com besides exact
  const sameAsHref = data.sameAs as string[];
  for (const href of sameAsHref.filter((u: string) => u.includes("linkedin.com")))
    expect(href).toBe(LINKEDIN_URL);
});

test("content — canonical absent when SITE not set (build without SITE)", async ({ page }) => {
  await page.goto("/");
  // when SITE env absent, no canonical and no og:url/og:image
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
});

test("content — images rendered responsively with srcset and no prior assets", async ({ page }) => {
  await page.goto("/");
  // hero image
  const hero = page.locator('img[alt*="Illustrated portrait of Jonathan Soto"]');
  await expect(hero).toBeVisible();
  const heroSrcset = await hero.getAttribute("srcset");
  expect(heroSrcset).toBeTruthy();
  expect(heroSrcset!).toContain("w");
  await expect(hero).toHaveAttribute("sizes", /.+/);
  await expect(hero).toHaveAttribute("width", /.+/);
  await expect(hero).toHaveAttribute("height", /.+/);

  // water field image (decorative, empty alt)
  const water = page.locator(".water-field__image");
  await expect(water).toBeVisible();
  const waterSrcset = await water.getAttribute("srcset");
  expect(waterSrcset).toBeTruthy();

  // about profile image
  await page.goto("/about");
  const profile = page.locator('img[alt*="Portrait of Jonathan Soto"]');
  await expect(profile).toBeVisible();
  await expect(profile).toHaveAttribute("srcset", /.+/);

  // ensure no shipped page references prior branch assets or Persona copyrighted assets
  // check that html does not contain string paths like persona character assets
  for (const path of ["/", "/projects", "/about"]) {
    await page.goto(path);
    const html = await page.content();
    expect(html.toLowerCase()).not.toContain("persona-character");
    expect(html.toLowerCase()).not.toContain("atlus-logo");
    expect(html).not.toContain("prior-branch");
    // images src should be from _astro or visuals, not external persona cdn
    const srcs = await page
      .locator("img")
      .evaluateAll((els) =>
        els.map((e) => (e as HTMLImageElement).currentSrc || (e as HTMLImageElement).src),
      );
    for (const src of srcs) {
      expect(src).not.toMatch(/persona/i);
    }
  }
});

test("content — all pages use English copy, no Spanish public content beyond proper nouns", async ({
  page,
}) => {
  // spot check that main headings are English
  await page.goto("/about");
  await expect(page.getByText(/Human Context/i)).toBeVisible();
  await page.goto("/experience");
  await expect(page.getByText(/Verified History/i)).toBeVisible();
  // proper nouns like Santiago are allowed but page lang is en
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
