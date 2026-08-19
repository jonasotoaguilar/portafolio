# Exploration: Reference-Driven View Redesign

**Change**: `reference-driven-view-redesign` | **Date**: 2026-08-13 | **Author**: sdd-explore | **Store**: OpenSpec (+ Engram mirror)

## Sources (all read in full or extracted)

PRD.md, DESIGN.md, ARCHITECTURE.md, `openspec/config.yaml`, the four named main specs (persona-navigation, portfolio-page, living-background, ambient-audio) plus site-transitions and resume-content, archived `persona-ui-ux-remediation` artifacts (incl. its exploration.md format precedent), ADR-0001/0002/0003 (ADR-0004 summarized in ARCHITECTURE), all `src/` sources (BaseLayout, Background, FigureLayer, GameMenu, GameViewShell, ViewHeader, GameList, GameListItem, DetailPanel, ControlCluster, KeyHints, AudioControl, all six pages, content.config.ts, site.config.yaml, skills.yaml, resume.yaml, global.css, view.ts, shell.ts, entrances.ts, living-background.ts, particles.ts, keys.ts, audio/state.ts, content/schemas.ts, content/projects.ts, seo/titles.ts), all e2e specs (keyboard, views, transitions-evidence, budget, reduced-motion) and unit tests inventory, Engram observations #6186 (keyboard focus defect) and #6187 (audio BYO verdict), and the six reference JPGs in `docs/assets/example/` (dimensions confirmed: home 1280x720, skills 1280x720, about 740x414, projects 739x415, resume 640x480, contact 596x335; content extracted from the orchestrator-provided direction — this model cannot view images).

## Current State

The site is the archived game-shell product: `/` renders `GameMenu.astro` (five Anton links, 55vw centered/center-right column, per-item diagonal offsets/skews, persistent `data-active`+`aria-current` indicator), each of the five views is a static route (`GameViewShell` + `view.ts`), PROJECTS/RESUME/SKILLS use LIST/detail (client-side per-view selection, `#slug` deep links on projects), CONTACT/ABOUT are simple stacked sections. Background = four fixed layers: CSS glow, CSS scanlines, Canvas 2D particles (`living-background.ts` + `particles.ts`, `transition:persist`), and an original inline-SVG `FigureLayer` per route. Control cluster fixed bottom-right, `transition:persist`. Cross-page motion is a single root-level overlay (300ms, 400ms envelope, opacity-only <=200ms reduced) in `global.css`. Audio: BYO `/audio/background.mp3`, HEAD probe -> no-track/ready, gesture unlock, localStorage mute, `<audio preload="none">`. All contracts: zero-JS content in flow, no-scroll as enhancement, <100KB gz JS per route, one h1 + one main, 44px targets, transform+opacity-only motion, scoped keyboard handlers, dark-only palette.

**Reference deltas vs. current implementation** (from the six JPGs + user direction): the target views are white/light-panel compositions over an oceanic deep-blue animated base — the current views are dark panels only. Home gains a left white contrast field, a partially cropped vertical `PORTFOLIO` word, and a stat card; About becomes a large centered diagonal white panel (profile stats) plus a tall diagonal portrait/name composition right; Projects moves the list to a left diagonal inset menu with the detail in a right diagonal panel; Skills anchors a straight vertical category list left with a selected vertical skill list right; Contact is a simple left social-links menu with character/abstract art energy right; Resume is a single all-information editorial view (NO tabs/buttons, EXCLUDES Projects and Skills, distributes education/experience/languages/contact across upper-left panel, text, list, lower-left panel).

## Confirmed Defects (Engram #6186, verified in source)

1. **view.ts focus/active divergence**: `select(result.activeIndex, false)` on arrows (line 55) moves `data-active`/`aria-pressed` without focus; `Enter` opens the CURSOR item's panel (`select(Math.max(activeIndex,0), true)`), not the focused one. All list buttons are tabbable (no roving tabindex), so Tab creates a third cursor.
2. **Initial view focus ambiguity**: `setupView()` never focuses the active item (focus stays on body; contrast shell.ts:96 `items[0]?.focus()`).
3. **shell.ts Tab->arrow desync**: Tab moves DOM focus without syncing `activeIndex`/`data-active`/`aria-current` (only the focus listener in view.ts syncs; shell has none); Tab to Skills then ArrowDown teleports the active indicator to Resume. Enter is guarded by `document.activeElement === active` (line 54) and is silently dead when divergent.
4. **Test gap**: no e2e presses arrows on list views; shell tests always `enterMenu()` (focus first item => cursor aligned); Escape tests on /skills only exercise the aligned path; `menu-keys.test.ts` covers pure reducers only. Regression tests needed: arrows keep focused==active; Enter opens the FOCUSED item's panel; view-entry focus == active item; shell Tab-then-arrow coherence.

