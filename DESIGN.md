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
  accent-red: "#e4002b"
  text-primary: "#ffffff"
  text-secondary: "#a7a7ab"
  scanline: "#000000"
  surface-light: "#ffffff"
  surface-light-muted: "#e8edf5"
  text-on-light: "#04060f"
  text-on-light-secondary: "#3a4557"
  accent-on-light: "#2f46b8"
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
  label-sm:
    fontFamily: Bebas Neue
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: 0.08em
  rank-value:
    fontFamily: Anton
    fontSize: 1.75rem
    fontWeight: 400
    lineHeight: 1
    letterSpacing: 0em
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
  list-item:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-on-light}"
    typography: "{typography.display}"
    rounded: "{rounded.sm}"
    padding: 16px
  list-item-active:
    backgroundColor: "{colors.surface-light-muted}"
    textColor: "{colors.accent-on-light}"
    typography: "{typography.display}"
    rounded: "{rounded.sm}"
    padding: 16px
  skill-card:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-on-light}"
    typography: "{typography.display}"
    rounded: "{rounded.sm}"
    padding: 16px
  detail-panel:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-on-light}"
    rounded: "{rounded.sm}"
    padding: 24px
  watermark:
    textColor: "{colors.bg-base}"
    typography: "{typography.watermark}"
---

## Overview

A dark-navy-on-light, cinematic Persona-3-inspired system for a game-menu portfolio. The interaction world is the P3 menu: the site is a full-screen game shell — no scrolling landing — where a centered/center-right, diagonally staggered menu of four route items (ABOUT, RESUME, PROJECTS, SKILLS) selects the complete view. Selecting an item changes the URL and swaps the whole screen; Escape or Browser Back returns to the menu. The visual identity is built on stacked atmospheric forces: every non-404 route renders on a static white→light-blue→sea-blue diagonal contrast-cut field (the shell and the four views share it; the 404 keeps the dark breathing navy glow as the error identity), overlaid with CRT scanlines and a living Canvas 2D layer (a deep caustic wash at the bottom edge, rising bubbles, and drifting fog particles). On the light field, dark navy text (≈20:1) and dark-blue accent links carry the content, while white contrast-cut panels give cards and detail surfaces their separation. Keyboard/control hints and the ambient-audio mute toggle form a fixed cluster. Giant condensed uppercase headings (Anton) carry the voice; Bebas Neue handles labels. Everything is flat and sharp — no shadows, no soft radii — with depth produced entirely by light layers and diagonal cut geometry, not elevation. The geometry is inspired by the original Persona 3 menu (skewed labels, diagonal accent cuts, blue sweep overlays) but no characters, assets, or reference defects are copied. Tokens below are named for direct mapping into the Tailwind 4 theme (`bg-base`, `accent-500`, `text-primary`, ...) so components reference tokens, never literals.

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
| `accent-cyan` | #38e1ff | Decorative cyan accents: highlight bars — never body text |
| `accent-red` | #e4002b | Geometric focus layer: the active skill card's offset parallelogram — decorative geometry, never text |
| `text-primary` | #ffffff | Headings and primary text on the dark 404 identity |
| `text-secondary` | #a7a7ab | Muted body text on the dark 404 identity |
| `scanline` | #000000 | CRT scanline overlay, rendered at low opacity (~15%) |
| `surface-light` | #ffffff | White contrast-cut panels and the light-field gradient origin |
| `surface-light-muted` | #e8edf5 | Secondary light surface: list-item hover/active, chips |
| `text-on-light` | #04060f | Body/heading text on light surfaces (≈20:1) |
| `text-on-light-secondary` | #3a4557 | Muted text on light (≈7:1) |
| `accent-on-light` | #2f46b8 | Links/accents on light surfaces (≈8:1) |

