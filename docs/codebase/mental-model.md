# Mental Model: How the Portfolio Fits Together

Back to the [Codebase Guide](../CODEBASE-GUIDE.md).

This page is the foundational reading for understanding portafolio: what the site is, how data flows through it, the canvas background pattern, and the reduced-motion contract. It is grounded in the repository as it exists today.

## The Site in One Sentence

A fully static, Persona-3-inspired game-menu portfolio for Jonathan Soto: plain HTML generated at build time, a root game-menu shell at `/` whose five items each swap the complete view to its own static route (`/about`, `/resume`, `/projects`, `/skills`, `/contact`), with a decorative layered background (glow, scanlines, canvas, original figure/artifact layer) and native view transitions — and zero backend, database, or runtime state.

## The Model (per ARCHITECTURE.md)

Per [ARCHITECTURE.md](../../ARCHITECTURE.md), [PRD.md](../../PRD.md), [DESIGN.md](../../DESIGN.md), and [ADR-0003](../adr/0003-static-view-routes-over-client-view-state.md), the product is:

- **Root shell** — `/` is a full-screen game menu of exactly five items (ABOUT, RESUME, PROJECTS, SKILLS, CONTACT), each a real route link; centered/center-right with per-item diagonal offsets and skews (collapsing to uniform 44px targets on coarse-pointer viewports), keyboard-first (ArrowUp/ArrowDown wrap, Enter activates) with key hints only — no Gamepad API. The keyboard-active item carries a persistent colorful indicator (`data-active` + `aria-current="page"`).
- **Five views** — each route is its own static HTML page with a per-view title, exactly one `h1` inside a single `<main>`, JSON-LD, and a sitemap entry. PROJECTS, RESUME, and SKILLS use an in-view LIST + detail panel; PROJECTS deep links use fragments (`/projects#serviceflow`).
- **Control cluster + ambient audio** — key hints and the mute toggle form a fixed bottom-right cluster (hints hidden on coarse/short viewports); optional audio plays a user-provided licensed track only, after the first gesture, with a persisted mute preference (see ADR-0004).
- **Escape/Back** — Escape closes an open panel first, then navigates directly to `/`; the Browser Back button follows native history (no custom history code).
- **Progressive enhancement** — without JavaScript every route renders all content in normal document flow; the no-scroll viewport is applied by the enhancement layer only.
- **Deletions** — the Featured Work grid (duplicated project rendering) and the anchor contract (`#featured-work`, `#projects`, `#skills`, `#contact`) are removed; projects render exactly once, in the PROJECTS LIST.

## What Exists Today

The migration is complete: `src/pages/index.astro` is the game shell composing `GameMenu`; the five views live in `src/pages/{about,resume,projects,skills,contact}.astro` with components under `src/components/game/` (`GameMenu`, `GameViewShell`, `ViewHeader`, `KeyHints`, `GameList`, `GameListItem`, `DetailPanel`). The legacy landing (Hero/Featured Work/Projects/Skills/Contact sections, `CompactNav` + `MenuOverlay` dialog, `Section.astro`, `src/scripts/menu.ts`, `ProjectCard`) was deleted in Slice 6; its tests (`tests/unit/{nav,sections}.test.ts`, `tests/e2e/{menu,portfolio}.spec.ts`) were replaced by the shell/view suites. The change was delivered in six chained slices (S1 docs sync → S6 migration + verification) and is archived at `openspec/changes/archive/2026-08-11-persona-game-menu-navigation/`. The Persona UI/UX remediation (`openspec/changes/persona-ui-ux-remediation/`) then added the diagonal staggered menu, the persistent active indicator, the bottom-right control cluster, the per-route figure layer, and BYO ambient audio across seven phases.

## Implemented Capabilities

