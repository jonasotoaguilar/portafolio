# PRD — Persona 3 Portfolio (Static Game-Menu Site)

Static portfolio for **Jonathan Soto** (`jonasotoaguilar`), Backend Engineer, Santiago Chile, open to remote. Six standalone routes share a Persona 3 Reload-inspired game-menu grammar without copying assets. The job is to let hiring managers verify backend credibility fast and reach direct contact.

## Problem

Hiring managers and recruiters need to confirm backend range and shipped judgment quickly. Generic landing-page portfolios and scattered GitHub profiles force extra digging and invite embellished claims. A focused, evidence-linked portfolio that honors privacy and stays static is missing.

## Users and Situations

| User / role               | Situation                                               | Need                                                                        |
| ------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------- |
| Hiring manager / Eng lead | Skimming candidates for a backend role (Python/TS/Java) | Assess depth via 2–4 shipped projects with repo evidence in <2 minutes      |
| Recruiter                 | Screening for role/location fit                         | Confirm title, location (Santiago, open to remote), stack, and contact path |
| Peer / OSS collaborator   | Exploring taste and technical context                   | Follow project links to docs and source                                     |

## Success

| Signal                                                                                       | Verification                                                                                |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Every featured project links to its public repo                                              | Link + HTTP 200 or repo existence check                                                     |
| All six routes build as static pages with distinct scenes                                    | `astro build` output lists `/`, `/projects`, `/skills`, `/experience`, `/about`, `/contact` |
| Keyboard can reach all interactive elements with visible focus and semantic deep links       | Manual keyboard walkthrough + Playwright checks                                             |
| `astro check`, `astro build`, and axe in Playwright pass                                     | Command output + report                                                                     |
| No phone appears in DOM or JSON-LD; contact links are static direct links only               | DOM + JSON-LD inspection                                                                    |
| Content matches authorized sources (GitHub + CV); no planning-only repo presented as shipped | Content review vs sources listed in Constraints                                             |

## Requirements

### Navigation and Structure

- **R1** — Routes `/`, `/projects`, `/skills`, `/experience`, `/about`, `/contact` each render a standalone menu scene with shared visual grammar. No single-page section scroll drives the IA.
  - _Acceptance:_ Direct navigation to each path loads a distinct page; `astro build` emits six static entries.
- **R2** — Primary navigation appears on every route and highlights the current route without relying on color alone.
  - _Acceptance:_ Current route has `aria-current="page"` and a non-color indicator (text/underline/focus treatment verified in rendered inspection).
- **R3** — A skip link to main content is present on every page and is keyboard-focusable.
  - _Acceptance:_ Tab from page load lands on skip link; activating it moves focus to `<main>` content.

### Keyboard, Responsive, Touch

- **R4** — All interactive elements (nav, project links, contact links) are reachable by keyboard (Tab / Shift+Tab, arrow where menu grid, Enter/Space to activate, Escape to dismiss overlay if any).
  - _Acceptance:_ Full walkthrough without pointer; no keyboard trap.
- **R5** — Focus is always visible with sufficient contrast.
  - _Acceptance:_ Rendered inspection shows a visible focus ring/indicator on every focusable element.
- **R6** — Responsive layout holds at narrow (320–375px), tablet (768px), and desktop (1280px+) without horizontal scroll or clipped content; touch targets meet comfortable sizing guidance.
  - _Acceptance:_ Viewport matrix check; no overflow; tap targets on mobile are usable.

### Motion

- **R7** — Water/bubble drift uses GSAP + CSS; Astro `ClientRouter` (from `astro:transitions`) handles view transitions between routes.
  - _Acceptance:_ Route transitions render; water field animates subtly under default motion preference.
- **R8** — Under `prefers-reduced-motion: reduce`, continuous water/parallax/movement is disabled and only brief opacity-only fades remain. Motion conveys no unique information.
  - _Acceptance:_ With reduced-motion emulated, continuous motion stops; content remains identical.

### Pages

- **R9 — Home `/`:** Displays name, title (Backend Engineer), location (Santiago, Chile) + remote availability, primary nav to all peers, teaser of 1–2 featured projects with repo links, and a direct contact affordance.
- **R10 — Projects `/projects`:** Shows exactly four featured projects — **opencode-tokenmeter**, **ServiceFlow**, **RAGuard**, **EventCommerce** — each with repo link, honest shipped status, and stack from current ServiceFlow repo evidence (Next.js, TypeScript, PocketBase/Appwrite, Docker). Planning-only repos are not presented as shipped. _Linked project titles and repo URLs verified against `https://github.com/jonasotoaguilar/{repo}`._
- **R11 — Skills `/skills`:** Grouped skills derived from CV/GitHub evidence (languages: Python, Java, TypeScript/JavaScript, SQL; frameworks: Spring Boot, Node.js, Next.js, React basic-mid; data: PostgreSQL, MySQL, NoSQL, Redis basic; APIs/quality: REST, testing, TDD; DevOps: Docker, GitHub Actions, Linux; cloud fundamentals: Dokploy, DigitalOcean; AI-assisted workflows as stated in CV). No inflated proficiency.
- **R12 — Experience `/experience`:** Names Productos Barber Chile (Vendedor / Atención al Cliente, 2020–2026) and Policomp (Práctica Soporte TI, Jan–Mar 2020) with CV-verified roles/dates. No invented titles or dates.
- **R13 — About `/about`:** Includes USACH Ing. Ejecución Computación e Informática (Mar 2020–Apr 2025), thesis WealthQuest (Blended Games) + publication (May 2025, Author Jonathan Soto), languages (Spanish native, English basic technical reading), and fact-only bio. All facts traceable to CV.
- **R14 — Contact `/contact`:** Static direct links only — `mailto:jonathansoto.dev@gmail.com`, GitHub `https://github.com/jonasotoaguilar`, LinkedIn handle `jonathan-soto-dev` (public URL unresolved — render handle only, do not fabricate a URL). No form, no backend/provider, no phone in DOM or JSON-LD.