The palette is fixed: there is no theme toggle (PRD non-goal intact). Every non-404 route — the shell and the four views — renders on the **light contrast-cut field**, a static white→light-blue→sea-blue diagonal gradient, with a dark navy text family: headings and body use `text-on-light` (≈20:1 on white), muted copy `text-on-light-secondary` (≈7:1), and links/labels `accent-on-light` (≈8:1, deepening toward near-black on hover). White (`surface-light`) and muted-light (`surface-light-muted`) surfaces separate panels and list items; `accent-cyan` stays decorative-only: the active-item highlight bar — never body copy. The dark ocean family (`bg-base`, `glow-start`, `glow-end`, `text-primary`) survives as the 404 error identity and as the near-black active/focus label color on the shell; `accent-500` stays dark-surface-only for text. The glow renders as a fixed radial gradient layer (`glow-start` to `glow-end`) with a slow breathing animation on the 404 route only. The accent family is reserved for interactive elements, active states, and large translucent watermarks — never for body text. `accent-red` is a fixed decorative member of the family: the skill cards' active focus layer, drawn as an offset parallelogram (geometry, never a shadow or text color).

## Typography

Two self-hosted display faces carry the Persona-3 voice; body text uses the system UI stack (no body font package is shipped).

| Token | Face | Size | Use |
|-------|------|------|-----|
| `menu-label` | Anton | 8.125rem (130px) | Full-screen game menu items |
| `display-lg` | Anton | 5.5rem (88px) | View headings |
| `display` | Anton | 3.5rem (56px) | LIST item titles and headings |
| `watermark` | Anton | 18.75rem (300px) | Giant translucent background words |
| `label` | Bebas Neue | 1.25rem, 0.08em tracking | Buttons, key hints, eyebrow labels |
| `label-sm` | Bebas Neue | 0.875rem, 0.08em tracking | Card metadata: skill category, RANK label |
| `rank-value` | Anton | 1.75rem | Skill rank numeral on the card |
| `body` | system-ui | 1rem / 1.6 | Paragraphs, detail panel copy |

All Anton sizes render uppercase with tight leading (0.9-1.05) and no letter spacing; Bebas Neue carries the wide tracking. Heading sizes are fluid: `menu-label` and `watermark` scale down via `clamp()` on small viewports while preserving the condensed identity. The 130px / 88px sizes are inherited from the reference P3 menu (which used 130px, 108px, 88px labels) and collapsed to two display tiers; the menu labels keep a light italic skew as in the original.

## Layout

Every route is a full-viewport game screen (`100dvh`, `overflow: hidden` by default): the root route `/` is the game shell with a centered/center-right, diagonally staggered menu column; each view route (`/about`, `/resume`, `/projects`, `/skills`) is its own complete screen composition with a heading zone; PROJECTS and RESUME carry a LIST column + detail panel, while SKILLS renders a diagonal list of rank cards (see Components). The keyboard/control cluster (key hints + audio mute toggle) is fixed (bottom-right hints; mute top-right below the identity card) on every route. Internal scrolling happens inside detail panels and inside the SKILLS card list (the list is taller than the viewport, so the list owns its scroll viewport at every size while the view header stays fixed — the only view that scrolls internally). The no-scroll constraint is applied by the enhancement layer, never unconditionally: without JavaScript every route renders all content in normal document flow, so nothing is hidden from no-JS visitors or crawlers. Spacing follows the 4px scale (`space-xs` to `space-5xl`), with generous rhythm (96-128px) to give the giant type room to breathe. The background stack is fixed, full-viewport, and `pointer-events-none`, layered behind all content: light field (1 — the static white→light-blue→sea-blue gradient on every non-404 route; the breathing navy glow only on 404), scanlines (2), Canvas 2D (3).

## Elevation & Depth

No box shadows and no elevation system: depth comes from light layering and angular cut geometry. The stacking order is `field/glow -> scanlines -> canvas -> content`, and the field's fixed diagonal gradient provides depth through tonal contrast (the glow's breathing animation survives only on the dark 404 route). Cards are flat white surfaces over the light field, with a muted-light hover/active lift (`surface-light-muted`) rather than raised geometry. The active menu item's diagonal accent layer sits behind its label, cut with a polygon clip-path — depth by geometry, not shadow. The active skill card's focus layer is a separate red parallelogram offset behind the card (a translated, skewed `::before` in `accent-red`) — the same geometry language, never a `box-shadow`.

