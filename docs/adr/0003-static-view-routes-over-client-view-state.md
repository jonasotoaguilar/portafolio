# ADR-0003: Real Static View Routes over Client-View State

## Status

Accepted

## Date

2026-08-11

## Deciders

Jonathan Soto (jonasotoaguilar)

## Context

The approved product model is a Persona-3 game-menu shell: the root route `/` is a full-screen menu of five items (ABOUT, RESUME, PROJECTS, SKILLS, CONTACT) and selecting an item changes the complete view to its own screen. The reference SPA (`persona3-website`) implements this with real URL changes per view — verified live: `/about`, `/resume`, `/socials` — while its defects (dead routes, global key interception, missing mobile detail) are excluded, not copied. Forces:

- Each view must be deep-linkable and shareable; per-view crawlability and per-view SEO (title, h1, JSON-LD, sitemap) are preserved qualities for a recruiter audience.
- The static SSG output must stay reachable without JavaScript: every route renders its content in normal document flow.
- The game feel is LIST + in-view detail panel on one screen, not a page change per detail item.
- Browser Back must return from a view to the menu via native history; Escape is the keyboard equivalent.
- The JavaScript budget (< 100KB gzipped) and "no router library" rule rule out a client-side view-state router.

## Decision

Ship six static Astro routes: the game-menu shell at `/`, five real view routes (`/about`, `/resume`, `/projects`, `/skills`, `/contact`), and keep the existing 404 page. List/detail selection inside PROJECTS, RESUME, and SKILLS is per-view client state rendered as an in-view panel; PROJECTS selection is deep-linkable via fragment anchors (`/projects#serviceflow`). Escape closes an open detail panel first, then returns to `/`; Browser Back follows native history. No client-only view switching and no detail sub-routes in v1. Routing is Astro file-based pages plus `<ClientRouter/>` for view transitions — no router library, no React by default.

## Consequences

### Positive

- Each view is its own static HTML page: per-view title, exactly one h1 inside a single main landmark, per-view JSON-LD, and a sitemap entry.
- Static SSG is preserved: every route renders fully in document flow with zero JavaScript.
- Native Browser Back works without custom history code; Escape maps to a real route change.
- No view-state routing logic: the smallest possible JavaScript surface.
- Matches the verified reference behavior (a real URL per view) without its defects.

### Negative

- Sitemap grows from one URL to six; per-view SEO metadata (title, h1, JSON-LD) must be authored per view.
- Escape/arrow handling must be scoped per active screen — a larger keyboard surface than the single page, with a regression risk the reference demonstrated.
- Per-view transition overlays need View Transitions API care to stay within the <= 400ms motion contract.

### Neutral

- In-view detail panels are not separately indexed; `/projects/:slug` and `/resume/:section` remain a v2.0 option.

## Options Considered

### Option A: Real static routes + in-view detail (chosen)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium (five small pages, scoped handlers) |
| Cost | Zero (static hosting) |
| Scalability | Static files; scales with the host |
| Team familiarity | Low for Astro, but the surface is small |
| Ecosystem / Tooling | Native Astro file-based routing + `@astrojs/sitemap` |
| Operational overhead | None (build and ship files) |

**Pros:**
- Per-view deep links, crawlability, and SEO out of the box.
- Zero-JS reachability: every route is plain HTML in document flow.
- Native Browser Back; no history library.
- Smallest JS: no view-state routing logic.

**Cons:**
- Scoped keyboard handlers and per-view overlays must be authored carefully.

### Option B: Client-only view state (single `/` route, JS switch)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low (one page, JS views) |
| Cost | Low |
| Scalability | Not a factor |
| Team familiarity | High (plain JS) |
| Ecosystem / Tooling | None |
| Operational overhead | None |

**Pros:**
- Simplest markup; the menu is always "the app".

**Cons:**
- Destroys per-view URLs and SEO: recruiters cannot share or revisit a Projects URL.
- Contradicts the preserved crawlability contract and the zero-JS content guarantee.
- Ships view-state routing JS for zero benefit; the reference proves the model still needs real routes to feel right.
- The current single-page landing already demonstrates the crawlability cost of this model.

### Option C: Detail sub-routes (`/projects/:slug`, `/resume/:section`)

| Dimension | Assessment |
|-----------|------------|
| Complexity | High (9+ pages, per-detail SEO) |
| Cost | Low |
| Scalability | Static files |
| Team familiarity | Medium |
| Ecosystem / Tooling | Astro dynamic routes |
| Operational overhead | None |

**Pros:**
- Fully deep-linkable detail; maximal SEO per item.

**Cons:**
- 9+ pages of sitemap/title/JSON-LD surface against a 400-line implementation budget.
- The approved interaction is an in-view panel, not a page change; sub-routes break the game feel of LIST + panel on one screen.

## Trade-off Analysis

The client-only model (B) loses everything that matters — per-view URLs, crawlability, SEO, zero-JS content — to save the least valuable work. Sub-routes (C) buy maximal detail SEO the product does not need at v1 cost. Option A keeps every view a real, shareable, indexable URL while preserving the in-view panel interaction the reference proves is the right feel, and it does so with plain static HTML — the smallest JS and no router. Its costs (scoped keys, overlay care, per-view metadata) are bounded and covered by the testing strategy.

## Action Items

1. [x] Confirm the five-view, real-route model in exploration review.
2. [ ] Create the five view pages with per-view titles, one h1/main each, and per-view JSON-LD.
3. [ ] Implement LIST/detail panels with per-view selection state and `#slug` deep links for PROJECTS.
4. [ ] Scope Escape/arrow handlers per active screen; extend the "no hijack when closed" test pattern.
5. [ ] Wire `<ClientRouter/>` overlays <= 400ms (opacity-only <= 200ms under reduced motion) with full-page fallback.
6. [ ] Update sitemap expectations: index plus the five views, 404 excluded; assert in E2E.

## References

- [Exploration: Persona Game-Menu Navigation](../../openspec/changes/persona-game-menu-navigation/exploration.md) — options analysis and verified reference behavior
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — system overview, route inventory, and component details
- [PRD.md](../../PRD.md) — product model and acceptance criteria
- [ADR-0001](0001-astro-static-over-react-spa.md) — the static architecture this decision extends
- [ADR-0002](0002-canvas-2d-background-over-video-assets.md) — companion decision on the living background
- Reference repo: /home/jona/repos/persona3-website (react-router 7 with real per-view URLs; dead `/github` and `/sideproj` routes are defects, not features)
