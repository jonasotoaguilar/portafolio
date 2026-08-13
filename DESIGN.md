---
version: alpha
name: Jonathan Soto Portfolio
description: Persona-3-inspired design system for the static portfolio site (Astro 7, Tailwind 4)
colors:
  bg-base: "#04060f"
  glow-start: "#0d2560"
  glow-end: "#060d2a"
  accent-300: "#7c92ff"
  accent-400: "#5d75ff"
  accent-500: "#4666ff"
  accent-600: "#2f46b8"
  accent-cyan: "#38e1ff"
  text-primary: "#ffffff"
  text-secondary: "#a7a7ab"
  scanline: "#000000"
typography:
  display:
    fontFamily: Anton
    fontSize: 3.5rem
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: 0em
  display-lg:
    fontFamily: Anton
    fontSize: 5.5rem
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: 0em
  menu-label:
    fontFamily: Anton
    fontSize: 8.125rem
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: 0em
  watermark:
    fontFamily: Anton
    fontSize: 18.75rem
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: 0em
  label:
    fontFamily: Bebas Neue
    fontSize: 1.25rem
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: 0.08em
  body:
    fontFamily: system-ui, sans-serif
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
rounded:
  none: 0px
  sm: 2px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  4xl: 96px
  5xl: 128px
components:
  menu-item:
    textColor: "{colors.text-primary}"
    typography: "{typography.menu-label}"
  menu-item-active:
    textColor: "{colors.accent-400}"
    typography: "{typography.menu-label}"
  button-primary:
    backgroundColor: "{colors.accent-500}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: 16px
  button-primary-hover:
    backgroundColor: "{colors.accent-400}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: 16px
  button-primary-active:
    backgroundColor: "{colors.accent-600}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: 16px
  project-card:
    backgroundColor: "{colors.glow-end}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.none}"
    padding: 24px
  project-card-hover:
    backgroundColor: "{colors.glow-start}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.none}"
    padding: 24px
  list-item:
    backgroundColor: "{colors.glow-end}"
    textColor: "{colors.text-primary}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
    padding: 16px
  list-item-active:
    backgroundColor: "{colors.glow-start}"
    textColor: "{colors.accent-300}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
    padding: 16px
  detail-panel:
    backgroundColor: "{colors.glow-end}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.none}"
    padding: 24px
  watermark:
    textColor: "{colors.accent-600}"
    typography: "{typography.watermark}"
---

## Overview

A dark, cinematic Persona-3-inspired system for a game-menu portfolio. The interaction world is the P3 menu: the site is a full-screen game shell — no scrolling landing — where a centered/center-right, diagonally staggered menu of five route items (ABOUT, RESUME, PROJECTS, SKILLS, CONTACT) selects the complete view. Selecting an item changes the URL and swaps the whole screen; Escape or Browser Back returns to the menu. The visual identity is built on stacked atmospheric forces: a near-black navy base with a breathing radial blue glow, a CRT scanline overlay, a living Canvas 2D particle/fog layer, and an original decorative figure/artifact layer (faceted abstract silhouette plus angular blue/cyan artifacts) placed per route. Keyboard/control hints and the ambient-audio mute toggle form a fixed bottom-right cluster. Giant condensed uppercase headings (Anton) carry the voice; Bebas Neue handles labels. Everything is flat and sharp — no shadows, no soft radii — with depth produced entirely by light layers and diagonal cut geometry, not elevation. The geometry is inspired by the original Persona 3 menu (skewed labels, diagonal accent cuts, blue sweep overlays) but no characters, assets, or reference defects are copied. Tokens below are named for direct mapping into the Tailwind 4 theme (`bg-base`, `accent-500`, `text-primary`, ...) so components reference tokens, never literals.

## Colors

| Token | Hex | Role |
|-------|-----|------|
| `bg-base` | #04060f | Near-black navy page base |
| `glow-start` | #0d2560 | Radial glow inner (brightest) |
| `glow-end` | #060d2a | Radial glow outer (fades into base) |
| `accent-500` | #4666ff | Primary accent: interactive actions, active states |
| `accent-400` | #5d75ff | Accent hover, active menu item |
| `accent-300` | #7c92ff | Accent highlights on dark surfaces |
| `accent-600` | #2f46b8 | Accent pressed / watermark wash |
| `accent-cyan` | #38e1ff | Decorative cyan accents: figure rims, highlight bars, artifact slashes — never body text |
| `text-primary` | #ffffff | Headings and primary text |
| `text-secondary` | #a7a7ab | Muted body text (white at reduced opacity over `bg-base`) |
| `scanline` | #000000 | CRT scanline overlay, rendered at low opacity (~15%) |

