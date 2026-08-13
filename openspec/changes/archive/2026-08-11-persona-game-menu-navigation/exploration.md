# Exploration: Persona Game-Menu Navigation

**Change**: `persona-game-menu-navigation` | **Date**: 2026-08-11 (refreshed) | **Author**: sdd-explore

Sources (all read in full): PRD.md, DESIGN.md, ARCHITECTURE.md, ADR-0001/ADR-0002/ADR-0003, canonical OpenSpec specs (6), archived MVP artifacts (exploration/proposal/design/verify), all `src/` sources, all tests, content collections, Engram `product/navigation-model` #5944, reference repo `/home/jona/repos/persona3-website` (mapped, not copied), live apps `localhost:5173` (reference) and `localhost:4321` (current build) verified with agent-browser, Jona's August 2026 CV (authoritative resume content source).

## Product Decision (authoritative)

Jona's intent is explicit and overrides the archived MVP decision (which rejected fixed-100vh game screens "must scroll for recruiters"). The scrolling landing is the WRONG product model. New model: a Persona 3-style full-screen game-menu shell; selecting a menu item changes the complete view. The reference SPA is visual/interaction inspiration ONLY; its defects (dead routes, global keyboard interception, missing mobile detail, axe violations, missing landmarks, low contrast) are verified and MUST NOT be copied.