## Shapes

Sharp and geometric, matching the Persona-3 angular identity. The base radius is `0` (`rounded-none`); `rounded-sm` (2px) is the only radius in the system, used on primary buttons, list-item surfaces, detail panels, and chips. Polygon clip-paths are the accent shape language: giant menu labels carry a light italic skew, the shell's selected item is overlaid by a large translucent white wedge (both edges diagonal) with a 2px cyan highlight bar, the view list's selected item carries the same 2px cyan bottom bar, skill cards are parallelograms (counter-italic +8° skew with counter-skewed content) staggered along a diagonal, and per-view transition overlays sweep as angular blue panels, stripes, or clip reveals. Never use soft, pill, or fully rounded corners.

## Components

- **Game menu (root shell)**: full-screen route list of four giant skewed `menu-label` links (ABOUT, RESUME, PROJECTS, SKILLS), centered/center-right with per-item diagonal offsets, skews, and sizes (PROJECTS largest). Each item carries inline CSS vars (`--item-x`, `--item-skew`, `--item-size`); the stagger collapses on coarse-pointer viewports. The keyboard-active item (`data-active` + `aria-current="page"`) renders near-black text over a large translucent white wedge with a 2px cyan highlight bar on the shell's light field; `:hover` keeps the cyan label and never overrides the active/focus color; `:focus-visible` draws the wedge directly (the browser outline is dropped on the shell menu only — views and other controls keep their accent outline). Navigation is keyboard-first (ArrowUp/ArrowDown wraps, Enter activates — existing `reduceMenuKey` logic); items enter with a 25ms stagger. Key hints live in the bottom-right cluster, not in the menu column.
- **Home shell decorations**: the shell-only (`GameMenu` markup + `global.css`) decorative layer: a huge vertical `PORTFOLIO` word in near-black Anton bleeds off the left edge inside a full-viewport `overflow:hidden` container (`aria-hidden`, `pointer-events-none`, zero JS), re-flowing to a horizontal band along the bottom edge below 768px. There is no identity card on the shell — the top-right utility position belongs to the persisted mute control (see Control cluster). No other route renders oversized type.
- **Global light field & view surfaces**: the shared surface contract implemented in `global.css` and used by `GameViewShell`, `ViewHeader`, `GameListItem`, `DetailPanel`, and the view pages. Every non-404 route renders on the static white→light-blue→sea-blue diagonal field (`.glow-layer`); view text uses the light-field palette (dark navy headings/body, dark-blue accent links). Semantic classes — `.view-list-item` (white 2px card, muted-light hover, active state with dark-blue accent text + 2px cyan bottom bar), `.view-panel` (white detail surface), `.view-chip` (muted-light badge), `.view-link` (dark-blue accent deepening to near-black on hover) — keep the visual contract in one place instead of page-specific styling.
- **Control cluster**: a persisted (View Transitions) wrapper holding the key hints fixed bottom-right and the ambient-audio mute toggle fixed top-right (1.5rem/1.5rem — the only top-right utility control), shared on every route. Hints hide on coarse-pointer viewports and on short viewports (< 560px height); the mute toggle always stays reachable (≥44px). Navigation effect sounds (button_click / button_select / menu_close) play independently of the ambient mute.
- **Ambient audio control**: a real button with `aria-pressed` and a visible label (Mute/Unmute ambient audio). Enabled state plays the committed licensed derivative `/audio/background.mp3` (Pixabay Content License; never a bundled official soundtrack) after the first pointer/key gesture, with zero bytes fetched before that (`preload="none"` + HEAD probe); the no-track state renders the control disabled with the label staying "Sound: Off" (derivative absent from build); muted state persists to `localStorage` and survives navigation.
- **View header**: per-view composition header with the view's `display-lg` heading, a back-to-menu control (Esc returns to `/`), and key hints; ArrowLeft is offered on detail views.
- **LIST/detail**: a LIST column of `list-item` surfaces used by PROJECTS and RESUME; the selected item (`list-item-active`) opens a `detail-panel` on the right with badges, description, stack, and external link. Selection state is per-view client-side; PROJECTS deep links (`#slug`) preselect an item. Focus moves into the panel on open and back to the list on close. SKILLS is card-only and renders no detail panel.
- **Skill cards (SKILLS view)**: the enhanced view is a FIXED-SLOT RECYCLED LIST, not a native scrollable 22-card list. The no-JS fallback renders one parallelogram card per skill — all 22 — in normal document flow (name + category underneath + right-aligned RANK block); on successful JS init, `skills-scroll.ts` adopts the first seven cards as persistent slot nodes (`data-skill-slot`), removes the remaining fifteen, and gates the enhanced CSS (`data-skills-enhanced` on the region; the 22 records ship once in an inline `type="application/json"` data blob). The seven slot buttons are never removed or replaced — only their text/category/rank and ARIA attributes mutate as the data window advances — so focus is structurally preserved. Semantics are a Skills-specific listbox, not toggle buttons: `role="listbox"` on the list, `role="option"` with `aria-selected`, `aria-setsize="22"`, `aria-posinset` (global index + 1), and roving `tabIndex` on the slots; slots drop `data-list-item` so the generic `view.ts` list logic no-ops on Skills (its document-level Escape still works). Rank data is explicit, editable content in `skills.yaml` on the 1..4 scale (1 basic, 2 intermediate, 3 advanced, 4 expert) — never generated metrics. Cards lean opposite to the menu's italic (skewX +8°, content counter-skewed) and stagger along a diagonal via a per-slot `--skill-index` custom property that REPEATS (`index % 7`: 0.75rem x / 1px y per step; tablet halves both; <768px and coarse pointers collapse the stagger to full-width ≥44px targets) — slot geometry never moves while the window advances. Interaction: ArrowDown/ArrowUp move focus through the seven slots without moving the window; at slot 7 another ArrowDown advances the data window one skill (2–8, then 3–9, …), updating all seven slot contents with focus visually stuck on slot 7 (ArrowUp mirrors at slot 1); last→first wraps to window 1–7/slot 1 and first→last wraps to window 16–22/slot 7. Wheel/trackpad over the list never changes `scrollTop` and never moves a native scrollbar: deltas accumulate (≈53px threshold) and emit the same discrete one-step transitions, with exactly one select sound per transition and Ctrl+wheel never hijacked. Clicking a slot selects it in place (window unchanged); hover select plays once per slot on fine pointers; click and hover sounds share the existing delegated effect wiring (`[data-skill-slot]` added to its targets) and never duplicate. The active slot paints a separate red parallelogram offset behind it (`::before`, `accent-red`, `pointer-events-none`, geometry not `box-shadow`) keyed on the `data-active` presence; the slot's `:focus-visible` outline stays visible. The small diagonal scrollbar near the list's lower-left is a FIXED VISUAL AFFORDANCE only: a 6–8px track with a parallelogram thumb that never moves (there is no `scrollTop` to mirror), is not a drag control, never intercepts pointers, and is hidden on coarse pointers.
- **Primary button**: `accent-500` fill, `label` typography, 2px radius, 16px padding. Hover brightens to `accent-400`; press deepens to `accent-600` and scales to 0.97 (100-160ms). Used for the 404 back-to-home action and external project links.
- **Project surface**: projects render exactly once, as `list-item` surfaces in the PROJECTS LIST; the selected item opens its `detail-panel` with description, stack, and external link (WealthQuest links to itch.io). There is no separate card grid — LIST/detail is the only project surface.