The palette is fixed and dark-only: no light theme. The glow renders as a fixed radial gradient layer (`glow-start` to `glow-end`) with a slow breathing animation; the accent family is reserved for interactive elements, active states, and large translucent watermarks — never for body text. `accent-cyan` is the decorative-system accent: figure rim strokes, the active-item highlight bar, and artifact slashes. On the dark navy base it holds strong contrast; it is never used for body copy.

## Typography

Two self-hosted display faces carry the Persona-3 voice; body text uses the system UI stack (no body font package is shipped).

| Token | Face | Size | Use |
|-------|------|------|-----|
| `menu-label` | Anton | 8.125rem (130px) | Full-screen game menu items |
| `display-lg` | Anton | 5.5rem (88px) | View headings |
| `display` | Anton | 3.5rem (56px) | LIST item titles and headings |
| `watermark` | Anton | 18.75rem (300px) | Giant translucent background words |
| `label` | Bebas Neue | 1.25rem, 0.08em tracking | Buttons, key hints, eyebrow labels |
| `body` | system-ui | 1rem / 1.6 | Paragraphs, detail panel copy |

All Anton sizes render uppercase with tight leading (0.9-1.05) and no letter spacing; Bebas Neue carries the wide tracking. Heading sizes are fluid: `menu-label` and `watermark` scale down via `clamp()` on small viewports while preserving the condensed identity. The 130px / 88px sizes are inherited from the reference P3 menu (which used 130px, 108px, 88px labels) and collapsed to two display tiers; the menu labels keep a light italic skew as in the original.

## Layout

Every route is a full-viewport game screen (`100dvh`, `overflow: hidden` by default): the root route `/` is the game shell with a centered/center-right, diagonally staggered menu column; each view route (`/about`, `/resume`, `/projects`, `/skills`, `/contact`) is its own complete screen composition with a heading zone, a LIST column, and — for PROJECTS, RESUME, and SKILLS — a detail panel. The keyboard/control cluster (key hints + audio mute toggle) is fixed at bottom-right (`bottom: 24px; right: 28px`) on every route. Internal scrolling happens only inside detail panels when content exceeds the viewport. The no-scroll constraint is applied by the enhancement layer, never unconditionally: without JavaScript every route renders all content in normal document flow, so nothing is hidden from no-JS visitors or crawlers. Spacing follows the 4px scale (`space-xs` to `space-5xl`), with generous rhythm (96-128px) to give the giant type room to breathe. The background stack is fixed, full-viewport, and `pointer-events-none`, layered behind all content: CSS glow (1), scanlines (2), Canvas 2D (3), figure/artifact layer (4).

## Elevation & Depth

No box shadows and no elevation system: depth comes from light layering and angular cut geometry. The stacking order is `glow -> scanlines -> canvas -> figure layer -> content`, and the glow's breathing animation provides perceived depth. Cards are flat surfaces with a subtle tonal lift over `bg-base` (`glow-end` base, `glow-start` on hover) rather than raised geometry. The active menu item's diagonal accent layer sits behind its label, cut with a polygon clip-path — depth by geometry, not shadow. The figure layer builds depth the same way: stacked translucent polygons with cyan rim strokes, no gradients outside the glow family, no shadows.

## Shapes

Sharp and geometric, matching the Persona-3 angular identity. The base radius is `0` (`rounded-none`); the only radius in the system is `rounded-sm` (2px) on primary buttons. Polygon clip-paths are the accent shape language: giant menu labels carry a light italic skew, the selected item is cut by a diagonal accent layer (`clip-path` polygon, accent-400) plus a 2px cyan highlight bar, and per-view transition overlays sweep as angular blue panels, stripes, or clip reveals. The decorative figure layer is hand-authored SVG polygon geometry: a faceted, featureless abstract bust (no face, hair, or uniform reads — never a copied character silhouette) in deep-blue fills with cyan rims, surrounded by rotated bars, chevrons, triangle chips, and thin cyan slashes at 15-45% opacity. Never use soft, pill, or fully rounded corners.