### Content, SEO, Privacy

- **R15** — Content is drawn only from public GitHub and the owner-authorized CV (private source, not published). Privacy-safe summarization; no private store.
- **R16** — Custom Head per page (title, description, canonical, Open Graph, viewport). Site emits a sitemap via `@astrojs/sitemap` and JSON-LD (Person) that **omits** phone and any unverified LinkedIn URL. Output is static.
- **R17** — UI copy is English. No Spanish public content beyond original proper nouns.

### Quality and Operations

- **R18** — Lint/format is oxlint/oxfmt (not Biome). `astro check` and `astro build` pass.
- **R19** — Tests: Vitest for unit and Playwright for e2e; axe-core + `@axe-core/playwright` checks run inside Playwright.
- **R20** — GitHub Actions CI exists at `.github/workflows/ci.yml` with `verify` (format:check, lint, `astro check`, `test:unit`, `astro build`) and `e2e` (chromium + axe, needs verify) on `push`/`pull_request` to `main`; PR governance at `.github/workflows/pr-check.yml` (≤400 lines unless `size:exception`, linked `status:approved` issue, exactly one `type:*`, read-only safe for forks); release lifecycle at `.github/workflows/release.yml` + `scripts/release-*` (stable `v*` tag → preflight → publish GitHub Release `dist-*.tar.gz` + `.sha256` in protected `release` env → verify; `SITE` optional — sitemap/canonical validated only when `SITE` set; no deployment); fast staged-file-scoped pre-commit via `lefthook.yml` (`lefthook@2.1.12`, `oxfmt --check` + `oxlint`, check-only).

## Non-goals

- Contact forms, backends, or third-party providers.
- Single-page scroll IA, pastel-portfolio or dark-neon gamer cliché visuals.
- Copying Persona characters, logos, UI, fonts, audio, or assets.
- Presenting planning-only repos as shipped or inflating proficiency/seniority.
- Claiming scaffold/tests/workflows exist before they are added.

## Constraints

- **Stack:** Astro `7.2.10`, Node `>=22.13.0`, `@astrojs/sitemap` `3.7.4`, Tailwind CSS + `@tailwindcss/vite` `4.3.3` with CSS-first `@theme` custom properties, GSAP `3.15.0`, Vitest `4.1.11`, `@playwright/test` `1.62.1`, `axe-core` and `@axe-core/playwright` `4.13.0`, oxlint `1.81.0`, oxfmt `0.66.0`, pnpm `11.25.0` pinned (`packageManager` in `package.json`), `astro:transitions` `ClientRouter` (no separate package), static output. Verified via `npm view` and lockfile; Node `>=22.13.0` per Astro 7 / Vitest 4 / pnpm 11.25.
- **Audit scope:** `astro check`, `astro build`, axe in Playwright. No Lighthouse or Unlighthouse.
- **Content sources:** `https://github.com/jonasotoaguilar` (repos listed in R10 verified via `gh api`) and the owner-authorized CV (private source, not published). ServiceFlow current evidence is `https://github.com/jonasotoaguilar/serviceflow` (description Appwrite, README PocketBase, `package.json` Next.js/TypeScript).
- **Privacy:** phone from CV source must not appear in public output including JSON-LD.
- **Originality:** Persona-inspired per `LICENSE` (MIT, Copyright 2026 Jonathan Soto) and DESIGN.md disclaimer; no unlicensed assets. Illustration derived from public avatar `https://avatars.githubusercontent.com/u/91631088?v=4` (verified via `gh api users/jonasotoaguilar`).

## Risks / Open Questions

| Risk / question                                                                                 | Impact                                                                                   | Mitigation                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LinkedIn handle `jonathan-soto-dev` has no verified public URL (LinkedIn returns 999/auth-wall) | Cannot link to a verified profile; fabricating a URL from the handle would be inaccurate | Render handle as text or unresolved link; note in docs; re-verify before linking                                                                                                   |
| ServiceFlow repo lists Appwrite (description) vs PocketBase (README/live backend)               | Inconsistent stack claim if docs pick one                                                | Describe as PocketBase (current live backend) with Appwrite noted as description legacy; cite both sources                                                                         |
| pnpm pinned version now `11.25.0` via `packageManager`                                          | `packageManager` is pinned and used by CI setup (`pnpm/action-setup` `11.25.0`)          | Keep pinned; verify via `package.json` and lockfile                                                                                                                                |
| Licensed/OFL font and illustration choices unresolved — now system stacks + generated originals | Visual identity resolved as system font stacks and three generated originals             | Fonts are system stacks (`global.css`); figures/field are generated originals from authorized avatar reference, no Persona copy; no extra license file needed beyond `LICENSE` MIT |
| Water/bubble motion vs WCAG AA contrast over translucency                                       | Animated translucent panels may fail contrast                                            | Verify contrast in rendered inspection with axe + manual checks; reduced-motion fallback                                                                                           |
