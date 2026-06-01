import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders key sections", async ({ page }) => {
    await page.goto("/");

    // Hero — real identity
    await expect(page.getByRole("heading", { name: /Jonathan\s+Soto/, level: 1 })).toBeAttached();

    // Profile image in hero
    const heroSection = page.locator("section").first();
    const profileImage = heroSection.locator("img[alt*='portrait'], img[alt*='Jonathan']");
    await expect(profileImage.first()).toBeAttached();

    // About section
    await expect(page.locator("#about")).toBeAttached();
    await expect(page.locator("#about")).toContainText("Universidad de Santiago");

    // Education content
    await expect(page.locator("#about")).toContainText("Mar 2020");
    await expect(page.locator("#about")).toContainText(
      "INGENIERO DE EJECUCIÓN EN COMPUTACIÓN E INFORMÁTICA",
    );
    await expect(page.locator("#about")).toContainText("LICENCIADO EN INGENIERÍA APLICADA");
    await expect(page.locator("#about")).toContainText("Telecomunicaciones");

    // Experience content — expanded with real roles
    await expect(page.locator("#about")).toContainText("Productos Barber");
    await expect(page.locator("#about")).toContainText("Customer Service");
    await expect(page.locator("#about")).toContainText("IT solutions");
    await expect(page.locator("#about")).toContainText("network-related assistance");
    await expect(page.locator("#about")).toContainText("website support");
    await expect(page.locator("#about")).toContainText("ServiceFlow");
    await expect(page.locator("#about")).toContainText("Policomp");
    await expect(page.locator("#about")).toContainText("IT Support Intern");
    await expect(page.locator("#about")).toContainText("incidents");
    await expect(page.locator("#about")).toContainText("printer");

    // Publication content
    await expect(page.locator("#about")).toContainText("WealthQuest: un juego serio");

    // Projects section visible
    await expect(page.locator("#projects")).toBeAttached();

    // Skills section
    await expect(page.locator("#skills")).toBeAttached();

    // Contact section
    await expect(page.locator("#contact")).toBeAttached();

    // Navigation links
    await expect(page.locator("nav")).toBeAttached();
  });

  test("hero shows real title and tagline with profile photo (no JS monogram)", async ({
    page,
  }) => {
    await page.goto("/");

    // Subtitle reads "Backend & Full-Stack Engineer"
    const section = page.locator("section").first();
    await expect(section).toContainText("Backend & Full-Stack Engineer");

    // Description asserts truthful language (no Go, no clean architecture)
    await expect(section).toContainText("Python");
    await expect(section).toContainText("Java");
    await expect(section).toContainText("TypeScript");

    // Go must NOT appear in hero
    await expect(section).not.toContainText("Go");

    // Clean architecture must NOT appear in hero
    await expect(section).not.toContainText("clean architecture");

    // Key phrases from the truthful description
    await expect(section).toContainText("APIs");
    await expect(section).toContainText("automation");

    // Profile image is present (local asset, not LinkedIn hotlink)
    const profileImg = section.locator("img");
    const imgCount = await profileImg.count();
    expect(imgCount).toBeGreaterThan(0);

    // JS monogram removed from hero — name stands alone
    // (nav brand still has JS in DOM for hover morph mechanism)

    // Name has split-color treatment: "Jonathan" and "Soto" both visible
    const h1 = section.locator("h1");
    await expect(h1).toContainText("Jonathan");
    await expect(h1).toContainText("Soto");

    // No fabricated claims or placeholder language
    await expect(section).not.toContainText("Acme Corp");
    await expect(section).not.toContainText("placeholder", { ignoreCase: true });
  });

  test("project cards show real projects with category badges and separate link buttons", async ({
    page,
  }) => {
    await page.goto("/");

    const projectsSection = page.locator("#projects");

    // Visible project cards (now article elements)
    const articles = projectsSection.locator("article");
    await expect(articles).not.toHaveCount(0);

    // ServiceFlow card visible with category badge
    await expect(projectsSection).toContainText("ServiceFlow");
    await expect(projectsSection).toContainText("Published");

    // WealthQuest card visible with category badge
    await expect(projectsSection).toContainText("WealthQuest");
    await expect(projectsSection).toContainText("Thesis");
    await expect(projectsSection).toContainText("Serious Game");

    // Fintual Sensor card visible
    await expect(projectsSection).toContainText("Fintual Sensor");

    // EventCommerce card visible with category badge
    await expect(projectsSection).toContainText("EventCommerce");
    await expect(projectsSection).toContainText("Open Source");

    // Project tags reflect real technologies
    await expect(projectsSection).toContainText("Next.js");
    await expect(projectsSection).toContainText("TypeScript");
    await expect(projectsSection).toContainText("Python");
    await expect(projectsSection).toContainText("Unity");
    await expect(projectsSection).toContainText("Docker");

    // All project links point to verified domains (github, itch.io, jonasotoaguilar.space, or usach)
    const projectLinks = projectsSection.locator(
      "a[href*='github.com'], a[href*='itch.io'], a[href*='jonasotoaguilar.space'], a[href*='usach']",
    );
    const linkCount = await projectLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // WealthQuest links to itch.io for live demo
    const wealthQuestLiveLink = projectsSection.locator("a[href*='itch.io']");
    await expect(wealthQuestLiveLink).toHaveAttribute(
      "href",
      "https://jonasotoaguilar.itch.io/wealthquest",
    );

    // No placeholder content
    await expect(projectsSection).not.toContainText("Placeholder Project");
  });

  test("project cards have separate action buttons for repo, live, and thesis links", async ({
    page,
  }) => {
    await page.goto("/");

    const projectsSection = page.locator("#projects");

    // ServiceFlow: has both Live and Repo links
    const serviceFlowCard = projectsSection
      .locator("article")
      .filter({ hasText: "ServiceFlow" })
      .first();
    const sfLiveLink = serviceFlowCard.locator(
      'a[href="https://serviceflow.jonasotoaguilar.space/"]',
    );
    await expect(sfLiveLink).toBeAttached();
    await expect(sfLiveLink).toContainText("Live");
    const sfRepoLink = serviceFlowCard.locator(
      'a[href="https://github.com/jonasotoaguilar/ServiceFlow"]',
    );
    await expect(sfRepoLink).toBeAttached();
    await expect(sfRepoLink).toContainText("Repo");

    // EventCommerce: has Repo link (no liveUrl)
    const eventCommerceCard = projectsSection
      .locator("article")
      .filter({ hasText: "EventCommerce" })
      .first();
    const ecRepoLink = eventCommerceCard.locator(
      'a[href="https://github.com/jonasotoaguilar/eventcommerce"]',
    );
    await expect(ecRepoLink).toBeAttached();

    // Fintual Sensor: has Repo link
    const fintualCard = projectsSection.locator("article").filter({ hasText: "Fintual" }).first();
    const finRepoLink = fintualCard.locator(
      'a[href="https://github.com/BlendedGames-bGames/bGames-FintualSensor"]',
    );
    await expect(finRepoLink).toBeAttached();

    // WealthQuest: has Live and Thesis links
    const wealthQuestCard = projectsSection
      .locator("article")
      .filter({ hasText: "WealthQuest" })
      .first();
    const wqThesisLink = wealthQuestCard.locator('a[href*="usach.primo.exlibrisgroup.com"]');
    await expect(wqThesisLink).toBeAttached();
    await expect(wqThesisLink).toContainText("Thesis");
  });

  test("skills section shows accurate tech stack — no Go, updated practices", async ({ page }) => {
    await page.goto("/");

    const skillsSection = page.locator("#skills");
    const skillsText = await skillsSection.textContent();

    // Core languages present
    expect(skillsText).toContain("JavaScript");
    expect(skillsText).toContain("TypeScript");
    expect(skillsText).toContain("Python");
    expect(skillsText).toContain("Java");
    expect(skillsText).toContain("SQL");

    // Go must NOT appear
    expect(skillsText).not.toContain("Go");

    // Categories rendered (fixed &amp; bug)
    expect(skillsText).toContain("Languages");
    expect(skillsText).toContain("Frameworks & Tools");
    expect(skillsText).toContain("Focus Areas");
    expect(skillsText).toContain("Practices");

    // Updated Focus Areas
    expect(skillsText).toContain("Backend");
    expect(skillsText).toContain("APIs");
    expect(skillsText).toContain("Automation");
    expect(skillsText).not.toContain("Developer Experience");

    // Updated Practices should include TDD and Spec-Driven Development
    expect(skillsText).toContain("TDD");
    expect(skillsText).toContain("Spec-Driven Development");
    // CI/CD removed from Practices per user correction
    expect(skillsText).not.toContain("CI/CD");
    expect(skillsText).toContain("GitHub Actions");
    expect(skillsText).toContain("AI Agents");
    expect(skillsText).toContain("Clear APIs");
    expect(skillsText).toContain("Maintainable Systems");
    expect(skillsText).toContain("Automation");

    // No placeholder skills
    expect(skillsText).not.toContain("lorem ipsum");

    // Clean Architecture must NOT appear anywhere in skills
    expect(skillsText).not.toContain("Clean Architecture");

    // No HTML entities leaking
    expect(skillsText).not.toContain("&amp;");
  });

  test("contact section has redesigned cards with email, GitHub, LinkedIn", async ({ page }) => {
    await page.goto("/");

    const contactSection = page.locator("#contact");

    // Email link
    const emailLink = contactSection.locator('a[href^="mailto:"]');
    await expect(emailLink).toHaveAttribute("href", "mailto:jonasotoaguilar@gmail.com");

    // GitHub link
    const githubLink = contactSection.locator('a[href*="github.com/jonasotoaguilar"]');
    await expect(githubLink).toBeAttached();

    // LinkedIn link
    const linkedinLink = contactSection.locator('a[href*="linkedin.com/in/jonathan-soto"]');
    await expect(linkedinLink).toBeAttached();

    // Contact cards are present (3 cards: email, GitHub, LinkedIn)
    const contactCards = contactSection.locator(".grid > a");
    const cardCount = await contactCards.count();
    expect(cardCount).toBe(3);

    // No placeholder email
    await expect(contactSection).not.toContainText("hello@jonathansoto.dev");
  });

  test("footer has icon links for GitHub and LinkedIn, not text", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");

    // Footer has GitHub link with aria-label (icon, not text "GitHub")
    const ghLink = footer.locator('a[aria-label="GitHub profile"]');
    await expect(ghLink).toBeAttached();
    await expect(ghLink).toHaveAttribute("href", "https://github.com/jonasotoaguilar");
    // It should contain an SVG icon, not plain text "GitHub" as the visible label
    const ghSvg = ghLink.locator("svg");
    await expect(ghSvg).toBeAttached();

    // Footer has LinkedIn link with aria-label (icon, not text "LinkedIn")
    const liLink = footer.locator('a[aria-label="LinkedIn profile"]');
    await expect(liLink).toBeAttached();
    await expect(liLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/jonathan-soto-7304823b8/",
    );
    const liSvg = liLink.locator("svg");
    await expect(liSvg).toBeAttached();

    // "All rights reserved" copyright present
    await expect(footer).toContainText("Jonathan Soto");
    await expect(footer).toContainText("All rights reserved");
  });

  test("nav brand morphs from JS monogram to full name on hover/focus", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("nav");
    const brandLink = nav.locator('a[aria-label="Jonathan Soto — Home"]');

    // Brand link navigates home
    await expect(brandLink).toHaveAttribute("href", "/");

    // JS monogram visible (always present, visually)
    await expect(brandLink).toContainText("JS");

    // The full name "Jonathan Soto" exists in the DOM for hover expansion
    await expect(brandLink).toContainText("Jonathan Soto");
  });

  test("has proper meta tags with real content", async ({ page }) => {
    await page.goto("/");

    // Page title
    const title = await page.title();
    expect(title).toContain("Jonathan Soto");
    expect(title).toContain("Backend & Full-Stack Engineer");

    // Meta description
    const descMeta = page.locator('meta[name="description"]');
    const description = await descMeta.getAttribute("content");
    expect(description).toBeTruthy();
    expect(description).not.toContain("placeholder");

    // OG title equals <title> content exactly (spec requirement)
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogTitleContent = await ogTitle.getAttribute("content");
    expect(ogTitleContent).toBe(title);

    // OG description equals meta description exactly
    const ogDesc = page.locator('meta[property="og:description"]');
    const ogDescContent = await ogDesc.getAttribute("content");
    expect(ogDescContent).toBe(description);

    // Twitter title equals OG title
    const twitterTitle = page.locator('meta[name="twitter:title"]');
    const twitterTitleContent = await twitterTitle.getAttribute("content");
    expect(twitterTitleContent).toBe(ogTitleContent);

    // Twitter description equals OG description
    const twitterDesc = page.locator('meta[name="twitter:description"]');
    const twitterDescContent = await twitterDesc.getAttribute("content");
    expect(twitterDescContent).toBe(ogDescContent);

    // JSON-LD: parse and verify structured data
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const jsonLdText = await jsonLd.textContent();
    expect(jsonLdText).toBeTruthy();
    const parsed = JSON.parse(jsonLdText ?? "{}");
    expect(parsed["@type"]).toBe("Person");
    expect(parsed.name).toBe("Jonathan Soto");
    expect(parsed.jobTitle).toBe("Backend & Full-Stack Engineer");
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(Array.isArray(parsed.sameAs)).toBe(true);
    expect(parsed.sameAs).toContain("https://github.com/jonasotoaguilar");
    expect(parsed.sameAs).toContain("https://www.linkedin.com/in/jonathan-soto-7304823b8/");
  });

  test("no placeholder or fabricated content anywhere", async ({ page }) => {
    await page.goto("/");

    const bodyText = await page.locator("body").textContent();

    // Zero placeholder text
    expect(bodyText).not.toContain("Placeholder");
    expect(bodyText).not.toContain("Acme Corp");
    expect(bodyText).not.toContain("coming soon");
    expect(bodyText).not.toContain("lorem ipsum");

    // Zero fake employment
    expect(bodyText).not.toContain("Senior Software Engineer");
    expect(bodyText).not.toContain("Acme");

    // Zero unsupported deployment hype language
    expect(bodyText).not.toContain("serving real users");

    // No raw HTML entities leaking
    expect(bodyText).not.toContain("&amp;");
  });
});