## Components

- **Game menu (root shell)**: full-screen route list of five giant skewed `menu-label` links (ABOUT, RESUME, PROJECTS, SKILLS, CONTACT), centered/center-right with per-item diagonal offsets, skews, and sizes (PROJECTS largest). Each item carries inline CSS vars (`--item-x`, `--item-skew`, `--item-size`); the stagger collapses on coarse-pointer viewports. The keyboard-active item (`data-active` + `aria-current="page"`) renders `accent-400` text over a diagonal clip-path accent layer with a 2px cyan highlight bar; `:hover` mirrors the same treatment; `:focus-visible` keeps its accent outline alongside the indicator. Navigation is keyboard-first (ArrowUp/ArrowDown wraps, Enter activates — existing `reduceMenuKey` logic); items enter with a 30-50ms stagger. Key hints live in the bottom-right cluster, not in the menu column.
- **Decorative figure layer**: one original inline-SVG composition per route (`FigureLayer`), fixed between canvas and content, `aria-hidden` and `pointer-events-none`, zero JavaScript. `html[data-route]` CSS places each variant: shell → oversized figure on the right half; projects → cyan top band; skills → right figure framing the center; about → bottom-left figure; contact → bottom blue wash + left figure; resume → left-mid figure; 404 → shell variant. Renders static at final state (entrance fade only, gated); fully static under reduced motion.
- **Control cluster**: fixed bottom-right column (key hints + ambient-audio mute toggle), shared on every route and persisted across View Transitions. Hints hide on coarse-pointer viewports and on short viewports (< 560px height); the mute toggle always stays reachable (≥44px).
- **Ambient audio control**: a real button with `aria-pressed` and a visible label (Mute/Unmute ambient audio). Enabled state plays the user-provided `/audio/background.mp3` (never bundled) after the first pointer/key gesture; the no-track state renders disabled with a "No ambient track" label; muted state persists to `localStorage` and survives navigation.
- **View header**: per-view composition header with the view's `display-lg` heading, a back-to-menu control (Esc returns to `/`), and key hints; ArrowLeft is offered on detail views.
- **LIST/detail**: a LIST column of `list-item` surfaces; the selected item (`list-item-active`) opens a `detail-panel` on the right with badges, description, stack, and external link. Selection state is per-view client-side; PROJECTS deep links (`#slug`) preselect an item. Focus moves into the panel on open and back to the list on close.
- **Primary button**: `accent-500` fill, `label` typography, 2px radius, 16px padding. Hover brightens to `accent-400`; press deepens to `accent-600` and scales to 0.97 (100-160ms). Used for the Contact CTA and external project links.
- **Project surface**: projects render exactly once, as `list-item` surfaces in the PROJECTS LIST; the selected item opens its `detail-panel` with description, stack, and external link (WealthQuest links to itch.io). There is no separate card grid — LIST/detail is the only project surface.
- **Watermark**: translucent `accent-600` Anton text at up to 300px behind view content, decorative and `aria-hidden`, per-view wording.

## Do's and Don'ts

- Do: reference tokens from the front matter in every component (Tailwind theme mapping); never hard-code palette literals in components.
- Do: keep headings uppercase, condensed, tight-leaded, and lightly skewed (Anton); reserve letter-spaced Bebas Neue for labels.
- Do: keep keyboard handlers scoped to the active screen — never global `window` key listeners (a verified reference bug).
- Do: keep content renderable without JavaScript; apply the no-scroll viewport as an enhancement, not a dependency.
- Do: animate only `transform` and `opacity`; keep decorative layers `pointer-events-none` and `aria-hidden`.
- Do: honor `prefers-reduced-motion` with a static canvas frame, a static figure layer, and opacity-only transitions <= 200ms.
- Don't: add shadows, soft radii, gradients outside the glow family, or a light theme.
- Don't: introduce a body font package or an external font CDN; display fonts are self-hosted via fontsource.
- Don't: place interactive elements on or under the background layers, and never block content rendering on the canvas.
- Don't: copy reference defects — dead routes, global key interception, missing mobile detail, missing landmarks, low contrast, or fake ranks/metrics.
- Don't: copy or bundle any Persona/ATLUS character art, game fonts, or audio; figures are original vector geometry and audio is BYO licensed only.
- Don't: add layout-animating properties (height, width, margins) to transitions.