## Do's and Don'ts

- Do: reference tokens from the front matter in every component (Tailwind theme mapping); never hard-code palette literals in components.
- Do: keep headings uppercase, condensed, tight-leaded, and lightly skewed (Anton); reserve letter-spaced Bebas Neue for labels.
- Do: keep keyboard handlers scoped to the active screen — never global `window` key listeners (a verified reference bug).
- Do: keep content renderable without JavaScript; apply the no-scroll viewport as an enhancement, not a dependency.
- Do: animate only `transform` and `opacity`; keep decorative layers `pointer-events-none` and `aria-hidden`.
- Do: honor `prefers-reduced-motion` with a static canvas frame and opacity-only transitions <= 200ms.
- Don't: add shadows, soft radii, gradients outside the field/glow families, or a theme toggle.
- Don't: introduce a body font package or an external font CDN; display fonts are self-hosted via fontsource.
- Don't: place interactive elements on or under the background layers, and never block content rendering on the canvas.
- Don't: copy reference defects — dead routes, global key interception, missing mobile detail, missing landmarks, low contrast, or fake/invented metrics presented as verified facts (explicit, editable skill ranks are real content, not invented metrics).
- Don't: copy or bundle any Persona/ATLUS character art, game fonts, or audio; the only audio is the registered Pixabay-licensed derivative.
- Don't: add layout-animating properties (height, width, margins) to transitions.
- Do: keep skill ranks as explicit content (1..4) in `skills.yaml` so they stay manually adjustable; never derive them.

