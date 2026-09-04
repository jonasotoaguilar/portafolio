# PRODUCT — Persona 3 Reload-Inspired Portfolio

Static multi-page portfolio for **Jonathan Soto** (`jonasotoaguilar`), Backend Engineer, Santiago Chile, open to remote. The site proves backend credibility quickly and routes to direct contact. It is a game-menu world, not a landing page.

## Purpose

Give hiring managers and engineering leads a fast, credible read on backend range (Python, TypeScript, Java) through shipped work, verifiable roles, and direct contact — without marketing fluff or invented claims.

## Audience

| Audience                                        | Job to do                                                                           | Primary signal                                                                    |
| ----------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Hiring manager / Engineering lead** (primary) | Verify backend credibility in <2 minutes, assess project depth, decide to reach out | Featured projects + experience with dates + stack evidence linked to public repos |
| **Recruiter** (primary)                         | Confirm role fit, location/remote availability, and contact path                    | Title, location, stack positioning, contact links                                 |
| **Peers / OSS collaborators** (secondary)       | Explore technical taste and contribution context                                    | Project repos, docs, and GitHub profile                                           |

## Jobs to Be Done

1. **Verify credibility fast** — skim who Jona is, what he builds, and where it ships.
2. **Go deep on one project** — open a featured project and follow through to its public repository.
3. **Confirm professional history** — check verified roles, dates, and education without embellishment.
4. **Reach out directly** — copy or open email, LinkedIn, and GitHub with no intermediate form.

## Scope

### In

- Six static routes, each a standalone menu scene: `/`, `/projects`, `/skills`, `/experience`, `/about`, `/contact`. No single-page section scroll.
- Featured projects (exactly four): **opencode-tokenmeter**, **ServiceFlow**, **RAGuard**, **EventCommerce**. ServiceFlow described from current repository evidence (Next.js, TypeScript, PocketBase/Appwrite, Docker).
- Skills, experience, about, and contact pages grounded in public GitHub and CV facts only.
- Static SEO: custom Head, JSON-LD (no phone), `@astrojs/sitemap`.
- Direct contact links only (email `jonathansoto.dev@gmail.com`, LinkedIn `https://www.linkedin.com/in/jonathan-soto-dev`, GitHub `https://github.com/jonasotoaguilar`). Remote availability stated.

### Out

- Contact forms, backends, or third-party providers.
- Planning-only repos presented as shipped.
- Dark-neon gamer cliché, pastel portfolio, or generic SaaS landing treatments.
- Copied Persona characters, logos, UI screenshots, fonts, audio, or assets.
- Analytics dashboards, funnels, or invented conversion targets (see Success Criteria).

## Content Truth and Privacy

- **Authorized sources only:** public GitHub (`https://github.com/jonasotoaguilar` and listed repos) and the owner-authorized CV (private source, not published). No other private store is in scope.
- **Privacy-safe summarization:** summarize experience/education/thesis from verified facts; omit phone everywhere including DOM, built HTML, metadata, and JSON-LD (no `tel:`/`telephone`/`8894`/`2050`/`+56`). Public contact approved: `jonathansoto.dev@gmail.com`, `https://www.linkedin.com/in/jonathan-soto-dev` (constructed from authorized handle `jonathan-soto-dev`; not 999-verified, `rel="me noopener noreferrer"`, `sameAs` includes GitHub + LinkedIn), and `https://github.com/jonasotoaguilar`.
- **Facts-only positioning:** primary stack is Python, TypeScript, Java. Do not inflate seniority, scope, or shipped status. ServiceFlow stack follows repository evidence, not stale CV wording.
- **Experience naming:** Productos Barber Chile and Policomp may be named with CV-verified roles/dates. Education and thesis (USACH, WealthQuest) may be included when verified against CV.

## Product Principles

1. **Evidence over claims** — every project and role links to or cites a verifiable source. No shipped claim without a public repo or deployed artifact.
2. **Clarity over cleverness** — menu metaphor serves scanning and keyboard navigation; visual play never blocks comprehension.
3. **Original reinterpretation, not copy** — Persona 3 Reload is an inspiration for structure, palette direction, and panel grammar, not a source of assets. See DESIGN.md disclaimer.
4. **Keyboard-first world** — pointer/touch are supported, but the experience is designed and tested for keyboard.
5. **Privacy and modesty by default** — omit what was not explicitly approved for public display; prefer omission over approximation.

## Success Criteria (observable, no invented analytics targets)

| Signal                                                                                                                                                         | How to verify                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| A first-time hiring manager can reach a featured project repo in one click from `/projects`                                                                    | Manual navigation + link check                      |
| All six routes render distinct scenes with shared grammar and no section-scroll dependency                                                                     | Route audit in `astro build` output + visual review |
| Keyboard can reach every interactive element with visible focus and semantic routes/deep links                                                                 | Keyboard walkthrough + axe in Playwright            |
| Contact page offers static direct links only and exposes no form or phone in DOM or JSON-LD                                                                    | DOM + JSON-LD inspection                            |
| Site passes `astro check` and `astro build`; axe checks pass in Playwright                                                                                     | CI-equivalent local runs (see PRD.md)               |
| Content stays within authorized sources; no phone ships; LinkedIn ships only as the authorized constructed URL `https://www.linkedin.com/in/jonathan-soto-dev` | Content review against CV/GitHub (see PRD.md)       |

## Routes

`/`, `/projects`, `/skills`, `/experience`, `/about`, `/contact` — each is its own menu scene with shared visual grammar.

## Non-Affiliation Note

Persona 3 Reload direction is inspiration only. This portfolio is an original work and is not affiliated with, endorsed by, or connected to ATLUS, SEGA, or the Persona franchise. Persona and related marks are trademarks of their respective owners.

## Unresolved Facts

- LinkedIn handle `jonathan-soto-dev` is owner-authorized; public URL `https://www.linkedin.com/in/jonathan-soto-dev` is constructed from that handle and shipped as a clickable link (Footer, `/`, `/contact`) with `rel="me noopener noreferrer"` and `sameAs` including `https://github.com/jonasotoaguilar` + `https://www.linkedin.com/in/jonathan-soto-dev`. The URL is marked in `src/data/site.ts` as constructed, not 999-verified (LinkedIn returns 999/auth-wall); no verification claim is made. Provenance copy and phone remain absent by design.
- pnpm `packageManager` is now pinned at `11.25.0` (`package.json`), verified via lockfile and CI setup (`pnpm/action-setup` `11.25.0`).
- `SITE` domain remains unresolved — `astro.config.mjs` enables `@astrojs/sitemap` and canonical/OG only when `SITE` env is set; without it those tags are intentionally absent.