## User Flows & Navigation

| Route / Flow | Purpose | Entry point | Primary action |
|---|---|---|---|
| `/` | Game menu shell: five route items | Root menu | Select a view (ArrowUp/Down + Enter) |
| `/about` | Identity, role, focus areas | Menu item ABOUT | Return to menu (Esc) |
| `/resume` | CV-backed LIST + detail panel | Menu item RESUME | Browse entries; Esc to menu |
| `/projects` | Four verified projects LIST + detail | Menu item PROJECTS | Select project detail (`#slug` deep link) |
| `/skills` | Grouped skills LIST + detail | Menu item SKILLS | Select group detail |
| `/contact` | Email, GitHub, WealthQuest links | Menu item CONTACT | Copy / open contact link |
| `/404` | Unknown-path fallback on-brand | Server/browser 404 | Return to `/` |
| List/detail keyboard flow | Move, open, close detail | ArrowUp/Down, Enter (or ArrowRight) | Open detail; Esc closes one level |
| External links | WealthQuest itch.io page, contact email | Project detail panels, Contact view | Open link in new tab |

## Accessibility Contract

- Landmarks & contrast: exactly one `h1` and a single `<main>` per page; `text-primary` on `bg-base` exceeds AA; `text-secondary` is used for body text only at sizes >= 1rem; accent on dark surfaces keeps a 4.5:1 minimum for text use.
- Keyboard & focus contract: menu fully operable with ArrowUp/ArrowDown/Enter; list/detail with ArrowUp/Down, Enter/ArrowRight to open, Esc closes one level or returns to `/`; handlers scoped to the active screen (never global); focus moves into the detail panel on open and back to the list item on close; `:focus-visible` states use the accent family with visible outlines that are never suppressed by the active treatment. The shell keyboard-active item exposes `data-active` + `aria-current="page"`; the audio mute toggle is a keyboard-operable button with `aria-pressed` and a visible label.
- Screen readers: background layers (canvas and figure layer) are `aria-hidden` and `pointer-events-none`; decorative watermark text is hidden; key hints are supplementary to real link text; all project LIST items and detail-panel links carry real link text.
- `prefers-reduced-motion: reduce`: canvas paints one static frame, breathing glow holds, entrances become opacity-only transitions under 200ms, the figure layer renders static with no entrance motion, and ambient audio never starts automatically (the mute toggle stays operable). Fewer and gentler, not zero.

## Responsive Behavior

