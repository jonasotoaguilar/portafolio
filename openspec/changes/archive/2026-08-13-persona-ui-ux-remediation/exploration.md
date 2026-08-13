# Exploration: Persona UI/UX Remediation

**Change**: `persona-ui-ux-remediation` | **Date**: 2026-08-12 | **Author**: sdd-explore | **Store**: OpenSpec

## Sources (all read in full)

PRD.md, DESIGN.md, ARCHITECTURE.md, ADR-0001/0002/0003, `openspec/config.yaml`, archived `persona-game-menu-navigation` + `persona-portfolio-mvp` artifacts, all `src/` sources touched by the shell (BaseLayout, Background, GameMenu, GameViewShell, ViewHeader, KeyHints, shell.ts, view.ts, keys.ts, living-background.ts, particles.ts, global.css, index.astro), all tests (unit + e2e: keyboard, views, budget, reduced-motion, menu-keys), reference repos `/home/jona/repos/persona3-website` (P3Menu.jsx) and `/home/jona/repos/persona5-website-theme` (P5Menu.jsx, App.jsx BGM player, public/audio/README.txt), and objective pixel analysis of the five reference images (this model has no image input; color/luminance maps + prior repo context stand in for direct viewing).

## Current State

The site is the archived game-shell product: `/` renders `GameMenu.astro` (five Anton links, left-aligned column, uniform `-skew-x-6`, uniform `clamp(2.75rem,9vw,8.125rem)` size), keyboard nav via `shell.ts` (ArrowUp/Down wrap + Enter, Tab trap, `reduceMenuKey` in `src/lib/menu/keys.ts`), views via `GameViewShell` + `view.ts` (LIST/detail with a real persistent `data-active` indicator — note: the VIEWS already implement the persistent active pattern). Background = three fixed layers: CSS glow, CSS scanlines, Canvas 2D particles (`Background.astro`, `transition:persist`). `KeyHints.astro` renders in-flow at the bottom of the menu column (left-aligned) and in `ViewHeader.astro`.

**Exact focus/navigation defect (verified in source)**: the DESIGN.md contract documents the active shell item as "`accent-400` over a diagonal clip-path accent layer" with `menu-item-active` tokens, but `GameMenu.astro` implements ONLY `focus-visible:outline-2 outline-accent-400` + `hover:text-accent-400`. `shell.ts` moves DOM focus on ArrowUp/Down, but no `data-active`/`aria-current` is ever set on the shell items — the keyboard-active item is visually indistinguishable from inactive items except for the thin 2px outline. The persistent colorful game-menu indicator (highlight bar / accent layer / color pop that follows keyboard navigation) is missing on the shell. Secondary deltas vs. the reference composition: menu is not horizontally centered; no per-item diagonal stagger/offsets; key hints sit bottom-left in-flow instead of bottom-right; no decorative figures/artifacts; no audio.

**Reference image evidence (pixel maps, cannot view directly)**: all five JPGs are white-dominant with blue/cyan accents. `home.jpg` (1280x720) shows dark navy corners/edges, a bright white vertical band at center (a centered menu panel), and cyan/blue glow on the right — consistent with the user's stated target: centered menu + diagonal buttons + atmospheric figures on an animated background. `projects.jpg` is white with P5 cyan (#82ffff); `skills.jpg` white with gray/pinkish tones; `about.jpg`/`contact.jpg` white with strong blues (#0d28b5). These are P5-style light menu screens, NOT the current dark-navy implementation.

**Reference composition (P3Menu.jsx, the "home" target)**: overlay is `flex align-items:center; justify-content:center` (centered); per-item diagonal data (`offsetX` 0–20px, `offsetY` 0–8px, per-item `skewX`/`skewY`, per-item font size 56–80px); entrance `translateX(36px)→0` with 80ms/item stagger; active item gets a red label overlay, a red clip-path triangle behind the label ("pop" spring), a white highlight bar (scaleX), a pink glow, and non-active items dim by distance (0.5–1.0 opacity); key hints are `position:absolute; bottom:24px; right:28px` (bottom-RIGHT). The P5 theme adds the audio capability: `<audio loop preload="none" src="/audio/background.mp3">`, toggle button + volume slider, localStorage persistence, 450ms fades, autoplay unlock on first `pointerdown`/`keydown`.

