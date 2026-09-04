---
version: alpha
name: persona3-portfolio
description: Persona 3 Reload-inspired game-menu portfolio — light submerged world with clipped panels and strong ink shadows
colors:
  primary: "#0369a1"
  canvas: "#eaf4ff"
  canvas2: "#d6eaff"
  canvas3: "#b9d9ff"
  surface: "#ffffff"
  surfaceTint: "#f2f8ff"
  surfaceMuted: "#e6f0ff"
  ink: "#081021"
  inkSoft: "#1e2e4a"
  muted: "#475569"
  muted2: "#64748b"
  cyan: "#0ea5e9"
  cyanStrong: "#0369a1"
  cyanSoft: "#38bdf8"
  cyanGhost: "#e0f2fe"
  cyanGhost2: "#bae6fd"
  aqua: "#06b6d4"
  line: "#081021"
  border: "#cbd5e1"
typography:
  display:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
    weight: "900"
    style: "italic"
    transform: "uppercase skewX(-12deg)"
  body:
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  mono:
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  displaySize: "3.5rem"
  displaySizeLg: "5rem"
  displaySizeXl: "7rem"
rounded:
  sm: "16px"
  md: "22px"
  lg: "28px"
  chip: "8px"
  header: "10px"
spacing:
  contentMax: "1120px"
  navHeight: "72px"
components:
  clip-panel:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.ink}"
    shadow: "{colors.ink} 8px 8px 0 0"
    clipSize: "{rounded.md}"
  clip-panel-tint:
    backgroundColor: "{colors.surfaceTint}"
    borderColor: "{colors.ink}"
  clip-panel-ghost:
    backgroundColor: "rgba(255,255,255,0.92)"
    borderColor: "{colors.ink}"
  chip:
    backgroundColor: "{colors.cyanGhost}"
    borderColor: "{colors.ink}"
    clipSize: "{rounded.chip}"
  nav-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    shadow: "{colors.cyan} 4px 4px 0 0"
  focus-ring:
    borderColor: "{colors.cyanStrong}"
    width: "3px"
---

## Overview

Persona 3 Reload-inspired static game-menu world for Jonathan Soto — a submerged water/bubble field ({colors.canvas} → {colors.canvas2} → `#cfe6ff`) with dense information panels floating above it. The system is original reinterpretation, not copy: **no Persona characters, logos, UI screenshots, fonts, audio, or proprietary assets are used**. Illustrations are originals derived from the authorized public avatar (`https://avatars.githubusercontent.com/u/91631088?v=4`) and the water field is a generated texture; the non-affiliation disclaimer ships in every footer and is preserved here as an invariant. Visual grammar is shared across all routes via `src/layouts/BaseLayout.astro` — `WaterField`, `SiteNav`, clipped panels, and `Footer` — but each route remains its own menu scene.

## Colors

Palette is light blue/cyan/white/black with strong ink shadows and blue translucency over the water field. Tokens are defined in `src/styles/global.css` under `@theme` and referenced here as `{colors.*}`.

- Canvas field: {colors.canvas}, {colors.canvas2}, {colors.canvas3} create the submerged gradient behind `WaterField`. Veil layers use translucent whites over `var(--color-canvas)` to keep text contrast.
- Surfaces: {colors.surface} (panel), {colors.surfaceTint} (tinted panel), {colors.surfaceMuted} (muted tint), and ghost `rgba(255,255,255,0.92)` with `backdrop-filter: blur(8px)` for overlay panels.
- Ink and text: {colors.ink} for borders and primary text, {colors.inkSoft} for secondary content, {colors.muted} and {colors.muted2} for tertiary/mono labels. Cyan accent {colors.cyanStrong} (~7:1 on white, 6.2:1 on {colors.surfaceTint}) is the focus and link affordance to meet WCAG 2.2 AA over translucent panels and water.
- Accents: {colors.cyan}, {colors.cyanSoft}, {colors.cyanGhost}, {colors.cyanGhost2}, {colors.aqua} for bubbles, chips, and caustics; {colors.border} for subtle dividers; {colors.line} equals ink for panel borders. Keep contrast verified over translucent panels and the water field in rendered inspection, not just in swatches.

## Typography