- Mobile-first: single column below 768px; LIST and detail stack vertically on small screens, with the detail panel gaining its own internal scroll region (fixes the reference's missing mobile detail). On coarse-pointer viewports the menu stagger/skew collapses (uniform size, zero offsets, 44px targets) and the decorative key hints hide while interactive controls stay reachable.
- Fluid type: `menu-label` and `watermark` sizes scale via `clamp()`; the 130px and 300px values are desktop maxima; menu items scale per item on desktop and collapse to a uniform size on touch.
- The background and figure layers stay fixed on all viewports; canvas re-sizes with `devicePixelRatio` caps on high-DPR screens. The figure layer scales/repositions per route variant so it never covers content; on short viewports (< 560px height) hints hide and the cluster shrinks to the mute toggle.
- Touch targets: interactive elements are at least 44px tall; hover-only motion is gated behind `(hover: hover) and (pointer: fine)`; key hints hide on touch devices.

## Performance

- LCP < 2.5s, CLS < 0.1, INP < 200ms; Lighthouse performance >= 90, accessibility >= 95.
- JavaScript budget < 100KB gzipped on first load (canvas layer and motion scripts included; no framework runtime by default).
- No above-the-fold images; the background is pure CSS plus canvas.
- Self-hosted fonts via fontsource with swap-friendly loading; no external font CDN.
- Canvas caps particle count and devicePixelRatio and pauses when the tab is hidden.
- Each view is a small static page; the no-scroll enhancement adds no layout cost to the initial HTML.

## SEO

- One `h1` per page, one `<main>` landmark per view; per-view titles (e.g. "Projects · Jonathan Soto").
- JSON-LD `Person` block with `name`, `jobTitle`, `email`, and `sameAs` links (GitHub and the WealthQuest itch.io page).
- `@astrojs/sitemap` generates `sitemap.xml` at build time listing the index plus the five view routes; the 404 page is excluded.
- One canonical URL per page; indexable by default; PROJECTS detail is deep-linkable via fragment anchors (`#slug`).

## Content & States

- Copy is English, first-person, professional; no emojis in UI strings.
- RESUME content derives only from the verified CV: education (USACH 2020-2025, technical telecommunications 2017-2019), experience (Productos Barber Chile 2020-2026, Policomp internship Jan-Mar 2020), projects (ServiceFlow, WealthQuest), WealthQuest academic publication (May 2025), and languages (Spanish native; English basic technical reading). No ranks, metrics, or phone number.
- LIST items have one static state plus a selected state (active item opens the detail panel); no loading or empty states exist (static content, built at compile time).
- Ambient audio states: `no-track` (disabled button, "No ambient track" label — the default deployed state), `ready` (track present, awaiting first gesture), `playing`, and `muted` (persisted). State changes fade volume 400ms (200ms under reduced motion); storage failure keeps an in-memory state.
- Error state: the 404 page reuses the visual identity with a single action (back to `/`).
- External link behavior: open in a new tab with `rel="noopener noreferrer"`.

## Motion

Motion is ambient and identity-driven, following the ui-motion contract (sub-300ms UI, `transform`/`opacity` only, reduced-motion fallback). Frequency tier: the background is seen on every visit, but it is ambient atmosphere, not interaction, and a portfolio is visited rarely compared to an app — delight budget applies to first impressions.

| Effect | Token / values | Rationale |
|---|---|---|
| Glow breathing (CSS, zero JS) | ~8s cycle, strong `ease-in-out` (cubic-bezier(0.77, 0, 0.175, 1)), opacity 0.75 -> 1, optional scale 1 -> 1.02 | Ambient constant motion; `transform`/`opacity` only; no layout paint |
| Canvas particles/fog | rAF game loop, `linear` per-particle motion, drift 0.2-0.5 px/frame at 60fps, capped count and DPR | Constant motion is linear; the loop pauses on hidden tabs |
| View transitions (menu <-> views) | Per-view overlay moments (blue panel, stripe, or clip-path sweep) at 300ms default, up to 400ms total as a documented exception, strong `ease-out` (cubic-bezier(0.23, 1, 0.32, 1)) | The reference's 450-600ms overlays violate the contract; capped at 400ms |
| Menu item entrance | Stagger 30-50ms between items, `translateY(8px) -> 0` + opacity, 300ms `ease-out` | Group entrance stagger; no `scale(0)` entries |
| Active indicator state | 150ms color transition only; the accent layer and highlight bar toggle with state, no entrance motion | Persistent indicator follows keyboard; instant affordance, no distraction |
| Figure layer entrance | One 400ms opacity fade on first paint (`ease-out`), then fully static | Ambient decoration; no loop, no drift |
| Ambient audio fades | 400ms `ease-out` volume fade default; 200ms under reduced motion | Audible transitions inside the 200-450ms spec band |
| Card / link hover | 150-200ms, `ease`, color shift to accent | Hover/color change uses `ease`; gated to fine pointers |
| Button press | `scale(0.97)`, transition 160ms `ease-out` | Press feedback, 100-160ms band |
| Reduced motion | Canvas paints one static frame and never starts the loop; glow holds; entrances and view transitions become opacity-only <= 200ms; figure layer static with no entrance; audio never starts automatically | Fewer and gentler, not zero |

Motion runs on `motion` 13.0.0's vanilla API in scripts (or CSS animations for the glow); no React runtime is used for motion unless the game menu requires an island. Never animate layout properties; never use keyframes for rapidly repeated UI triggers (transitions only).

## UI Libraries & Usage Boundaries

- Tailwind CSS 4.3.3 (via `@tailwindcss/vite`): the only styling system; tokens map to the Tailwind theme.
- `motion` 13.0.0: vanilla API in scripts for menu/view motion and canvas orchestration; React API not used by default.
- `@astrojs/react`: reserved exclusively for the game menu if it demands a React island; no other React usage.
- Astro native View Transitions (`<ClientRouter/>`): the only page-transition mechanism; no router library.
- `@fontsource/anton` and `@fontsource/bebas-neue`: the only fonts; self-hosted.
- No icon libraries, no animation libraries beyond `motion`, no image/video assets for the background, no CSS framework beyond Tailwind.