**Music licensing (assessed explicitly)**: the Persona 3/5 soundtracks and SFX are © ATLUS/SEGA — bundling any ripped track (including `persona5-website-theme/public/audio/background.mp3` 7.4MB and `select.mp3`) is copyright infringement and is NOT recommended. Notably, the P5 reference repo itself ships `public/audio/README.txt` with the BYO-licensed pattern: "Place your licensed background track in this folder as `background.mp3` … Use audio you own or have permission to use. Avoid uploading copyrighted music without rights." That exact pattern is the safe design: the site ships with NO bundled track; a user-provided licensed file at `public/audio/background.mp3` is picked up automatically. Browser autoplay constraints: Chrome/Safari/Firefox require gesture activation for audible playback — the established pattern is start-silent, unlock on first `pointerdown`/`keydown` (once), fade to the persisted volume, and `preload="none"` so the track bytes never load until play.

**Visual requirements vs. copyrighted assets (distinction)**:
- SAFE to adopt (composition/UX patterns, not assets): centered menu, diagonal/staggered button arrangement, persistent colorful active indicator, bottom-right control guide, mute control, ambient BGM concept, angular/geometric silhouette artifacts.
- MUST NOT be copied: character/portrait art (`char1-3.png`, `hero.png`, `joker*.png`, `P5S_Protagonist_*.png`, `card.png`, `newsign.png` — Atlus rips in both reference repos), game fonts (`Persona5main.ttf` — current `@fontsource/anton`/`bebas-neue` are OFL-licensed and stay), game audio (`background.mp3`, `select.mp3`), videos (`main1.mp4`, `circletransition.mp4`). Decorative figures/artifacts must be ORIGINAL vector work (inline SVG/CSS geometry inspired by the aesthetic) — also the only option compatible with ADR-0002 (no heavy media assets) and the <100KB JS budget.

## Affected Areas