## User Flows & Navigation

| Route / Flow | Purpose | Entry point | Primary action |
|---|---|---|---|
| `/` | Game menu shell: four route items | Root menu | Select a view (ArrowUp/Down + Enter) |
| `/about` | Identity, role, focus areas | Menu item ABOUT | Return to menu (Esc) |
| `/resume` | CV-backed LIST + detail (education, experience, projects, skills, languages) | Menu item RESUME | Browse entries; Esc to menu |
| `/projects` | Four verified projects LIST + detail | Menu item PROJECTS | Select project detail (`#slug` deep link) |
| `/skills` | Ranked skills: fixed seven-slot recycled list (name + category + RANK 1..4), 22 records rotating through seven persistent slots | Menu item SKILLS | Arrows move through the seven slots, then rotate the window one skill per edge press; wheel does the same discretely; Esc to menu |
| `/404` | Unknown-path fallback on-brand | Server/browser 404 | Return to `/` |
| List/detail keyboard flow | Move, open, close detail | ArrowUp/Down, Enter (or ArrowRight) | Open detail; Esc closes one level |
| External links | WealthQuest itch.io page, project links | Project detail panels | Open link in new tab |

## Accessibility Contract

- Landmarks & contrast: exactly one `h1` and a single `<main>` per page; on the light field `text-on-light` on `surface-light` exceeds AA (≈20:1) and `accent-on-light` holds ≈8:1 for links/labels; on the dark 404 route `text-primary` on `bg-base` exceeds AA; `text-on-light-secondary` is used for body text only at sizes >= 1rem; accent on dark surfaces keeps a 4.5:1 minimum for text use.
- Keyboard & focus contract: menu fully operable with ArrowUp/ArrowDown/Enter; list/detail with ArrowUp/Down, Enter/ArrowRight to open, Esc closes one level or returns to `/`; on SKILLS (card-only, enhanced) the arrow keys drive the fixed seven-slot recycled list — ArrowDown/Up move focus through the seven persistent slots with no window movement, at slot 7/slot 1 the next press advances/moves-back the data window exactly one skill with focus visually stuck to that edge, and first/last wrap to the far end (window 1–7/slot 1 or window 16–22/slot 7); wheel/trackpad emits the same discrete one-step transitions from an accumulated ≈53px threshold (never `scrollTop`, never a native scrollbar; Ctrl+wheel stays browser zoom) — Enter keeps the list primary and Esc returns directly to `/`; handlers scoped to the active screen (never global); focus moves into the detail panel on open and back to the list item on close; `:focus-visible` states use the accent family with visible outlines that are never suppressed by the active treatment. The shell keyboard-active item exposes `data-active` + `aria-current="page"`; the audio mute toggle is a keyboard-operable button with `aria-pressed` and a visible label. Skill slots expose listbox semantics (`role="option"`, `aria-selected`, `aria-setsize="22"`, `aria-posinset`) with an accessible name composed of skill + category + rank from their visible text ("Go Backend RANK 3").
- Screen readers: the background layer (canvas) is `aria-hidden` and `pointer-events-none`; decorative watermark text is hidden; key hints are supplementary to real link text; all project LIST items and detail-panel links carry real link text.
- `prefers-reduced-motion: reduce`: canvas paints one static frame, breathing glow holds, entrances become opacity-only transitions under 200ms, and ambient audio never starts automatically (the mute toggle stays operable). Fewer and gentler, not zero.

