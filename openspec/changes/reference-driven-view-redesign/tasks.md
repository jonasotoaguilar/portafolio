# Tasks: Reference-Driven View Redesign

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~3,600–3,900 total; every slice ≤400 |
| 400-line budget risk | High (sum) — Low/Medium per slice |
| Chained PRs recommended | Yes |
| Suggested split | 15 chained PRs (A, B1, B2, B3, C1, C2, D–I1a, I1b, I2) |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

Feature Branch Chain: tracker `ref/view-redesign` (draft, no-merge); PR #1 base = tracker; PR #n base = PR #n−1 branch (retarget/rebase until child diff is clean). Commits = work units; tests/docs with code. No parallel writers — one apply lane per unit.

| Unit | Goal | PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|----|----------------------|-----------------|-------------------|
| A | Keyboard cursor coherence (#6186) — ✅ | PR 1 | `pnpm test:e2e keyboard.spec.ts` | dev server; Tab/arrows/Enter on `/`+`/projects` | Revert `view.ts`, `shell.ts`, `keyboard.spec.ts` |
| B1 | Register + fs-only gate — ✅ | PR 2 | `pnpm test:unit provenance-gate.test.ts` | `pnpm run gate:provenance`; dist scan | Remove `PROVENANCE.yaml`, `verify-provenance.mjs`, test, CI step |
| B2 | Optimizer + 60 derivatives — ✅ | PR 3 | `pnpm test:unit provenance-pipeline.test.ts` | `node scripts/optimize-assets.mjs` → 60 files, byte-deterministic | Revert optimizer, `.gitignore` entry; rm `dist-assets/` |
| B3 | Rename correction `assets/icon`→`assets/sprites` (one-way, no alias/dup) | PR 4 | `pnpm test:unit provenance-gate.test.ts && pnpm run gate:provenance` | sha256 before/after move; `git ls-files assets/icon` empty; dist scan | Re-add `assets/icon`; revert register/scripts/tests |
| C1 | Pure waves/bubbles/particles modules + unit tests (remediation) | PR 5 | `pnpm vitest run tests/unit/canvas.test.ts` | N/A — pure seeded modules; visual integration owned by C2 | Delete `waves.ts`/`bubbles.ts` + test additions (particles pre-existing) |
| C2 | Orchestration + static frame + `global.css` pattern utility + E2E (remediation) | PR 6 | `pnpm exec playwright test reduced-motion.spec.ts views.spec.ts` | dev server; reduced-motion emulation; hidden-tab pause; pixel probe | Revert `living-background.ts`, `global.css`, 2 specs |
| D | SpriteAccent/PersonaLayer/DecorativeType + light tokens | PR 7 | `pnpm test:unit layout.test.ts && pnpm test:e2e views.spec.ts` | dev server 3 viewports; axe; no h-scroll; network shows derivatives only | Remove 3 components; revert BaseLayout/global.css |
| E | Home + About + stats schema | PR 8 | `pnpm test:unit content.test.ts && pnpm test:e2e views.spec.ts` | dev server; `/`,`/about`; JS-off reading order | Revert `index.astro`, `about.astro`, stats schema/config |
| F | Projects + Skills two-pane | PR 9 | `pnpm test:e2e views.spec.ts keyboard.spec.ts` | dev server; `/projects#serviceflow`; mobile stacked scroll | Revert `projects.astro`, `skills.astro`, pane grammar |
| G | Contact + Resume editorial + schema prune | PR 10 | `pnpm test:unit resume.test.ts && pnpm test:e2e views.spec.ts` | dev server; `/resume`,`/contact`; no tabs | Revert `resume.astro`, `contact.astro`, prune in schemas/resume.yaml |
| H1 | Choreographed route transitions | PR 11 | `pnpm test:e2e transitions-evidence.spec.ts reduced-motion.spec.ts` | dev server; 2-route nav; rapid nav; reduced motion | Revert VT group CSS + `transition:name` attrs |
| H2 | Ctrl+Alt+Arrow section ring | PR 12 | `pnpm test:unit section-ring.test.ts && pnpm test:e2e keyboard.spec.ts` | dev server; ring cycles; focus after swap | Remove `section-nav.ts`, `section-ring.ts`, tests |
| I1a | Audio pipeline: register entry + `optimize-audio.mjs` + committed derivative + gate allow-list + policy | PR 13 | `pnpm test:unit provenance-pipeline.test.ts && pnpm run gate:provenance` | `node scripts/optimize-audio.mjs` → derivative + sha256; dist scan (derivative only, no raw) | Remove script/derivative/register entry; revert gate allow-list + README |
| I1b | Audio runtime: distinct error vs no-track, track-present default | PR 14 | `pnpm test:unit audio-state.test.ts && pnpm test:e2e ambient-audio.spec.ts` | dev server with/without derivative; gesture probe; console.warn | Revert `state.ts`, `ambient-audio.ts`, `AudioControl.astro`, tests |
| I2 | ADR-0005/0006 update + DESIGN/ARCHITECTURE sync + final regression | PR 15 | full chain: `pnpm test:unit && pnpm test:e2e && pnpm build && pnpm gate:provenance && pnpm lint && pnpm exec astro check` | `pnpm preview`; axe; JS-off; budget parse; dist scan | Revert doc/ADR edits + spec extensions |

### Dependency Graph

`A → B1 → B2 → B3 → C1 → C2 → D → E → F → G → H1 → H2 → I1a → I1b → I2`. Declared cross-deps: `B3→B2` (register consumed by optimizer), `C2→C1` (orchestration imports modules), `D→B2/B3` (derivatives + sprite naming), `D→C2` (pattern utility), `F→A`, `H2→A`, `H2→H1`, `I1b→I1a` (ready-path E2E needs committed derivative), `I2→all`.

### Parallelism

None at apply — feature-branch-chain bases each PR on the previous branch; one `sdd-apply` lane per unit, validate before launching the next.

## Completed vs Pending Mapping

| Tasks | Status |
|-------|--------|
| 1.1–1.5 (A) | ✅ complete — evidence in apply-progress §Unit A |
| 2.1, 2.3, 2.4, 2.5a, 2.6a (B1) | ✅ complete — 385-line boundary, gate OK, evidence §Unit B1 LANDING |
| 2.2, 2.5b, 2.6b, 2.7 (B2) | ✅ complete — 60 derivatives, determinism 61/61, evidence §Unit B2 LANDING |
| 2.8–2.12 (B3) | ✅ complete — one-way `assets/icon`→`assets/sprites` rename correction; RED 6→1→0, gate OK 25/25, 13/13 focused, determinism 61/61, evidence §Unit B3 LANDING |
| 3.1–3.3 (C1) | ✅ complete — split remediation; 15/15 focused, 117/117 full unit, 292-line boundary ≤ 400; evidence §Unit C1 LANDING |
| 3.4–3.6 (C2) | ✅ complete — split remediation validated; 281-line boundary, 9/9 reduced-motion, 3/3 pattern, 87/87 full E2E; evidence §Unit C2 LANDING |
| 4.1–11.3 (D–I2) | ⏳ pending |

Unit B (original oversized) and pre-split Unit C remain HISTORICAL in apply-progress.md — attributed history, not tasks.

## Apply Notes

- Skills per unit: `chained-pr`, `work-unit-commits` always; `playwright`, `frontend-ui-engineering`, `ui-motion` when E2E/UI/motion; `image-generation` for asset wiring.
- Integration layer unavailable (sdd-init): pure logic → Vitest unit; DOM/behavior → Playwright E2E. Strict TDD: RED → GREEN → REFACTOR → Verify.
- Sprite rename (B3) is the ONLY correction to landed B1/B2 — completed work stays as-is; B3 removes the duplicate `assets/sprites` copy path and makes `assets/icon` absent (target state).
- C1/C2 are split remediation: existing implementation is NOT reimplemented and NO `size:exception` is requested; each slice is validated and committed independently (532 total > 400; C1 ≈292, C2 ≈240).
- Route/sprite/word matrices locked (design); threat matrix N/A for fs-only gate; music ffmpeg spawn uses args array, pinned flags, no user input.

## Phase 1 (Unit A): Keyboard cursor coherence — COMPLETE

- [x] 1.1 RED — `tests/e2e/keyboard.spec.ts`: Tab→ArrowDown coherence; Tab→Enter; arrows move focus+active; initial focus; Escape hierarchy; inactive screens inert; Tab trapped
- [x] 1.2 GREEN — `src/scripts/view.ts`: roving tabindex, `select()` sync, arrows move focus==active, Enter opens; `setupView` focuses active
- [x] 1.3 GREEN — `src/scripts/shell.ts`: per-item focus listener → activeIndex; Enter guard via `document.activeElement`
- [x] 1.4 REFACTOR — `src/lib/menu/keys.ts` untouched; teardown on `astro:before-swap`
- [x] 1.5 Verify — `pnpm test:e2e keyboard.spec.ts` green

## Phase 2 (Unit B1): Provenance register + fs-only gate — COMPLETE

- [x] 2.1 RED — `tests/unit/provenance-gate.test.ts`: unregistered fails; owner fields exact; external CC0/MIT only; mockup/asset_sheet/example rejected from dist scan
- [x] 2.3 GREEN — `assets/PROVENANCE.yaml` register: 25 entries (11 persona + 14 icon sources), owner fields, locked widths for 12 selected
- [x] 2.4 GREEN — `scripts/verify-provenance.mjs` fs-only gate + `gate:provenance` npm script
- [x] 2.5a GREEN — ci.yml gate step; vitest coverage exclude `scripts/**`
- [x] 2.6a Verify — `pnpm test:unit provenance-gate.test.ts && pnpm run gate:provenance`

## Phase 2 (Unit B2): Optimizer + responsive derivatives — COMPLETE

- [x] 2.2 RED — `tests/unit/provenance-pipeline.test.ts`: byte-identity, regenerability, alpha, dimensions (RED: module-not-found; GREEN 2/2)
- [x] 2.5b GREEN — stage originals byte-identical; `.gitignore` `dist-assets/`
- [x] 2.7 GREEN — `scripts/optimize-assets.mjs`: AVIF+WebP locked widths, `withoutEnlargement`, alpha preserved, deterministic manifest, width-contract validation
- [x] 2.6b Verify — 60 derivatives (3,509,605 B), per-route ≤~150KB, regenerability, dist scan clean

## Phase 2 (Unit B3): Rename correction `assets/icon`→`assets/sprites` — COMPLETE

- [x] 2.8 RED — extend `tests/unit/provenance-gate.test.ts`: role `sprite-accent` accepted / `icon-accent` rejected; register paths resolve under `assets/sprites`; `assets/icon` presence fails gate
- [x] 2.9 GREEN — one-way move `assets/icon/*.png` (14) → `assets/sprites/`; delete duplicate copies; no alias/symlink/fallback; record sha256 before/after (byte-identical move proof)
- [x] 2.10 GREEN — `assets/PROVENANCE.yaml`: paths/comments → `assets/sprites`; `usage-role: icon-accent` → `sprite-accent` (14 entries)
- [x] 2.11 GREEN — `scripts/verify-provenance.mjs`: `ROLES` → `sprite-accent`; dir loops `["persona","sprites"]`; add `assets/icon` absence check; `scripts/optimize-assets.mjs`: `WIDTHS_BY_ROLE` key `sprite: "96,160"`
- [x] 2.12 Verify — `pnpm run gate:provenance`; `git ls-files assets/icon` empty; dist scan clean; commit work unit

## Phase 3 (Unit C1): Pure ocean modules + unit tests — COMPLETE (split remediation)

- [x] 3.1 Re-run RED-validated `tests/unit/canvas.test.ts` (15/15): waves/bubbles seeded determinism, band cap 3, bubble cap 24, DPR cap, step immutability/respawn — record result
- [x] 3.2 Confirm `src/lib/canvas/waves.ts` + `bubbles.ts` are pure (no DOM/orchestration imports); `particles.ts` pre-existing tracked, unchanged
- [x] 3.3 Verify C1 boundary ≈292 authored ≤400; record focused test + rollback; commit work unit (no reimplementation, no size exception)

## Phase 3 (Unit C2): Orchestration + static frame + pattern utility + E2E — COMPLETE (split remediation)

- [x] 3.4 Re-run RED-validated E2E: `reduced-motion.spec.ts` (static frame incl. waves, no loop, hidden-tab pause, no media) — record result
- [x] 3.5 `src/styles/global.css`: rename `.icon-pattern`→`.sprite-pattern` + `data-icon-pattern`→`data-sprite-pattern` (opacity 8–15%, ≤160/96px, pointer-events-none); update `views.spec.ts` probes (3 sites)
- [x] 3.6 Verify C2 boundary ≈240 ≤400; dev-server pixel probe + reduced-motion emulation; commit work unit

## Phase 4 (Unit D): Composition primitives + light tokens — PENDING

- [ ] 4.1 RED — `tests/e2e/views.spec.ts`: per-route word, `aria-hidden`, `pointer-events-none`, `z-index:-1`, no focusable children, no h/v scroll; AA on light surfaces
- [ ] 4.2 RED — `tests/unit/layout.test.ts`: `type-words.ts` route→word map locked
- [ ] 4.3 GREEN — `src/lib/content/type-words.ts` + `DecorativeTypeLayer.astro` (one `<span>`, Anton, uppercase, nowrap, per-route rules; no named VT group) — contract unchanged
- [ ] 4.4 GREEN — `PersonaLayer.astro` + **`SpriteAccent.astro`** (canonical): `astro:assets` imports of approved responsive derivatives (12 selected sources; never originals — proves optimizer output is consumed, not dead tooling); one instance/route, size/opacity bounds, `transition:name="figure"`, `aria-hidden`, `pointer-events-none`, `z-index:-1`
- [ ] 4.5 GREEN — delete `Watermark.astro`; mount 3 components in `BaseLayout.astro`
- [ ] 4.6 GREEN — `global.css`: `surface-light`/`text-on-light`/`accent-on-light` tokens, clip-path primitives, decorative-type placement/crop
- [ ] 4.7 Verify — `layout.test.ts` + `views.spec.ts` at 3 viewports; network shows derivatives only (budget spec 11.1)

## Phase 5 (Unit E): Home + About — PENDING

- [ ] 5.1 RED — `content.test.ts`: stats schema validates; fallback (6+ years/4 projects/2 languages); malformed fails build
- [ ] 5.2 RED — `views.spec.ts`: Home white field + cropped vertical PORTFOLIO + stat card; About diagonal stats + tall persona_2; one principal per route
- [ ] 5.3 GREEN — `schemas.ts` stats array; `site.config.yaml` stats; fallback in `content.config.ts`
- [ ] 5.4 GREEN — `index.astro` (field 35vw, stat card, PersonaLayer persona_1, menu 55vw); `about.astro` (stats panel, persona_2, name overlay)
- [ ] 5.5 Verify — unit + E2E; JS-off reading order both routes

## Phase 6 (Unit F): Projects + Skills — PENDING

- [ ] 6.1 RED — `views.spec.ts`: two-pane compositions; <768px stack with internal panel scroll; 44px targets; clip-path never clips text/controls
- [ ] 6.2 RED — `keyboard.spec.ts`: open panel moves focus in; Escape returns to list item
- [ ] 6.3 GREEN — `projects.astro` (left diagonal menu + right panel, persona_6, `/projects#serviceflow` preselect); `skills.astro` (left categories + right list, persona_9)
- [ ] 6.4 GREEN — `GameList.astro`/`GameListItem.astro`/`DetailPanel.astro`: light/diagonal panel grammar, `min-h-11`, mobile overflow rule
- [ ] 6.5 Verify — `pnpm test:e2e views.spec.ts keyboard.spec.ts`

## Phase 7 (Unit G): Contact + Resume — PENDING

- [ ] 7.1 RED — `resume.test.ts`: `projects`/`skills` presence fails strict schema; missing required field fails build
- [ ] 7.2 RED — `views.spec.ts`: Resume editorial (no tabs/selectors, no projects/skills/publication); Contact left menu + right persona_11 art
- [ ] 7.3 GREEN — `schemas.ts` prune projects/skills; `resume.yaml` delete blocks; `resume.astro` editorial (education/experience/languages/contact) — no compatibility layer
- [ ] 7.4 GREEN — `contact.astro`: left social menu + right art, persona_11 + `asset_04` sprite accent
- [ ] 7.5 Verify — `pnpm test:unit resume.test.ts content.test.ts && pnpm test:e2e views.spec.ts`

## Phase 8 (Unit H1): Choreographed route transitions — PENDING

- [ ] 8.1 RED — `transitions-evidence.spec.ts`: `figure`/`panel`/`menu` recede out / enter from edges; ≤400ms (300+2×40 stagger); rapid nav interrupts; unsupported → full-page fallback
- [ ] 8.2 RED — `reduced-motion.spec.ts`: opacity-only, ≤200ms, no travel/stagger
- [ ] 8.3 GREEN — `global.css`: VT keyframes for 3 named groups + kept `root`; `transition:name` on PersonaLayer figure, list/detail panes, menu
- [ ] 8.4 GREEN — DecorativeTypeLayer rides root crossfade only; no 4th named group
- [ ] 8.5 Verify — `pnpm test:e2e transitions-evidence.spec.ts reduced-motion.spec.ts`

## Phase 9 (Unit H2): Section-nav ring — PENDING

- [ ] 9.1 RED — `tests/unit/section-ring.test.ts`: ring ABOUT→RESUME→PROJECTS→SKILLS→CONTACT wraps both ends; home inert; modifier-qualified only
- [ ] 9.2 RED — `keyboard.spec.ts`: Ctrl+Alt+Arrow navigates fragment-free; focus lands on destination active entry; plain arrows/Enter/Escape untouched
- [ ] 9.3 GREEN — `src/lib/menu/section-ring.ts` (pure) + `src/scripts/section-nav.ts` (modifier check, no `#fragment`, destination initial-focus; unbind on `astro:before-swap`)
- [ ] 9.4 Verify — `pnpm test:unit section-ring.test.ts && pnpm test:e2e keyboard.spec.ts`

## Phase 10 (Unit I1a): Audio pipeline — PENDING

- [ ] 10.1 RED — extend `tests/unit/provenance-pipeline.test.ts`: licensed-music entry required fields; gate allows only registered derivative in dist, rejects raw/unregistered audio; optimizer determinism + pinned flags; missing source/ffmpeg fails cleanly (spawn args array, no shell)
- [ ] 10.2 GREEN — `assets/PROVENANCE.yaml` licensed-music entry: title "Acid Jazz Groove", creator alex-morgan, source-url `https://pixabay.com/music/cafe-acid-jazz-groove-517096/`, Pixabay Content License + license-url, acquisition-date, source `assets/music/background.mp3` (raw, unmodified), derivative `public/audio/background.mp3`, commercial/modification permitted, attribution optional, `standalone-redistribution=false`, content-id-registered, ai-modified/generated, identity-confirmation manual
- [ ] 10.3 GREEN — `scripts/optimize-audio.mjs`: system ffmpeg pinned `-c:a libmp3lame -b:a 128k -ar 48000 -joint_stereo 1`, sha256 mapping; commit derivative `public/audio/background.mp3` (~2.86MB); raw source retained, never copied to dist
- [ ] 10.4 GREEN — `scripts/verify-provenance.mjs` audio allow-list (registered derivative hash only); replace `public/audio/README.txt` (BYO placeholder) with provenance/maintenance doc; no standalone-download affordance
- [ ] 10.5 Verify — `node scripts/optimize-audio.mjs` regenerability + sha; gate; dist scan (derivative only); commit work unit

## Phase 10 (Unit I1b): Audio runtime — PENDING

- [ ] 10.6 RED — `tests/unit/audio-state.test.ts`: `probe-ok`→`ready` (track-present default); `probe-fail`→`no-track`; `audio-error`→`error` (distinct terminal); gesture only from ready; no-track/error silent
- [ ] 10.7 RED — `tests/e2e/ambient-audio.spec.ts`: missing derivative → silent no-track, disabled control, no error; present-but-failing → `data-audio-state="error"`, "Sound: Error", `console.warn`; keyboard-operable `aria-pressed` + status text; zero bytes pre-gesture; no download link; persists across nav
- [ ] 10.8 GREEN — `src/lib/audio/state.ts`: add `"error"` to `AudioStatus`; `audio-error`→`error`; `src/scripts/ambient-audio.ts` error path + warn; `src/components/game/AudioControl.astro` error label/state
- [ ] 10.9 Verify — unit + E2E with/without derivative; commit work unit

## Phase 11 (Unit I2): Docs/ADR sync + final regression — PENDING

- [ ] 11.1 RED — `tests/e2e/budget.spec.ts` extend: per-route gz JS <100KB; network shows derivatives, never originals/raw; no stats network at build/runtime; sprite/audio dist exclusions
- [ ] 11.2 GREEN — UPDATE `docs/adr/0005-owner-created-assets-provenance.md` + `docs/adr/0006-bundled-licensed-ambient-track.md` (action items/status; ADR-0004 superseded marker) — do NOT create a new ADR-0005; validate exact source URL `https://pixabay.com/music/cafe-acid-jazz-groove-517096/`; sync DESIGN.md/ARCHITECTURE.md editorial (sprite-accent naming, resume editorial, audio states, decorative-type replaces watermark)
- [ ] 11.3 Verify — dist scan: no mockup/asset_sheet/example, no `assets/icon`, no raw music source, derivative audio only; axe + JS-off flow; full chain `pnpm test:unit && pnpm test:e2e && pnpm build && pnpm gate:provenance && pnpm lint && pnpm exec astro check`