| Area | Impact | Why |
|---|---|---|
| `src/components/game/GameMenu.astro` | Rework | Centered composition, per-item diagonal config (offsets/skew/size), persistent active indicator markup, hints repositioned |
| `src/scripts/shell.ts` | Extend | Set `data-active` + `aria-current` on keyboard move (defect fix); no-scroll gate preserved; audio unlock hook lives here |
| `src/lib/menu/keys.ts` | Minor/extend | `reduceMenuKey` unchanged (pure); may add audio-state reducer for testability |
| `src/components/game/KeyHints.astro` | Adapt | Fixed bottom-right positioning; keep `aria-hidden` decoration + coarse-pointer hiding |
| `src/components/game/ViewHeader.astro` | Adapt | Hints position consistency on views |
| `src/components/Background.astro` + `global.css` | Extend | New decorative vector layer (figures/artifacts) between canvas and content; `aria-hidden`, `pointer-events-none`, static under reduced motion |
| New `src/components/game/` audio island/script | New | Mute toggle + `<audio preload="none">` + gesture unlock + localStorage persistence + fade; disabled/"no track" state when `public/audio/background.mp3` is absent |
| `public/audio/README.txt` | New | BYO licensed-track instruction (mirrors the P5 repo's own README) |
| `tests/e2e/keyboard.spec.ts`, `views.spec.ts` | Extend | Assert `aria-current`/`data-active` on the shell; mute toggle reachable + keyboard operable; figures hidden from AT |
| `tests/e2e/budget.spec.ts` | Extend | Audio script + menu changes must stay <100KB gz per route; figures are inline SVG (no JS) |
| `tests/e2e/reduced-motion.spec.ts` | Extend | Figures static, no new motion under `prefers-reduced-motion` |
| `tests/unit/*` (menu-keys, new audio) | Extend | Audio state reducer unit tests; existing key tests unchanged |
| `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, docs | Later phases | Per user intent: product direction corrections land in propose/spec/design/doc phases, NOT exploration |

## Approaches

1. **Menu composition: centered + diagonal/staggered (CSS/config-driven)** — per-item config array in `GameMenu.astro` (label/href/offset/skew/size, mirroring P3Menu's ITEMS but static and real links), per-item inline `style` transforms + Tailwind classes; entrance stagger re-timed to the existing 400ms envelope (25ms band per `menuOverlayOptions`, NOT the reference's 80ms×5).
   - Pros: zero JS for layout; links stay real (SEO/a11y); no new deps; fully testable.
   - Cons: per-item literals in markup (acceptable — five items); needs mobile care (offsets collapse, 44px targets, no collisions).
   - Effort: Low–Medium

2. **Persistent colorful focus/active indicator (defect fix)** — `shell.ts` toggles `data-active` + `aria-current="page"` on the keyboard-active item; CSS renders the DESIGN.md-documented indicator: `accent-400` text + diagonal clip-path accent layer + optional highlight bar; `:focus-visible` outline kept as secondary; mouse hover follows the same active state (per DESIGN.md).
   - Pros: implements the documented but missing contract; minimal, deterministic, testable; matches reference affordance (persistent indicator that follows keyboard nav).
   - Cons: none material; watch that indicator + outline don't double-visually-conflict.
   - Effort: Low

3. **Decorative figures/artifacts: original inline SVG/CSS layer** — hand-authored vector layer (angular crest/card/silhouette geometry) fixed between canvas and content; `aria-hidden`, `pointer-events-none`; static frames (ambient opacity only); renders without JS.
   - Pros: zero copyright risk, zero bytes/JS, ADR-0002-compliant, reduced-motion friendly.
   - Cons: design effort for original artwork; must not read as a copied character (design-ui owns the figure direction in the design phase).
   - Effort: Medium

4. **Control guide bottom-right** — `KeyHints` becomes fixed bottom-right (reference-aligned: `bottom:24px; right:28px`); group the mute control in the same corner cluster (or bottom-left per P5 — one placement decision for design-ui).
   - Pros: matches reference and user intent; small change.
   - Cons: must not overlap menu items on short viewports (mobile fallback hides hints — existing coarse-pointer rule).
   - Effort: Low

5. **Audio: BYO licensed track + mute control (no bundled music)** — `<audio loop preload="none">` loading `/audio/background.mp3` when present; mute toggle (`aria-pressed`, visible label); localStorage persistence (enabled + volume); gesture unlock on first `pointerdown`/`keydown`; 200–450ms fades; `public/audio/README.txt` documents the licensing requirement; with no file present the control renders a disabled/"no track" state (site stays silent by default). Optional add-on: a Web Audio API-synthesized original ambient pad as a zero-risk default placeholder — decide in design phase.
   - Pros: fully license-safe; the user's exact requirement (mute control + BGM) with a safe placeholder path; pattern already proven by the P5 reference; no copyrighted Persona 3 soundtrack bundling.
   - Cons: silent by default until Jona drops his licensed track; audio adds a small JS surface to the budget; autoplay needs the gesture-unlock dance.
   - Effort: Medium

## Recommendation

A combined remediation, ordered by leverage: (2) the focus/active-indicator defect fix FIRST (it is the documented-but-missing contract and the user's headline defect), then (1) centered diagonal/staggered menu, (4) bottom-right hints, (3) original vector figures layer, and (5) the BYO audio capability with mute control — silent default, licensed track only, gesture-unlocked. All five fit the existing stack (no new deps: Tailwind 4, motion, Astro islands), stay within the 400ms motion envelope and <100KB JS budget, and keep the zero-JS/no-scroll/a11y contracts. Design-ui owns figure direction, corner-cluster placement, and indicator styling in the design phase; PRD/DESIGN/ARCHITECTURE updates happen in later phases per user intent.

## Risks

- **Copyright**: bundling Persona 3/5 OST, SFX, character art, or fonts from the reference repos = infringement. Mitigation: silent default + BYO licensed track (README-gated), original vector figures only; nothing copied from either reference repo.
- **Verification gap**: this model cannot view the reference images; composition requirements rest on Jona's explicit intent + pixel maps + reference repos. Mitigation: design phase (or a vision-capable run) should confirm figures/artifacts against `home.jpg` before apply.
- **Motion contract**: reference entrance stagger (80ms/item) exceeds the 400ms envelope; keep 25ms-band stagger (existing `menuOverlayOptions` contract).
- **Budget**: audio player + shell changes must stay <100KB gz per route; `preload="none"` keeps track bytes off first load.
- **Autoplay policy**: audible autoplay is blocked without gesture; the unlock pattern must never start sound uninvited (also an a11y win: music starts only after first interaction).
- **A11y/regression**: `data-active`/`aria-current` must not break the "no hijack when closed" pattern or keyboard specs; figures stay `aria-hidden`; mute toggle keyboard-operable with visible label; reduced-motion and zero-JS gates unaffected (figures are static HTML/CSS).

## Ready for Proposal

**Yes** — all product deltas are explicit from user intent; the defect is precisely located (`GameMenu.astro` + `shell.ts` lack the documented active indicator); the audio design has a safe licensing boundary and a proven reference pattern. The proposal must: (1) lock the five remediation areas with the no-copyright-assets constraint, (2) defer PRD/DESIGN/ARCHITECTURE/doc updates to the spec/design phases, (3) keep the shell keyboard/no-scroll/budget contracts intact, and (4) carry the "silent default, licensed track only" audio decision.