## Responsive Behavior

- Mobile-first: single column below 768px; LIST and detail stack vertically on small screens, with the detail panel gaining its own internal scroll region (fixes the reference's missing mobile detail). The SKILLS enhanced list collapses its diagonal stagger to a straight column of full-width ≥44px targets on <768px and coarse-pointer viewports; the seven-slot window is fixed (no internal scrolling — wheel and arrows recycle it), the decorative scrollbar never renders on coarse pointers, and on short screens the window shrinks with the available space instead of overflowing the page; the no-JS fallback keeps all 22 cards in normal document flow at every size. On coarse-pointer viewports the menu stagger/skew collapses (uniform size, zero offsets, 44px targets) and the decorative key hints hide while interactive controls stay reachable.
- Fluid type: `menu-label` and `watermark` sizes scale via `clamp()`; the 130px and 300px values are desktop maxima; menu items scale per item on desktop and collapse to a uniform size on touch.
- The background layer stays fixed on all viewports; canvas re-sizes with `devicePixelRatio` caps on high-DPR screens. On short viewports (< 560px height) hints hide and the cluster shrinks to the mute toggle.
- Touch targets: interactive elements are at least 44px tall; hover-only motion is gated behind `(hover: hover) and (pointer: fine)`; key hints hide on touch devices.

## Performance

- LCP < 2.5s, CLS < 0.1, INP < 200ms; Lighthouse performance >= 90, accessibility >= 95.
- JavaScript budget < 100KB gzipped on first load (canvas layer, motion scripts, and the inlined ambient-audio wiring included; no framework runtime by default).
- No above-the-fold images; the background is pure CSS plus canvas.
- Self-hosted fonts via fontsource with swap-friendly loading; no external font CDN.
- Canvas caps particle count and devicePixelRatio and pauses when the tab is hidden.
- Each view is a small static page; the no-scroll enhancement adds no layout cost to the initial HTML.

## SEO

- One `h1` per page, one `<main>` landmark per view; per-view titles (e.g. "Projects · Jonathan Soto").
- JSON-LD `Person` block with `name`, `jobTitle`, `email`, and `sameAs` links (GitHub and the WealthQuest itch.io page).
- `@astrojs/sitemap` generates `sitemap.xml` at build time listing the index plus the four view routes; the 404 page is excluded.
- One canonical URL per page; indexable by default; PROJECTS detail is deep-linkable via fragment anchors (`#slug`).

## Content & States

- Copy is English, first-person, professional; no emojis in UI strings.
- RESUME content derives only from the verified CV: education (USACH 2020-2025, technical telecommunications 2017-2019), experience (Productos Barber Chile 2020-2026, Policomp internship Jan-Mar 2020), projects (ServiceFlow, WealthQuest), the WealthQuest academic publication (May 2025), skills, and languages (Spanish native; English basic technical reading). No ranks, metrics, or phone number.
- LIST items have one static state plus a selected state (active item opens the detail panel); skill slots add the active slot's offset red parallelogram as their selected state; no loading or empty states exist (static content, built at compile time).
- Ambient audio states: `ready` (track present — the default with the committed derivative — awaiting first gesture), `playing`, `muted` (persisted), `no-track` (derivative absent from build — disabled button labeled "Sound: Off"), and `error` (derivative present but failed to load/decode — disabled button labeled "Sound: Error", `data-audio-state="error"`, observably distinct from `no-track`). State changes fade volume linearly over 400ms (200ms under reduced motion); storage failure keeps an in-memory state.
- Error state: the 404 page reuses the visual identity with a single action (back to `/`).
- External link behavior: open in a new tab with `rel="noopener noreferrer"`.

## Motion

Motion is ambient and identity-driven, following the ui-motion contract (sub-300ms UI, `transform`/`opacity` only, reduced-motion fallback). Frequency tier: the background is seen on every visit, but it is ambient atmosphere, not interaction, and a portfolio is visited rarely compared to an app — delight budget applies to first impressions.

| Effect | Token / values | Rationale |
|---|---|---|
| Glow breathing (CSS, zero JS) | ~8s cycle, strong `ease-in-out` (cubic-bezier(0.77, 0, 0.175, 1)), opacity 0.75 -> 1, optional scale 1 -> 1.02 | Ambient constant motion; `transform`/`opacity` only; no layout paint |
| Canvas caustic/bubbles/particles | rAF game loop: caustic gradient fill, `linear` per-particle/bubble motion, drift 0.2-0.5 px/frame at 60fps, capped count and DPR | Constant motion is linear; the loop pauses on hidden tabs |
| View transitions (menu <-> views) | Per-view overlay moments (blue panel, stripe, or clip-path sweep) at 300ms default, up to 400ms total as a documented exception, strong `ease-out` (cubic-bezier(0.23, 1, 0.32, 1)) | The reference's 450-600ms overlays violate the contract; capped at 400ms |
| Menu item entrance | Stagger 25ms between items, `translateY(8px) -> 0` + opacity, 300ms `ease-out` | Group entrance stagger; no `scale(0)` entries |
| Active indicator state | 150ms color transition only; the accent layer and highlight bar toggle with state, no entrance motion | Persistent indicator follows keyboard; instant affordance, no distraction |
| Ambient audio fades | 400ms linear volume fade default; 200ms under reduced motion | Audible transitions inside the 200-450ms spec band |
| Card / link hover | 150-200ms, `ease`, color shift to accent | Hover/color change uses `ease`; gated to fine pointers |
| Button press | `scale(0.97)`, transition 160ms `ease-out` | Press feedback, 100-160ms band |
| Reduced motion | Canvas paints one static frame and never starts the loop; glow holds; entrances and view transitions become opacity-only <= 200ms; audio never starts automatically | Fewer and gentler, not zero |

Motion runs on `motion` 13.0.0's vanilla API in scripts (or CSS animations for the glow); no React runtime is used for motion unless the game menu requires an island. Never animate layout properties; never use keyframes for rapidly repeated UI triggers (transitions only).

**Route transition vs in-view selection**: cross-page motion uses named View Transition groups (`panel`, `menu` via `transition:name`) — outgoing dissolves/recedes toward its bottom edge, incoming enters from the top edge, both 300ms `cubic-bezier(0.23,1,0.32,1)`, incoming groups staggered 40ms (max 3 → ≤400ms). In-view selection is distinct and same-page: the list cursor move (ArrowUp/Down) is keyboard-initiated and does **not** animate; the detail panel open/close is a 200ms opacity-only interruptible CSS `transition`. Under reduced motion both collapse to opacity-only ≤200ms with no travel.

## UI Libraries & Usage Boundaries

- Tailwind CSS 4.3.3 (via `@tailwindcss/vite`): the only styling system; tokens map to the Tailwind theme.
- `motion` 13.0.0: vanilla API in scripts for menu/view motion and canvas orchestration; React API not used by default.
- `@astrojs/react`: reserved exclusively for the game menu if it demands a React island; no other React usage.
- Astro native View Transitions (`<ClientRouter/>`): the only page-transition mechanism; no router library.
- `@fontsource/anton` and `@fontsource/bebas-neue`: the only fonts; self-hosted.
- No icon libraries, no animation libraries beyond `motion`, no image/video assets for the background, no CSS framework beyond Tailwind.