- **Shell and view pages** — `index.astro` is the game shell (five route links); `about/resume/projects/skills/contact.astro` are full-screen views; components land under `src/components/game/` (`GameMenu`, `GameViewShell`, `ViewHeader`, `KeyHints`, `GameList`, `GameListItem`, `DetailPanel`).
- **Menu composition and indicator** — `GameMenu.astro` carries per-item diagonal config (`--item-x`/`--item-skew`/`--item-size`) consumed by one `.menu-item` rule in `global.css`; `src/scripts/shell.ts` sets `data-active` + `aria-current="page"` on every move (design AD1/AD2).
- **Control cluster** — `ControlCluster.astro` (KeyHints + `AudioControl`) renders once in `BaseLayout` with `transition:persist`; hide rules for coarse/short viewports live in `global.css` (design AD4).
- **Ambient audio** — pure reducer in `src/lib/audio/state.ts` (`no-track → ready ⇄ playing ⇄ muted`) + DOM wiring in `src/scripts/ambient-audio.ts` (HEAD probe once, gesture unlock, fades, localStorage persistence); BYO contract in `public/audio/README.txt` (design AD5).
- **Figure layer** — `src/components/FigureLayer.astro` renders one original inline-SVG composition per route, `aria-hidden` + `pointer-events-none`, positioned by `html[data-route]` CSS (design AD3).
- **Keyboard model** — `reduceMenuKey` for the shell; `reduceListKey` + `escapeHierarchy` scope LIST/detail and Escape handling to the active screen — never global keydown (the reference's verified bug).
- **Resume content** — a `resume` content collection typed from Jona's August 2026 CV (education, experience, projects, skills, languages), schema-validated, with a no-phone privacy gate; no ranks, levels, or metrics.
- **Test migration** — shell/list-detail tests replace the anchor/scroll/section tests; E2E `views.spec.ts` covers routes, zero-JS, keys, 404, view-transition overlays, and the full-page fallback; remediation regressions are pinned in `keyboard.spec.ts`, `views.spec.ts`, `budget.spec.ts`, `reduced-motion.spec.ts`, and `ambient-audio.spec.ts`.

## Data Flow

```
Markdown Content Collections (src/content/)   [projects/*.md, skills.yaml, site.config.yaml, resume.yaml]
        |  schema-validated at build time
        v
Astro Pages & Layouts (src/pages/, src/layouts/)   [shell + five view routes]
        |
        v
Astro/Vite build  +  Tailwind CSS 4  +  client scripts (shell/list-detail keys, ambient audio, canvas)
        |
        v
Static output (HTML/CSS/JS) -> any static host / CDN
        |
        v
Browser: View Transitions + CSS layers + Canvas + figure layer (progressive enhancement)
```

Content is the single source of truth; pages render it at build time; the browser only enhances what was already served as static HTML. There are no runtime data dependencies and no server-side state.

## The Layered Background

Per [DESIGN.md](../../DESIGN.md), the Persona-3 feel comes from four stacked visual forces behind the content:

1. **CSS radial glow** — a near-black navy base with a breathing radial blue glow.
2. **CSS CRT scanlines** — a scanline overlay.
3. **Canvas 2D particles/fog** — a living layer (implemented in `src/lib/canvas/particles.ts` + `src/scripts/living-background.ts`; see ADR-0002).
4. **Figure/artifact layer** — one original inline-SVG composition per route (implemented in `src/components/FigureLayer.astro`; design AD3), `aria-hidden`, `pointer-events-none`, zero JavaScript, static under reduced motion.

The design contract: depth comes from light layers, not elevation — flat, sharp, no shadows, no soft radii.

## The Canvas Game-Loop Pattern

[ADR-0002](../adr/0002-canvas-2d-background-over-video-assets.md) fixes the background implementation as a Canvas 2D layer in pure TypeScript:

- A `requestAnimationFrame` game loop with the shape **clear -> update -> draw**, rendering particles/fog.
- The canvas element carries `transition:persist` so it survives Astro View Transitions across routes (only one instance ever exists).
- The layer is decorative: `aria-hidden` and `pointer-events-none`.
- Zero rendering dependencies.

## The Reduced-Motion Contract

- With `prefers-reduced-motion: reduce`, the canvas paints a single static frame and never starts the loop.
- The glow and scanline layers render without the canvas, and content renders if the canvas is unsupported or JS is disabled (progressive enhancement).
- The figure layer renders static with no entrance motion; ambient audio never starts automatically (the mute toggle stays operable).
- View transition overlays become opacity-only of at most 200ms under reduced motion (300ms default / 400ms exception otherwise).
- Enforced by E2E tests with emulated `prefers-reduced-motion`.

## Entry Points and Reading Order

1. `src/pages/index.astro` — the game shell with the five route links.
2. `src/styles/global.css` — Tailwind entry point (tokens, glow/scanlines, menu composition, cluster, figure placements, view-transition overlays, reduced motion).
3. `src/components/game/*` + `src/scripts/{shell,view,ambient-audio}.ts` — shell menu, view LIST/detail behavior, and ambient-audio wiring; the audio reducer lives in `src/lib/audio/state.ts`.
4. `src/components/FigureLayer.astro` — the per-route decorative figure compositions.
5. `astro.config.mjs` — build configuration (site URL, sitemap, Tailwind plugin).
6. `PRD.md` and `DESIGN.md` — the product and visual system.
7. `ARCHITECTURE.md` and `docs/adr/` — how the site is built and why.
8. `openspec/changes/archive/2026-08-11-persona-game-menu-navigation/` (archived) and `openspec/changes/persona-ui-ux-remediation/` — the delivered changes: shell/view migration and the UI/UX remediation.