Type uses system stacks only — no remote font fetch — defined in `src/styles/global.css`. Body copy and UI use {typography.body.fontFamily}; display presence uses {typography.display.fontFamily} at weight {typography.display.weight}, style {typography.display.style}, and tight tracking `-0.05em` transformed via {typography.display.transform}. Monospace labels and chips use {typography.mono.fontFamily}.

- Display role: oversized slanted presence for menu headings and background texture `.bg-word` at sizes {typography.displaySize} / {typography.displaySizeLg} / {typography.displaySizeXl}, line-height `0.85`, at `0.045` opacity (cyan variant `0.07`) and `skewX(-12deg)`. Treated as texture, not content.
- Body role: readable content density inside panels, `optimizeLegibility` and antialiased rendering; selection is {colors.cyanGhost2}.
- Mono role: `0.68–0.72rem`, `700`, `0.04–0.14em` tracking, uppercase for kicker, chips, and metadata. No licensed display font is shipped; the system stack is the durable choice for this build.

## Layout

Single layout `BaseLayout.astro` composes `Head`, `ClientRouter` (`astro:transitions`), `SkipLink`, `WaterField`, decorative `.bg-word` spans, `SiteNav` (driven by `Astro.url.pathname`), `<main id="main" tabindex="-1">` slot, `Footer`, and `motion.ts`. Content width is constrained to {spacing.contentMax} centered with responsive padding `px-4 sm:px-6 lg:px-8`; header is sticky with height {spacing.navHeight} and `border-b-[3px]` in {colors.ink}. Panels fill the content column with `min-width: 0` guards to prevent overflow at `360/375/768/1280` breakpoints; `html` uses `scrollbar-gutter: stable` and `overflow-x: clip`. `WaterField` is fixed `inset-0` at `z-index: -2` with image at `112%` and `opacity: 0.42` so layout remains the content column over an airy field — negative space belongs to the field, not the panels. Navigation renders a desktop `hidden md:block` `menubar` and a mobile `grid 2-col` menu hidden below `md`, sharing the same `nav-helpers` active logic.

## Elevation & Depth

Depth is flat-layered with strong ink shadows and subtle motion, not dark-neon or glassmorphism. Panels use `--shadow-ink: 8px 8px 0 0 var(--color-ink)` with variants `sm 6px`, `lg 12px`, `xl 16px`; chips and nav use `4px 4px 0 0` offsets (nav active uses {components.nav-active.shadow}). Shadows are offset, not blurred, to sell the cut-paper menu feel. Continuous motion is CSS-driven (`water-drift 22s alternate`, `bubble-drift 11–23s per bubble`, `9` default / `14` dense bubbles) plus GSAP entrance (`y:18→0`, `duration 0.55`, `stagger 0.06`) and water scale `1.04→1 0.9s`; caustic drift and parallax (`±10px/±8px` via `quickTo`) are bounded and compositor-safe (`transform`/`opacity` only). Parallax is gated on `(hover: hover) and (pointer: fine)` && `!prefers-reduced-motion` and torn down before ClientRouter swap (`astro:before-swap` → `destroyMotion`/`killAll`). `will-change` is transient JS-only (set before motion, cleared on complete/kill/swap); no standing stylesheet `will-change` remains. Global `html { scroll-behavior: smooth }` is removed to keep ClientRouter and SkipLink instant. Motion conveys no information and all content is available without it.

## Shapes

Clipped/diagonal panels are the signature shape — panels feel cut at an angle, not generic rounded cards. Tokens are {rounded.sm}, {rounded.md} (default), {rounded.lg}, with {rounded.chip} `8px` for chips and {rounded.header} `10px` for the header monogram in `global.css` and `ClippedPanel.astro`.

- Primary clip: `clip-path: polygon(0 0, calc(100% - var(--clip-size)) 0, 100% var(--clip-size), 100% 100%, var(--clip-size) 100%, 0 calc(100% - var(--clip-size)))` with `2px solid var(--color-ink)` and `{components.clip-panel.shadow}`; variants map via `clip="sm|md|lg"` to `--clip-size`.
- Secondary clip: `polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))` for chips, nav items, and inline actions.
- Chips use `ghost` tint `{components.chip.backgroundColor}` on `{components.chip.borderColor}` at `1.5px`; header monogram uses a custom SVG clip `M0 0 L28 0 L36 8 L36 36 L8 36 L0 28 Z` with cyan diagonal accent. No border-radius beyond the clipped polygon.