## Audio State (Engram #6187 + source)

`/audio/background.mp3` is intentionally NOT bundled (only `public/audio/README.txt`); probe 404 -> terminal `no-track` (disabled "Sound: Off" button) — expected BYO behavior, with one cosmetic console 404 per fresh load. The reducer (`src/lib/audio/state.ts`) collapses BOTH the expected absent-file state AND real playback failures (`audio-error` event -> no-track) into the same terminal state. The change must distinguish expected no-track from actual audio failures in docs and, optionally, in state (e.g., a distinct `error` status) so failures are observable instead of masquerading as "no track".

## Affected Areas

| Area | Impact | Why |
|---|---|---|
| `src/scripts/view.ts` | Fix | Unify cursors: arrows move focus+active, Enter activates focused item, initial focus on active item (roving tabindex) |
| `src/scripts/shell.ts` | Fix | Sync active indicator on Tab/focus; keep Enter guard meaningful |
| `src/scripts/living-background.ts` + `src/lib/canvas/particles.ts` | Extend | Procedural ocean waves + keep particles; static frame under reduced motion; capped DPR/draw cost; pause on hidden tab |
| `src/pages/index.astro` + `GameMenu.astro` + `global.css` | Rework | Home composition: left white contrast field, cropped vertical PORTFOLIO word (watermark), stat card; menu stays central/right |
| `src/pages/about.astro` | Rework | Center diagonal white stats panel + tall right diagonal portrait/name composition (original vector, not a photo) |
| `src/pages/projects.astro` | Rework | Left diagonal inset menu + right diagonal detail panel (same visual grammar) |
| `src/pages/skills.astro` | Rework | Left straight category list + right selected vertical skill list |
| `src/pages/contact.astro` | Rework | Left simple social-links menu; spacious right character/abstract-art energy |
| `src/pages/resume.astro` | Rework | Single editorial view: upper-left panel, text, list, lower-left secondary panel; education/experience/languages/contact only |
| `src/lib/content/schemas.ts` + `src/content/site.config.yaml` | Extend | Static factual stats for home stat card + About panel (`stats` array, zod-validated); possible resume-schema pruning if Projects/Skills leave Resume |
| `src/components/game/GameList.astro`, `GameListItem.astro`, `DetailPanel.astro`, `ViewHeader.astro` | Rework/adapt | New panel grammar (light/diagonal panels); Resume stops using LIST/detail components |
| `src/components/FigureLayer.astro` | Extend | Per-route compositions re-placed for new layouts (About tall right, Contact right, etc.); original geometry only |
| `src/styles/global.css` | Extend | Light-surface tokens, diagonal clip-path panel primitives, named view-transition groups, reduced-motion fallbacks |
| `src/scripts/entrances.ts` + `src/lib/motion/entrances.ts` | Extend | Choreographed entrance sequencing (spatial edges), interruptible, transform+opacity-only, within 400ms envelope |
| New `src/scripts/section-nav.ts` | New | Direct section navigation shortcut (route-aware, conflict-safe) |
| `src/scripts/ambient-audio.ts` + `src/lib/audio/state.ts` | Minor | Distinguish expected no-track from real audio failures (docs + optional `error` status) |
| `src/pages/404.astro` | Adapt | Keep identity; fits new composition if trivially |
| Tests: `keyboard.spec.ts`, `views.spec.ts`, `transitions-evidence.spec.ts`, `reduced-motion.spec.ts`, `budget.spec.ts`, `menu-keys.test.ts`, `canvas.test.ts`, `content.test.ts`, `pages.test.ts` | Extend | Regression tests for the focus defects (#6186 list), new compositions, waves static frame, choreographed transitions, section nav, stats schema |
| Specs: `portfolio-page`, `persona-navigation`, `site-transitions`, `living-background`, `ambient-audio`, `resume-content`, `portfolio-content` | MODIFY/ADD | See Proposed Capability Changes |
| `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, `docs/` | Later phases | Light-surface tokens, icon policy, motion intent, audio no-track/error semantics (design-ui/spec/design/doc phases, NOT exploration) |

## Approaches

1. **CSS-geometry + named view-transitions, progressive enhancement (recommended)** — light panels/white fields as new DESIGN.md tokens + Tailwind/CSS clip-path primitives; per-element `transition:name` + `::view-transition-group(name)` keyframes for choreographed route motion; canvas extended with procedural wave paths (no assets); section-nav as a small vanilla script; stat data in site config. Zero new dependencies, zero media assets, keeps every existing contract (zero-JS flow, no-scroll enhancement, <100KB JS budget, 400ms motion envelope, scoped keys, reduced-motion opacity-only).
   - Pros: smallest durable surface; reuses motion 13 + existing script lifecycle (astro:page-load/before-swap teardown pattern); named groups degrade to plain fades/full-page loads when unsupported; content stays build-time static; fully testable with existing e2e patterns; legal-research-aligned (original SVG/CSS/procedural canvas; optional MIT icons, CC0 assets with recorded provenance only).
   - Cons: clip-path diagonal panels need careful mobile fallbacks (content clipping); named view-transition CSS is the most novel piece and needs the most test attention; CSS grows (not budget-gated, but review weight).
   - Effort: Medium overall; slices A–H below.

2. **Island/JS-driven composition (React island or heavy motion JS)** — panels and transitions orchestrated by a hydrated component (e.g., per-view React island or extensive motion JS state machines).
   - Pros: more programmatic control over sequencing.
   - Cons: violates DESIGN.md ("React reserved exclusively for the game menu"), astro-framework guidance (static first, question every `client:`), the zero-JS contract (content would need duplicated static fallback), the <100KB budget risk, and adds a runtime the architecture explicitly rejects (ADR-0001/0003). Rejected.

3. **Full light-theme inversion (P5-style white screens)** — restyle every route white-dominant.
   - Pros: visually closest to the reference screenshots' white dominance.
   - Cons: contradicts the user direction (ocean/deep-blue/cyan/light-blue/white palette with the dark base retained and white as *contrast cuts*), breaks the fixed dark identity contract, and would force a wholesale token/contrast rework for zero product gain. Rejected.

## Recommendation

Approach 1, delivered as a feature-branch chain (review budget 400 lines; forecast: High risk, chained PRs recommended). Slices in dependency order, each with its tests and docs:

- **A. Keyboard coherence fixes** (view.ts cursor unification + roving tabindex, initial focus, shell.ts Tab->arrow sync) + the exact #6186 regression tests. Smallest, risk-reducing, independent — first.
- **B. Oceanic canvas extension** (procedural waves + existing particles, static frame under reduced motion, draw-cost caps) + canvas/reduced-motion tests.
- **C. Home composition** (`stats` in site config schema, stat card, left white field, cropped vertical PORTFOLIO watermark, menu preserved central/right) + page/schema tests.
- **D. View grammar primitives + About/Contact** (light/diagonal panel primitives, About stats panel + original vector portrait composition, Contact left menu + right art energy).
- **E. Projects/Skills two-pane compositions** (left diagonal/straight menus, right detail/skill lists, same grammar).
- **F. Resume editorial view** (single composition; education/experience/languages/contact distribution; resume-content + portfolio-page spec modifications).
- **G. Choreographed route transitions** (named groups, entrance sequencing, interruptibility, reduced-motion fallback) + transitions-evidence/reduced-motion tests.
- **H. Section navigation shortcut** (route-aware ring About->Resume->Projects->Skills->Contact, modifier-combo keys, focus landing, hash handling, conflict-safety tests).
- **I. Audio distinction + documentation** (expected no-track vs error semantics; DESIGN.md/PRD/ARCHITECTURE sync; asset provenance register for any added external asset).

## Key Decisions and Ambiguities (for proposal/design)

- **Palette conflict (decide in design)**: current DESIGN.md is dark-only ("no light theme" is a PRD non-goal); the direction requires white/light contrast panels. Recommendation: keep the dark navy base and treat white as a *cut/surface* family (new tokens `surface-light`, `text-on-light`, etc.), NOT a theme toggle — PRD non-goal stays intact.
- **Resume scope conflict**: resume-content spec requires Resume to render projects and skills; the direction excludes them from Resume. Recommendation: Resume renders education/experience/languages/contact; Projects/Skills live in their own views; prune `resume.projects`/`resume.skills` from the schema if unused (per hard rule: remove obsolete paths). Delta MODIFIED requirements for resume-content, portfolio-page (LIST/detail no longer applies to Resume), persona-navigation (Resume loses list keys).
- **Home/About stats**: dynamic GitHub followers/visits would need build-time network access (forbidden by ARCHITECTURE "no build-time network dependency") or an unauthenticated client fetch (rate-limited, unreliable). Recommendation: static factual stats (e.g., 6+ years experience, 4 projects, 2 languages) added to `site.config.yaml` under a strict zod `stats` array.
- **Section-nav keys**: must not collide with list arrows/Enter/Escape or the shell menu keys. Recommendation: `Ctrl+Alt+ArrowRight/Left` (ring: About->Resume->Projects->Skills->Contact, wrap); from the shell the shortcut should be inert (menu keys already own arrows); drops `#slug` hash on cross-view jumps; lands focus on the destination view's active entry point; works under full-page-load fallback (plain links).
- **Audio**: expected no-track (probe 404, cosmetic console noise) must be documented as the product state; real failures (track present but undecodable) currently collapse into the same state — recommendation: keep collapse for UI simplicity but surface a distinct `data-audio-state="error"` (or console warning) so failures are observable; ADR-0004 stays.
- **Icons**: DESIGN.md currently says "no icon libraries"; the legal research permits MIT/ISC icon sets (Lucide/Heroicons/Tabler) and CC0 Simple Icons (trademark caveat). If icons enter Contact/socials, that is a DESIGN.md change — design-ui decision.
- **Portrait**: About's tall portrait must be original vector geometry (existing faceted bust restyled/tall) or an image-generation asset only after an approved brief; no photos above the fold (LCP contract). Do NOT download anything.
- **Image input limitation**: this model cannot view the six JPGs; composition details rest on the orchestrator-extracted direction + confirmed dimensions. A vision-capable pass in the design phase should confirm panel geometry against the local references before apply.

## Risks

- **View Transitions choreography**: named groups must exist in both documents of a swap; unsupported browsers degrade to full-page loads (fine); the 400ms envelope must include any stagger; reduced motion must collapse to opacity-only <=200ms. High test attention in transitions-evidence.spec.ts.
- **Clip-path panels on mobile**: diagonal cuts can clip text or create contrast issues on <768px; stacked panel scroll regions and 44px targets must survive (existing patterns).
- **White-surface contrast**: `text-on-light` must meet AA; accent-on-white combos must be re-checked; focus-visible on light panels.
- **Keyboard fixes change tab semantics** (roving tabindex): must not regress "Tab confined while shell active", focus-restoration, or views.spec.ts:278-290 (direct-focus Enter path still passes — focused item becomes active on focus).
- **Interruptibility**: motion JS animations must stop on `astro:before-swap` (existing teardown pattern); rapid navigation cancels CSS transitions natively.
- **Budget**: canvas waves + section-nav add ~2-4KB gz total; budget.spec.ts asserts <100KB per route — low risk but must hold.
- **Spec churn**: 6+ main specs get deltas; archive step warns on destructive deltas (Resume LIST/detail removal is one).
- **Copyright**: no Persona screenshots/art/soundtrack ship; only original geometry, optional CC0/MIT/ISC assets with recorded provenance; unknown-license packs unusable.

## Proposed Capability Changes

- `portfolio-page`: MODIFY (Home composition: stat card + white field + cropped watermark; Resume no longer LIST/detail; per-view composition requirements).
- `persona-navigation`: MODIFY (unified focus/active cursor, initial focus, shell Tab sync) + ADD (direct section navigation shortcut).
- `site-transitions`: MODIFY (choreographed per-element transitions within the 400ms envelope; interruptibility; reduced-motion fallback unchanged).
- `living-background`: MODIFY (oceanic waves + particles; static frame under reduced motion preserved).
- `ambient-audio`: MODIFY (expected no-track vs real failure distinction, documented).
- `resume-content`: MODIFY (Resume renders education/experience/languages/contact; projects/skills scope decision).
- `portfolio-content`: ADD/MODIFY (static `stats` in site config schema).

## Ready for Proposal

**Yes** — direction is explicit, defects are precisely located with root causes and test recipes (#6186), audio verdict is settled (#6187), legal boundary is researched, and the implementation approach fits the existing stack with no new dependencies. The proposal must: (1) lock the light-surface-on-dark-base palette decision, (2) lock the Resume scope change and the static-stats decision, (3) carry the keyboard-fix regression tests, (4) keep every existing contract (zero-JS, no-scroll gate, 100KB budget, 400ms motion envelope, scoped keys, reduced motion), (5) record the asset provenance boundary (original geometry/CC0/MIT only, nothing downloaded), and (6) confirm the section-nav key binding and the portrait approach with Jona.