**Resolved product decisions (all approved, none remaining)**:
- Five real static routes: `/about`, `/resume`, `/projects`, `/skills`, `/contact` + root menu at `/` + 404.
- RESUME content: real CV data (typed from Jona's August 2026 CV), not derived-only content.
- Escape returns to the menu; Browser Back is native history.
- Gamepad: hint styling only (`GAMEPAD`/`↵` styled keys) — no Gamepad API in v1.
- Delivery: six-slice chain, auto-chain, stacked-to-main, 400-line budget per PR.

## Current State

**Verified live (localhost:4321, production build)**: a 3090px scrollable single page (577px viewport) with 5 stacked sections (Hero, Featured Work, Projects, Skills, Contact) and 4 anchors (`#featured-work`, `#projects`, `#skills`, `#contact`). Navigation = fixed `CompactNav` (4 anchor links + "Menu" trigger) plus a native `<dialog>` `MenuOverlay` whose items jump within the one page. Project content is rendered TWICE (Featured Work grid + Projects list — the duplicated landing grids to eliminate).

**Architecture**: Astro 7.2.0 SSG, Content Collections (`projects` glob of 4 `.md`; `skills` + `siteConfig` via `file()` loaders), Tailwind 4.3.3, `motion` 13.0.0 vanilla, `<ClientRouter/>` view transitions with `fallback="none"`, canvas 2D particles with `transition:persist`, glow + scanlines CSS layers, reduced-motion contract, JS budget < 100KB gz (E2E-enforced). SEO: exact title, JSON-LD `Person` (person.ts), sitemap filtered via `isSitemapEligible` (index only today). Toolchain: Vitest, Playwright, Biome, Lefthook, Stryker dry-run. Branch `feat/persona-portfolio-mvp`; all files untracked. PRD.md, DESIGN.md, ARCHITECTURE.md and ADR-0003 are already updated to the game-menu target (verified: `docs/adr/0003-static-view-routes-over-client-view-state.md` exists; all three contracts reference the shell model).

**Verified live reference (localhost:5173, persona3-website)**: full-viewport/no-scroll game screens (scrollHeight == innerHeight, `overflow:hidden`, 100vh). Root menu = 5 skewed italic Anton items (ABOUT ME, RESUME, GITHUB LINK, SOCIALS, SIDE PROJECTS); activation changes the real URL to `/about`, `/resume`, `/socials` (verified live); `/github` and `/sideproj` are DEAD routes (no `<Route>` in App.jsx — confirmed in source). Escape and ArrowLeft on a view navigate back to the menu (verified live: `/about` → Escape → `/`; `/resume` → ArrowLeft → `/`). Browser Back works (real history). Resume view = "LIST" cards (EDUCATION/SKILLS/PROJECTS/EXPERIENCE with fake RANK numbers) + a right-side detail panel; only EDUCATION has a detail panel (active index 0) — the reference's missing detail for the other three is a bug. Per-view transition overlays exist (PageTransition variants: default blocks, About panels, Resume cards, Socials stripes; 450-600ms). Reference bugs (verified in source + audit facts): global `window` keydown listeners on every screen, dead routes, missing mobile resume detail, no `<h1>`/`<main>` landmarks, 4 axe violations, low contrast (`#3ce2ff` on dark), fake ranks/metrics.

## Affected Areas

| Area | Impact | Why |
|---|---|---|
| `src/pages/index.astro` | Replace | Landing composition (Hero + 4 sections + overlay) becomes the root menu shell |
| `src/pages/{about,resume,projects,skills,contact}.astro` | New | Five full-screen view routes (deep-linkable, static) |
| `src/pages/404.astro` | Preserve | Reuses identity; single action back to `/` |
| `src/components/CompactNav.astro`, `MenuOverlay.astro`, `Section.astro`, `sections/*` | Replace/Delete | Anchor nav + dialog overlay superseded by the shell menu; sections become views |
| `src/components/ProjectCard.astro`, `Watermark.astro`, `Background.astro`, `JsonLd.astro` | Preserve/Adapt | Card, watermark, background layers, JSON-LD survive into views |
| `src/scripts/menu.ts`, `src/lib/menu/keys.ts` | Replace/Extend | Overlay logic → shell keyboard model (scoped, never global); list/detail key navigation added |
| `src/layouts/BaseLayout.astro` | Adapt | Add game-shell wrapper; per-view titles; no-scroll viewport constraint |
| `src/lib/seo/*` | Adapt | Per-view titles/JSON-LD; sitemap now lists 5+ pages (404 excluded) |
| `src/content/*` | Preserve/Extend | 4 projects, skills, site config preserved; resume collection added, typed from the CV (see Apply Requirement) |
| `src/styles/global.css` | Preserve | Tokens, glow/scanlines, reduced motion |
| `tests/` (unit + e2e) | Partial | Canvas/SEO/content/motion tests preserved; anchor-scroll/fragment/section-order tests replaced |
| `openspec/specs/*` (6) | Replace delta | portfolio-page, persona-navigation, portfolio-content, site-transitions, seo-metadata all encode the one-page anchor model; a resume-content domain may be added |
| `docs/codebase/mental-model.md`, `docs/CODEBASE-GUIDE.md` | Update | Single-page model → shell + views (remaining doc deltas; PRD/DESIGN/ARCHITECTURE/ADR-0003 already done) |

## Approaches

### A. Real Astro routes per view (approved)

Five static routes `/about`, `/resume`, `/projects`, `/skills`, `/contact` + root menu at `/` + 404. Each view is its own static HTML page with an `h1`, `<main>`, per-view title/JSON-LD, and sitemap entry. List/detail selection inside PROJECTS and RESUME is client-side within the view (anchor deep links like `/projects#serviceflow` for linkability). Escape on a view returns to `/` (route change); Browser Back is native history. Locked by ADR-0003.

- Pros: matches the verified reference model (real URL changes); static SSG + zero-JS content reachability preserved (each route is plain HTML); deep links and crawlability per view; per-view SEO (title/h1/JSON-LD/sitemap); native Back; no router library; smallest JS (no view-state routing logic).
- Cons: 5+ pages in sitemap (spec delta); per-view transition overlays need View Transitions API care; Escape/arrow handlers must be scoped per page.
- Effort: Medium

### B. Client-only view state (single `/` + JS switch) — rejected

One route; menu clicks swap views in JS; hash or state-only. Destroys deep links/SEO per view; the reference itself proves real routes are needed; conflicts with the preserved crawlability contract. Superseded by ADR-0003.

### C. Real routes + sub-routes for detail (`/projects/:slug`, `/resume/:section`) — rejected for v1

Detail as its own route. Fully deep-linkable but 9+ pages, larger SEO surface, and the game feel wants LIST + panel on one screen; can be added later if a project needs its own URL.

**Recommendation (approved)**: A — five real view routes, list/detail as an in-view game panel with anchor deep links; Esc/Back return to the menu.

## Product Model: Five Views + Content Mapping

Content derives from approved sources: existing collections (`siteConfig`, `skills`, 4 projects) plus Jona's August 2026 CV for the resume view (typed source — see Apply Requirement). All content is verified real; nothing is invented.

| View | Route | Content mapping | Source |
|---|---|---|---|
| ABOUT | `/about` | Identity + introduction/focus: name, role ("Backend junior profile"), tagline, focus areas; intro derived from the CV profile and site config | `site.config.yaml` + CV profile |
| RESUME | `/resume` | Persona LIST (EDUCATION, EXPERIENCE, PROJECTS, SKILLS, LANGUAGES) + selected detail panel: experience Productos Barber Chile 2020–2026 and Policomp IT support internship Jan–Mar 2020; education USACH computing/informatics Mar 2020–Apr 2025 and technical telecommunications Mar 2017–Nov 2019; projects ServiceFlow and WealthQuest (WealthQuest published May 2025); skills Python, Java, Spring Boot, TypeScript/JavaScript/SQL and related tooling; languages Spanish native, English basic technical reading | Jona's August 2026 CV (typed; see Apply Requirement) |
| PROJECTS | `/projects` | LIST of the four verified projects + selected detail panel (description, stack, external link; deep link `#serviceflow` etc.) | `src/content/projects/*.md` (complete) |
| SKILLS | `/skills` | Grouped LIST (backend/frontend/tooling from skills.yaml) + selected group detail panel; no ranks/metrics ever (verified schema rejects non-strings) | `src/content/skills.yaml` |
| CONTACT | `/contact` | Dedicated view: email CTA, GitHub, WealthQuest (socials from site config). The CV phone number is NEVER published (privacy gate, see Apply Requirement) | `site.config.yaml` |
| ROOT | `/` | Game menu shell: ABOUT, RESUME, PROJECTS, SKILLS, CONTACT | — |

The reference's 5th/6th items (GITHUB LINK, SIDE PROJECTS as menu rows) are dead-route bugs; GitHub lives inside CONTACT instead.

## Apply Requirement: Resume Content Source (typed)

- The RESUME view MUST be authored from Jona's August 2026 CV, typed by Jona: experience (Productos Barber Chile 2020–2026; Policomp IT support internship Jan–Mar 2020), education (USACH computing/informatics Mar 2020–Apr 2025; technical telecommunications Mar 2017–Nov 2019), projects (ServiceFlow; WealthQuest, published May 2025), skills (Python, Java, Spring Boot, TypeScript/JavaScript/SQL and related tooling), and languages (Spanish native; English basic technical reading).
- The CV phone number MUST NOT appear anywhere: not in content files, not in rendered HTML, not in tests, not in commit history. A review gate in apply checks this.
- No CV facts may be paraphrased into claims beyond the source (no invented dates, titles, or metrics; no fake RANK numbers like the reference).

## Interaction Contract (desktop/mobile)

- **Shell**: full-viewport (`100dvh`), `overflow:hidden` game screen per view; internal scroll only inside detail panels when content exceeds the viewport (reference's missing mobile detail bug fixed by a scrollable panel region on small screens).
- **Root menu**: giant skewed italic Anton labels (existing `menu-label` tier), ↑/↓ wrap + Enter activates (existing `reduceMenuKey` logic reused), hover follows active state, staggered entrance (30-50ms band per DESIGN.md), key-hint footer (↑↓ move / Enter select / Esc back). Gamepad: hint styling only (`GAMEPAD`/`↵` styled keys); Gamepad API is out of scope for v1 (approved).
- **View navigation**: each view's header offers "back to menu" (Esc → `/`, also ArrowLeft hint on detail views); keys MUST be scoped to the active screen (the reference's global `window` keydown is the bug we explicitly do not copy; the current codebase already has the "no hijack when closed" test pattern to extend).
- **List/detail**: ↑/↓ move across LIST items, Enter (or →) opens the detail panel, Esc closes it (one level up), focus moves into the panel; selection state is per-view client-side.
- **Transitions**: Astro `<ClientRouter/>` + per-view overlay moments (blue panel/stripe/clip-path sweeps adapted from reference but ≤400ms total — reference's 450-600ms violates the existing motion contract); reduced motion = opacity-only ≤200ms, no sweeps.
- **Reduced motion / a11y**: existing contract preserved; each view gets exactly one `h1`, a `<main>` landmark, AA contrast, 44px targets, `:focus-visible` accent outlines (the reference's 4 axe violations are avoided by design).
- **Zero-JS**: each route is static HTML; without JS the shell scrolls normally and all view content (including all detail content) renders in document flow — the no-scroll constraint is applied by the enhancement layer, not unconditionally (preserves the existing "content renders and fragment navigation works without JavaScript" E2E pattern).
- **Mobile**: touch targets ≥44px; LIST + detail stack vertically (panel below the list, internal scroll); key hints hidden on touch; hover-only effects gated `(hover:hover) and (pointer:fine)`.

## Preserve / Replace / Delete Map

**Preserve**: 4 project `.md` entries + schemas + `assertExactlyFour`/`sortByOrder`; `skills.yaml`; `site.config.yaml`; `content.config.ts`; fontsource fonts; DESIGN.md tokens + global.css layers (glow/scanlines, reduced motion); `Background.astro` + `particles.ts` + `living-background.ts` + `transition:persist`; `JsonLd.astro` + `person.ts` + sitemap filtering; `BaseLayout` head/transitions; 404 page; unit tests for content/canvas/entrances/seo/layout-background; reduced-motion E2E (canvas + glow); links.spec link-href assertions (re-scoped); budget spec (re-scoped); toolchain/CI.

**Replace**: `index.astro` composition → shell + 5 views; `CompactNav` + `MenuOverlay` + `menu.ts` + `keys.ts` → shell menu + scoped view keyboard model (reuse `reduceMenuKey`, extend with detail-level keys); `Hero/FeaturedWork/Projects/Skills/Contact` sections → About/Resume/Projects/Skills/Contact views with LIST/detail components; anchor navigation; `Section.astro`/`Watermark.astro` usage per view; specs (portfolio-page, persona-navigation, portfolio-content, site-transitions, seo-metadata); tests encoding sections/anchors/scroll/fragments (portfolio.spec, menu.spec, nav.test, pages.test, sections.test).

**Delete**: Featured Work grid (duplicated project rendering — one PROJECTS view only); dialog overlay (superseded by shell; Esc = menu route); `#featured-work`/`#projects`/`#skills`/`#contact` anchor contract.

## Remaining Doc Deltas

Already updated (verified): PRD.md, DESIGN.md, ARCHITECTURE.md, ADR-0003 (`docs/adr/0003-static-view-routes-over-client-view-state.md`).

Remaining before/with apply:
- **OpenSpec deltas**: rewrite persona-navigation (shell menu, scoped keys, view navigation), portfolio-page (five views + shell + no-scroll), portfolio-content (Projects LIST/detail, drop Featured Work grid), site-transitions (menu↔views, per-view overlays, canvas persist), seo-metadata (per-view title/h1/JSON-LD, sitemap with 6 URLs, 404 excluded), living-background (unchanged); add resume-content requirements with the typed CV source and the no-phone-number privacy gate.
- **Docs**: `docs/codebase/mental-model.md` + `docs/CODEBASE-GUIDE.md` — single-page model → shell + views.

## Implementation Forecast (approved: auto-chain, stacked-to-main, 400-line budget)

Six chained PRs, each < 400 changed lines, each green on its own gates:

1. **S1 Specs**: OpenSpec spec deltas (6 rewrites + resume-content additions); mental-model/CODEBASE-GUIDE sync. (PRD/DESIGN/ARCHITECTURE/ADR-0003 already done.)
2. **S2 Game shell**: BaseLayout shell, no-scroll viewport, root menu (5 route links, keyboard, hints), 5 view page stubs, 404 unchanged; shell unit tests + menu E2E rework.
3. **S3 ABOUT + SKILLS + CONTACT**: content-mapped views + watermarks + per-view titles/JSON-LD; unit + E2E.
4. **S4 PROJECTS view**: LIST + detail panel + `#slug` deep links; unit + E2E; delete Featured Work.
5. **S5 RESUME view**: new resume content collection typed from the CV (experience, education, projects, skills, languages; phone number MUST NOT be typed); LIST + detail panel; unit + E2E including the no-phone-number gate.
6. **S6 Migration + verification**: replace scroll/anchor tests (portfolio/menu/nav/pages/sections), re-scope links/budget/reduced-motion, sitemap/JSON-LD checks, full suite + coverage + build.

Decision needed before apply: **No** — all product decisions are resolved. Chained PRs recommended: **Yes** (approved). 400-line budget risk: **Medium** (S4/S5 have the densest component code; keep detail panels lean).

## Risks

- **CV typing accuracy**: resume content is typed from the CV; dates, titles, and project facts must match the source exactly. Mitigation: S5 review gate compares typed content against the CV; no paraphrased claims or invented metrics (no fake RANK numbers like the reference).
- **Phone-number privacy**: the CV contains a phone number that MUST never be published. Mitigation: explicit no-phone gate in S5 apply + review; content schema excludes any phone field.
- **No-scroll vs zero-JS tension**: unconditional `overflow:hidden` would hide content without JS. Mitigation: no-scroll applied by the enhancement layer; static HTML stays in document flow.
- **Keyboard hijack regression**: reference's global keydown is the pattern to avoid; keep handlers scoped per screen (existing "no hijack" test pattern extended to views).
- **Motion contract**: reference overlays are 450-600ms; must land ≤400ms (300ms default, 400ms documented exception) and opacity-only under reduced motion.
- **Mobile detail panel**: reference's missing mobile detail is a verified bug; our detail panel must have an internal scroll region on small screens.
- **a11y**: reference has 4 axe violations, no landmarks, low contrast; our per-view h1/main/AA contract prevents them — verified in S6 via existing axe-free E2E patterns (or a new accessibility check).
- **Test churn**: 4 unit files + 2 e2e specs encode the scrolling model; migration is budgeted inside S6, not extra work.
- **View Transition overlays in Astro**: custom per-view overlay moments need View Transitions API wiring (`astro:before-swap` / transition directives); fallback = full-page load (already supported by ClientRouter fallback).

## Ready for Proposal

**Yes — unblocked.** No product decisions remain: five real routes (ADR-0003), Escape/Back behavior, gamepad hint styling only, real CV resume data, and the six-slice auto-chain/stacked-to-main delivery are all approved. The proposal must (1) carry the Apply Requirement for the typed CV source and the never-publish-phone gate, (2) lock the S1-S6 chain, (3) carry zero new dependencies beyond the declared stack.