## Components

Components are view-only; data ownership lives in `src/data/*` and pure helpers in `src/lib/*`.

- `ClippedPanel` (`{components.clip-panel.backgroundColor}` / `{components.clip-panel.borderColor}` / `{components.clip-panel.clipSize}`): wrapper for dense content blocks; modifiers `{components.clip-panel-tint.backgroundColor}` and ghost add translucency. Renders the primary polygon and ink shadow; content inside stays `min-width: 0` to avoid clip overflow.
- `Chip` (`{components.chip.backgroundColor}` on `{components.chip.borderColor}` at `{components.chip.clipSize}`): uppercase mono label (`0.68rem`, `700`, `0.04em`) for stack and status; uses the 8px clip polygon.
- `SiteNav` / header monogram: JS monogram `36×36` clipped panel in {colors.ink} with cyan offset; desktop `menubar` and mobile menu share `aria-current="page"` selection (ink fill, never color alone) plus roving focus via `nav-helpers` (`Home`/`End`/`Arrow*` wrap, `Enter` activates, `Escape` closes mobile and returns focus). Focus ring is `{components.focus-ring.width} solid {components.focus-ring.borderColor}` with `outline-offset: 3px`; footer nav uses subdued mono links.
- `ProjectCard`: `kicker` badge in {colors.ink}, title, summary in {colors.inkSoft}, detail in {colors.muted}, stack chips, bullet highlights with `marker:{colors.cyanStrong}`, and repo links with the 8px clip; layouts preserve 4-project contract visually.
- `Head` + `Footer`: per-page title/description/canonical/OG/JSON-LD (`Person` with no `telephone`, `sameAs` is GitHub + `https://www.linkedin.com/in/jonathan-soto-dev` (constructed from authorized handle, `rel="me noopener noreferrer"`), `url` absolute only when `SITE` set else GitHub fallback, no fabricated origin; `og:image` is `public/og.png` 1200×630 with width/height, `canonical`/`og:url`/`og:image`/`sitemap`/`robots` Sitemap gated on `SITE`); footer repeats non-affiliation and MIT line and renders the same LinkedIn anchor.
- `WaterField`: decorative bubbles/caustic/veil as background (`aria-hidden="true"`, `transition:persist`) — not content — driven by CSS keyframes and GSAP parallax with live `prefers-reduced-motion` teardown.

## Do's and Don'ts

- Do keep the menu-scene framing — six routes share the clipped panel and water-field grammar; do not collapse into a single-page scroll or pastel/generic SaaS landing treatment.
- Do preserve original-art provenance: only the three `src/assets/visuals/*.png` originals (via `astro:assets` → `sharp` → `dist/_astro/*.webp` with `srcset`/`sizes`) and the code-native `js-monogram.svg` are shipped; do not trace or import Persona characters, logos, UI screenshots, fonts, audio, or unlicensed stock.
- Do maintain WCAG 2.2 AA invariants: visible focus `{components.focus-ring.width} solid {components.focus-ring.borderColor}` on every interactive element, `aria-current="page"` without color alone, skip link `href="#main"` that moves focus to `<main>`, no keyboard trap, touch targets meet comfortable sizing, and motion is not information.
- Do respect `prefers-reduced-motion: reduce` as shipped: CSS forces `animation: none` and `transform: none` on `.water-field__image/.water-field__caustic/.bubble` and entrance resets, while `motion.ts` tears down the GSAP context, removes `mousemove` parallax, and falls back to opacity-only fades; JS listens live for changes.
- Don't add remote fonts or string-path images — use `<Image>` via `astro:assets`; don't bypass the `{spacing.contentMax}` column or invent new radii beyond {rounded.sm} / {rounded.md} / {rounded.lg} / {rounded.chip}.
- Don't duplicate route/product/operational truth here — canonical intent lives in `PRODUCT.md` / `PRD.md` / `README.md` / `docs/CODEBASE-GUIDE.md`.
- Don't treat subtle drift as content — keep bubbles/caustic as background and keep entrance inside `0.55s`/`0.06` stagger so scanning remains fast.
