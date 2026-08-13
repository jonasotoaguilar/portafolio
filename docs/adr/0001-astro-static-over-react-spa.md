# ADR-0001: Astro 7 Static Architecture over React SPA

## Status

Accepted

## Date

2026-08-10

## Deciders

Jonathan Soto (jonasotoaguilar)

## Context

The reference portfolio (`persona3-website`) is a Vite 8 + React 19 SPA using react-router 7 for routing, framer-motion 12 for page transitions, and a canvas-free background built from video and image assets. The portfolio's product goals are speed, crawlability, and low maintenance: recruiters land once, the site is a single page plus a 404, and all content is four projects authored as files. Forces:

- First paint and crawlability matter more than client-side interactivity for a recruiter audience.
- All content is static and file-based; there is no server-side state, form, or auth.
- The Persona-3 experience must survive the architecture change (menu, background, transitions).
- A single developer maintains this site; build and dependency complexity must stay low.

## Decision

Build the portfolio as a static site with Astro 7.2.0 (SSG) and TypeScript 7.0.2 (strict), content authored in Markdown Content Collections. Use Astro's native View Transitions (`<ClientRouter/>`) instead of react-router + AnimatePresence, and `motion` 13.0.0's vanilla API in scripts instead of the framer-motion React API. Keep `@astrojs/react` installed only as a reserved escape hatch for the P3 menu if it demands a React island; do not use React by default.

## Consequences

### Positive

- Static HTML output: near-instant first paint and full crawlability without client-side rendering.
- Zero runtime infrastructure: no server, database, or cache (see ARCHITECTURE.md "Why there is no backend").
- Content Collections give typed, schema-validated Markdown — editing a project is a file change, not a data-model change.
- Smaller JavaScript: no React runtime unless a menu island is needed.
- View transitions are browser-native; no router or presence library to maintain.

### Negative

- Menu and card motion must be authored against `motion` 13.0.0's vanilla API — no React component abstractions for animations.
- Astro's View Transitions are less customizable than framer-motion's `AnimatePresence` (e.g., no custom exit variants per element); the browser owns the transition.
- Adding content requires a repository workflow (edit file, PR) instead of a CMS.
- The team needs Astro-specific knowledge (layouts, collections, `astro:page-load`).

### Neutral

- The reference repo's component code does not port directly; sections are reimplemented against Astro components and vanilla scripts.

## Options Considered

### Option A: Astro 7.2.0 static site (chosen)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | Zero (static hosting) |
| Scalability | Static files; scales with the host |
| Team familiarity | Low for Astro, but the surface is small |
| Ecosystem / Tooling | Mature SSG tooling; `@astrojs/sitemap`, Tailwind integration |
| Operational overhead | None (build and ship files) |

**Pros:**
- Best-in-class first paint and SEO for a brochure site.
- Deterministic builds; content changes are pure file edits.
- No runtime to operate or secure.

**Cons:**
- Client interactivity is authored with vanilla APIs or islands.
- Page transitions are browser-driven rather than library-driven.

### Option B: React SPA (reference repo approach — Vite 8 + React 19 + react-router 7 + framer-motion 12)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium (router, presence, state) |
| Cost | Low (static hosting) but larger build surface |
| Scalability | Not a factor |
| Team familiarity | High (React) |
| Ecosystem / Tooling | Rich, but heavy for one page |
| Operational overhead | None, but client-rendered shell hurts first paint |

**Pros:**
- Reuses the reference repo's component code directly.
- Full control over page transitions via AnimatePresence.

**Cons:**
- Client-side rendering: first paint and crawlability depend on JS execution.
- React runtime shipped for a one-page brochure; larger bundle against a < 100KB JS budget.
- A custom router (react-router 7) where a static page plus browser navigation suffices.

### Option C: SSR / on-demand rendering (Node server)

| Dimension | Assessment |
|-----------|------------|
| Complexity | High for the payoff |
| Cost | Server runtime and deployment surface |
| Scalability | Requires provisioning |
| Team familiarity | Medium |
| Ecosystem / Tooling | Overkill |
| Operational overhead | Deployment, monitoring, patching |

**Pros:**
- Allows dynamic content later.

**Cons:**
- No dynamic content exists or is planned in v1; every benefit is speculative.
- Violates the "simplest implementation that meets current requirements" rule.

## Trade-off Analysis

The SPA wins on component reuse and transition control; the static site wins on everything that matters for this product: first paint, crawlability, bundle size, and operational simplicity. The only genuine losses (vanilla motion authoring, browser-owned transitions) are bounded — the interactive surface is a menu, cards, and a background layer, all achievable with `motion` 13's vanilla API plus one React island as a reserved fallback.

## Action Items

1. [x] Scaffold the Astro 7.2.0 project with TypeScript strict and Tailwind 4.3.3.
2. [ ] Port the single page (Hero, Featured Work, Projects, Skills, Contact) and 404 to Astro components.
3. [ ] Move project content into Markdown Content Collections with schemas.
4. [ ] Implement the P3 menu with `motion` 13.0.0 vanilla API; use a React island only if the menu requires it.
5. [ ] Wire `<ClientRouter/>` for view transitions and remove any router from the reference repo.

## References

- Reference repo: /home/jona/repos/persona3-website (Vite 8 + React 19 + framer-motion 12 + react-router 7)
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — system overview and component details
- [ADR-0002](0002-canvas-2d-background-over-video-assets.md) — companion decision on the living background
