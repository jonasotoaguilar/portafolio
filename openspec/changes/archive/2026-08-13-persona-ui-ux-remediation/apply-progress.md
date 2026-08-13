# Apply Progress — persona-ui-ux-remediation (cumulative: Unit 1 + Unit 2 + Unit 3 + Unit 4 + Unit 5A + Unit 5B + Unit 5B Correction Batch 1 + Unit 6 + Unit 7)

- **Unit 1** (Phase 1, tasks 1.1–1.5, active/focus indicator): ✅ DONE — committed at `f616ea0`, evidence `rev-1`.
- **Unit 2** (Phase 2, tasks 2.1–2.4, diagonal staggered menu): ✅ DONE — committed at `d38d833`, evidence `sha256:ff5066ed49abc4ca34cd88efa9e52bc3d88e0d5f7af1521859328e2a8972cc0b`.
- **Unit 3** (Phase 3, tasks 3.1–3.6, bottom-right ControlCluster): ✅ DONE — uncommitted, evidence `sha256:cba0e53c27c34e33eef6cf3f38874ab589a9f5b6338ff459adcc0673123f7c8d`.
- **Unit 4** (Phase 4, tasks 4.1–4.4, FigureLayer): ✅ DONE — this batch, uncommitted, evidence `sha256:d37317f653cf422ce2b638d5b2882c82f156a816f3b25ff58421ac160e513666`.
- **Unit 5A** (Phase 5, tasks 5.1–5.3, audio reducer + control markup): ✅ DONE — this batch, uncommitted, evidence `sha256:8f3630eb8a2716a7af91f7fec8637ea188fe2cb3d6960c984aa40bd945079145`.
- **Unit 5B** (Phase 5, tasks 5.4–5.7, audio wiring + e2e + README): ✅ DONE — this batch, uncommitted, evidence `sha256:98d3f4621431681c6f169c36d482562b3777d54bbc44d7adc37b0d8d8589c0bf`. Amended by **Correction Batch 1** (storage-failure e2e coverage + assertFade band tightened to the spec's 450ms; see the section at the end of this file).
- **Unit 6** (Phase 6, tasks 6.1–6.3, regression verification): ✅ DONE — this batch, uncommitted, evidence `sha256:ad88e1dee7583980988fd6cf34eae87114b1e4a5abb428b2665b3615c89e9db9` (see the section at the end of this file).

---

# Unit 1 Batch (history — committed at f616ea0)

## Batch Metadata

| Field | Value |
|-------|-------|
| Change | `persona-ui-ux-remediation` |
| Work unit | `unit-1-active-focus-indicator` |
| Scope | Phase 1 tasks 1.1–1.5 only (active/focus indicator) |
| Branch | `feat/persona-ui-ux-remediation` (integration, feature-branch-chain) |
| Attempt token | `sha256:50a6585f67774e66de457ce190206afbe972a2c2b54966888ba1fc21e896f266` |
| Mode | Strict TDD (openspec `rules.apply.tdd: true`; runner `pnpm run test:unit` + Playwright e2e) |
| Delivery | `auto-chain` / `feature-branch-chain` — Unit 1 boundary only; no commit/push/PR (orchestrator owns settlement) |
| Evidence revision | `rev-1` (fresh batch — no prior apply-progress exists; verified via Engram search) |

## Settlement Evidence

- **Evidence revision**: `rev-1` — first evidence batch for this attempt; no previous batch to merge (Engram `mem_search` for `sdd/persona-ui-ux-remediation/apply-progress` returned none; no `apply-progress.md` on disk).
- **Diagnosis**: fresh implementation batch. No prior failed evidence, no remediation lineage. All RED failures were first-cycle failures of newly written tests failing for the intended reason (attributes absent), then GREEN.
- **Harness disposition**: dev server reused (http://localhost:4321, pid 280526, HTTP 200 — Playwright `reuseExistingServer`). No servers started/stopped by this batch beyond Playwright's own transient attempt (it exited early once due to the already-running server; retry reused it).
- **Cleanup**: no temp files created inside the repo. Probe scripts ran in sandbox; one evidence screenshot at `/tmp/opencode/unit1-active-indicator.png` (outside repo). Playwright `test-results/` dir: verify — it is gitignored; nothing new committed.
- **Process evidence**: Safety-net baseline before edits: 84 unit + 43 e2e passing. Strict RED→GREEN cycles below. Full e2e after: 48 passing (43 baseline + 5 new). Unit: 84 passing. `astro check`: 0 errors / 0 warnings. Biome on changed files: 3 warnings, identical to HEAD baseline (pre-existing `.astro` frontmatter false positives) — no lint regression.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.1 | `tests/e2e/keyboard.spec.ts` | E2E | ✅ 43 e2e + 84 unit | ✅ Written (5 tests; 4 failed for intended reason, 1 passed as regression guard) | ✅ 9/9 after 1.2 | ✅ 5 cases: init, ArrowDown move, ArrowUp wrap, outline invariant, hover mirror | ➖ None needed |
| 1.2 | `src/scripts/shell.ts` (via keyboard.spec.ts) | E2E | ✅ 9/9 keyboard | ✅ (covered by 1.1 RED) | ✅ 9/9 | ✅ move + wrap + teardown-clear cases | ➖ None needed |
| 1.3 | `src/components/game/GameMenu.astro` (via keyboard.spec.ts) | E2E | ✅ 9/9 | ✅ (hover test guards class removal) | ✅ 9/9 | ✅ hover color asserted | ✅ Removed redundant Tailwind `hover:text-accent-400` (treatment single-sourced in `global.css`; hover test stayed green) |
| 1.4 | `src/styles/global.css` (via keyboard.spec.ts) | E2E | ✅ 9/9 | ✅ (treatment missing → hover/color assertions would fail) | ✅ 9/9 | ✅ settled computed styles probed: color `rgb(93,117,255)` = accent-400; panel `color(srgb ... / 0.22)`; bar 2px `rgb(56,225,255)` = accent-cyan | ➖ None needed |
| 1.5 | — (verification) | E2E | — | — | ✅ `pnpm run test:e2e` 48/48 | — | — |

## Work Unit Evidence

| Evidence | Required value |
|----------|----------------|
| Focused test command and exact result | `pnpm run test:e2e keyboard.spec.ts` → 9 passed (4 baseline + 5 new), 0 failed; `pnpm run test:unit` → 84 passed |
| Runtime harness command/scenario and exact result | Dev server http://localhost:4321; Chromium probe: focus first item → ArrowDown → Resume carries `data-active` + `aria-current="page"`, About cleared, outline `solid 2px` visible, no console/page errors, item boxes non-overlapping (11px gaps) |
| Rollback boundary | Revert `src/scripts/shell.ts` (syncActive), `src/styles/global.css` active rules + `--color-accent-cyan` token, `src/components/game/GameMenu.astro` class line, `tests/e2e/keyboard.spec.ts` additions; menu composition, links, keyboard, no-scroll semantics untouched |

## Test Summary

- **Total tests written**: 5 (all e2e, in `keyboard.spec.ts`)
- **Total tests passing**: 53 (48 e2e + 84 unit across suites; 9/9 in keyboard spec)
- **Layers used**: E2E (5 new + 4 existing in spec); Unit (84 existing, untouched)
- **Approval tests**: None — no behavior-preserving refactor of existing logic (only a class-attribute removal guarded by the hover test)
- **Pure functions created**: 0 (active-set is DOM attribute toggling; covered at the e2e layer per tasks.md)

## Changed Lines (authored)

| File | ± |
|------|---|
| `tests/e2e/keyboard.spec.ts` | +67 |
| `src/styles/global.css` | +40 |
| `src/scripts/shell.ts` | +17 |
| `openspec/changes/persona-ui-ux-remediation/tasks.md` | 5/5 (checkbox marks 1.1–1.5) |
| `src/components/game/GameMenu.astro` | 1/1 (removed redundant hover class) |
| `openspec/changes/persona-ui-ux-remediation/apply-progress.md` | new (~65) |

Total authored changed lines ≈ 196 — well under the 400-line unit budget.

## Deviations from Design

- None in behavior. Design AD2 implemented verbatim: `data-active` + `aria-current="page"` set by `shell.ts` only, accent-400 text, diagonal `clip-path` accent layer (accent-400 @ 22% via `color-mix`), 2px `accent-cyan` bar, `:hover` mirrors, 150ms color transition, `:focus-visible` outline untouched.
- Implementation notes (not deviations): added the missing `--color-accent-cyan` token to the Tailwind `@theme` block (listed in DESIGN.md palette but absent from `global.css`); the accent layer renders via `::before` (stacked behind the label with `z-index: -1`, safe because the skewed anchor creates its own stacking context) and the cyan bar via `::after`.

## Issues Found

- Playwright `webServer` exited early once because an `astro dev` instance was already running; retry reused it (transient, no code impact).
- Pre-existing Biome warnings on `.astro` frontmatter (unused-import/var false positives — template usage invisible to Biome); identical count at HEAD, untouched by this unit.

## Remaining Tasks

- Phase 2 (Unit 2, next): diagonal staggered menu — tasks 2.1–2.4 (NOT in this batch).
- Phases 3–7 untouched per boundary.

## Workload / PR Boundary

- Mode: chained PR slice (auto-chain, feature-branch-chain)
- Current work unit: `unit-1-active-focus-indicator` → PR 1 (targets `feat/persona-ui-ux-remediation` tracker branch)
- Boundary: Unit 1 start = current branch state; end = tasks 1.1–1.5 verified; Unit 2 (menu stagger/reposition) explicitly excluded
- Estimated review budget impact: ~196 authored changed lines (unit budget 400)

---

# Unit 2 Batch (this batch — diagonal staggered menu)

## Batch Metadata

| Field | Value |
|-------|-------|
| Change / Work unit / Scope | `persona-ui-ux-remediation` / `unit-2-diagonal-staggered-menu` / Phase 2 tasks 2.1–2.4 only |
| Branch / Mode / Delivery | `feat/persona-ui-ux-remediation` (feature-branch-chain); Strict TDD (openspec `rules.apply.tdd: true`); `auto-chain` — no commit/push/PR |
| Attempt token / Evidence revision | `sha256:ff5066ed49abc4ca34cd88efa9e52bc3d88e0d5f7af1521859328e2a8972cc0b` (prior batch `rev-1` merged below) |

## Settlement Evidence

- **Evidence revision**: second evidence batch; previous batch (`rev-1`, Unit 1) read from `apply-progress.md` on disk and preserved verbatim above (merged in Engram #6112 — updated, not duplicated).
- **Diagnosis**: fresh batch; no prior failed evidence, no remediation lineage. All RED failures intended (no 55vw column, identity matrices, 8px gap), then GREEN. **Harness**: dev server reused (localhost:4321, HTTP 200 — `reuseExistingServer`); no servers started/stopped, no temp files inside the repo (`test-results/` gitignored).
- **Process evidence**: baseline 84 unit + 9 keyboard e2e green; final full e2e 52 passing (43 baseline + 9 new), unit 84, `astro check` 0/0, Biome 3 warnings == HEAD baseline (pre-existing `.astro` false positives).

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 2.1 | `tests/e2e/keyboard.spec.ts` | E2E | ✅ 84 unit + 9 keyboard | ✅ Written (4 tests; all failed for intended reasons: no 55vw column, identity matrices, 8px gap) | ✅ 13/13 after 2.2–2.3 | ✅ 4 cases: desktop exact AD1 matrices, tablet half/−4°, coarse mobile 390, coarse 1024 (pointer media) | ✅ Biome clean-up: inlined browser-side matrix parse, guard+throw per repo convention |
| 2.2 | `src/components/game/GameMenu.astro` (via keyboard.spec.ts) | E2E | ✅ 13/13 | ✅ (covered by 2.1 RED) | ✅ 13/13 | ✅ per-item matrix + font-size cases | ✅ Removed `-skew-x-6` + `text-[clamp(...)]` from anchor (single-sourced in `.menu-item`) |
| 2.3 | `src/styles/global.css` (via keyboard.spec.ts) | E2E | ✅ 13/13 | ✅ (rules missing → matrices/gap fail) | ✅ 13/13 | ✅ 3 media branches probed: ≥1024 exact, 768–1023 half/−4°, <768px & coarse collapse | ✅ Added `line-height: 0.95` to `.menu-item` — fixed row-strut inflation (li 184px → 109px; budget scroll regression) |
| 2.4 | — (verification) | E2E | — | — | ✅ `pnpm run test:e2e` 52/52; `pnpm run test:unit` 84/84; `astro check` 0/0 | — | — |

## Work Unit Evidence

| Evidence | Required value |
|----------|----------------|
| Focused test command and exact result | `pnpm run test:e2e keyboard.spec.ts` → 13 passed (9 baseline + 4 new), 0 failed; `pnpm run test:unit` → 84 passed; full `pnpm run test:e2e` → 52 passed |
| Runtime harness command/scenario and exact result | Dev server http://localhost:4321; Chromium probe 1280×720: tx About −36 / Resume +24 / Projects −48 / Skills +36 / Contact −16 px (exact AD1), skew tan −0.105104 (−6°) and −0.140541 (−8°), PROJECTS font 134.4px vs 115.2px, nav 704px = 55vw straddling center, `scrollHeight == 720` (no page scroll). Probe 390×844 (isMobile+hasTouch): all row transforms `none`, uniform 44px font, anchor height 44px, row gaps exactly 12px, `matchMedia("(pointer: coarse)")` true |
| Rollback boundary | Revert `src/components/game/GameMenu.astro` (MENU_ITEMS vars + li `menu-item` + `items-center`), `src/styles/global.css` menu-composition block (`.menu-item` + media rules), `tests/e2e/keyboard.spec.ts` additions; active-indicator treatment, shell.ts, links, keyboard semantics untouched |

## Test Summary

- **Total tests written**: 4 (all e2e, in `keyboard.spec.ts`); **passing**: 52 e2e + 84 unit; 13/13 in keyboard spec. **Layers**: E2E (4 new + 9 existing); Unit (84 existing, untouched). **Approval tests**: None — additive CSS/config; budget/views/reduced-motion specs acted as regression guards. **Pure functions**: 0 (CSS var + media-query geometry)

## Changed Lines (authored)

| File | ± |
|------|---|
| `tests/e2e/keyboard.spec.ts` | +216 |
| `src/components/game/GameMenu.astro` | +47/−10 |
| `src/styles/global.css` | +40 |
| `tasks.md` + `apply-progress.md` (openspec change) | 4/4 marks + cumulative merge |

Total authored changed lines = 399 incl. artifacts (316 code/tests) — within the 400-line unit budget.

## Deviations from Design

- None in behavior. Design AD1 verbatim: 55vw column; per-item `--item-x`/`--item-skew`/`--item-size` inline vars consumed by one `.menu-item` rule; ≥1024px About −2.25rem/−6°, Resume +1.5rem/−6°, Projects −3rem/−8° (largest), Skills +2.25rem/−6°, Contact −1rem/−8°; 768–1023px half offsets at −4°; <768px/coarse collapse with uniform clamp, 12px gap, 44px targets.
- Implementation notes (not deviations): transform lives on the `<li>` row (class `menu-item`) so the JS entrance `y` animation on anchors never overrides the stagger; `--item-size` base = existing menu-label clamp `clamp(2.75rem, 9vw, 8.125rem)`, PROJECTS `clamp(3.25rem, 10.5vw, 9.5rem)` (AD1 "largest"); `line-height: 0.95` keeps row height = label height (body 1.6 would inflate rows).

## Issues Found

- In-batch budget regression: `.menu-item` font-size on the li inflated the row strut (1.6 × 115.2px = 184px/row) → shell exceeded viewport → fixed with `line-height: 0.95`; budget spec green again.
- One transient views.spec flake (SKILLS content) in one full-suite run — passed in isolation and in the final 52/52 run; unrelated to this unit. Biome: only the 3 pre-existing `.astro` false positives; design hook flagged `2.75rem` as off-ramp — false positive (existing `menu-label` clamp moved verbatim; AD1 requires per-item sizes).

## Remaining Tasks

- Phase 3 (Unit 3): ControlCluster — tasks 3.1–3.6 (NOT in this batch). Phases 4–7 untouched per boundary.

## Workload / PR Boundary

- Mode: chained PR slice (auto-chain, feature-branch-chain); work unit `unit-2-diagonal-staggered-menu` → PR 2 (targets `feat/persona-ui-ux-remediation` tracker branch)
- Boundary: start = f616ea0 (Unit 1 committed); end = tasks 2.1–2.4 verified; Unit 3 (ControlCluster) explicitly excluded; estimated review budget = 399 authored changed lines incl. artifacts (unit budget 400)

---

# Unit 3 Batch (this batch — bottom-right ControlCluster)

## Batch Metadata

| Field | Value |
|-------|-------|
| Change / Work unit / Scope | `persona-ui-ux-remediation` / `unit-3-bottom-right-control-cluster` / Phase 3 tasks 3.1–3.6 only |
| Branch / Mode / Delivery | `feat/persona-ui-ux-remediation` (feature-branch-chain); Strict TDD (openspec `rules.apply.tdd: true`); `auto-chain` — no commit/push/PR |
| Attempt token / Evidence revision | `sha256:cba0e53c27c34e33eef6cf3f38874ab589a9f5b6338ff459adcc0673123f7c8d` (prior batches `rev-1` + Unit 2 merged above) |

## Settlement Evidence

- **Evidence revision**: third evidence batch; Units 1–2 preserved verbatim above (merged in Engram #6112 — updated, not duplicated).
- **Diagnosis**: fresh batch; no prior failed evidence, no remediation lineage. All RED failures intended (no `[data-control-cluster]`, no "Sound: Off" button, hints visible), then GREEN.
- **Harness**: dev server was restarted mid-batch (old pid 280526 stopped, new pid 465289 started via `astro dev --background`) to reset a dev-toolbar exposure change (see Issues). `reuseExistingServer` reused it; no temp files inside the repo (`test-results/` gitignored; biome-HEAD comparison ran from `/tmp/opencode/biome-head`).
- **Process evidence**: baseline 84 unit + 21 views e2e green; final full e2e 57 passing (52 baseline + 5 new), unit 84, `astro check` 0 errors/0 warnings, `pnpm build` 7 pages clean, budget spec 4/4 vs rebuilt `dist/`, Biome 13 warnings on changed files vs 12 at HEAD — delta exactly the new ControlCluster import false positives (−1 KeyHints import removed, +2 ControlCluster imports, +1 BaseLayout ControlCluster import); no new warning class.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 3.1 | `tests/e2e/views.spec.ts` (cluster describe) | E2E | ✅ 21 views + 84 unit | ✅ Written (2 tests; failed: no cluster locator) | ✅ 2/2 after 3.3–3.5 | ✅ 2 cases: shell anchors (5 items) + all 5 views (h1 + back link) | ✅ Nested describes per context (test.use scope fix) |
| 3.2 | `tests/e2e/views.spec.ts` (cluster describe) | E2E | ✅ 21 views + 84 unit | ✅ Written (3 tests; failed: hints visible, no mute button) | ✅ 3/3 | ✅ 3 cases: coarse mobile 390×844, coarse desktop-width 1024×768, short 1280×500 (max-height path distinct from coarse) | ➖ None needed |
| 3.3 | `src/components/game/ControlCluster.astro` + `AudioControl.astro` (via views.spec.ts) | E2E | ✅ 26/26 | ✅ (cluster/mute assertions) | ✅ 26/26 | ✅ corner offsets + mute ≥44px across 4 contexts | ✅ One nested describe per `test.use` context |
| 3.4 | `KeyHints.astro`/`ViewHeader.astro`/`GameMenu.astro` (via views.spec.ts) | E2E | ✅ 26/26 | ✅ (trim is behavioral: hints only in cluster) | ✅ 26/26 | ✅ desktop (hints visible in cluster) vs coarse/short (hidden) | ➖ None needed |
| 3.5 | `BaseLayout.astro` + `src/styles/global.css` (via views.spec.ts) | E2E | ✅ 26/26 | ✅ (position/hide rules missing → corner + visibility fail) | ✅ 26/26 | ✅ `position: fixed` probe + exact right/bottom offsets + hints `display` per media branch | ✅ Combined `(max-height: 560px), (pointer: coarse)` into one rule |
| 3.6 | — (verification) | E2E | — | — | ✅ `pnpm run test:e2e` 57/57; unit 84/84; `astro check` 0/0; build clean; budget 4/4 | — | — |

## Work Unit Evidence

| Evidence | Required value |
|----------|----------------|
| Focused test command and exact result | `pnpm run test:e2e views.spec.ts -g "bottom-right control cluster"` → 5 passed, 0 failed; full `pnpm run test:e2e` → 57 passed (52 baseline + 5 new); `pnpm run test:unit` → 84 passed; `pnpm build` clean (7 pages) |
| Runtime harness command/scenario and exact result | Dev server localhost:4321 (restarted, pid 465289); Chromium probes: desktop 1280×720 shell + /about — cluster `position: fixed`, box 861..1252 × 616..696 (right edge 1252 = vw−28, bottom 696 = vh−24, exact AD4), hints `display: flex`, mute 44×119 at corner, `data-astro-transition-persist` present, zero console/page errors; coarse 390×844 — hints `none`, mute 44px box 243..362 × 776..820 (right 362 = 390−28, bottom 820 = 844−24); short 1280×500 — hints `none` (max-height path), mute 44px at 1133..1252 × 432..476 (bottom 476 = 500−24). No overlap: menu anchors end ≤648px right (zone starts 861) at 1280×720; view headers end ≤149px top (zone starts 616) |
| Rollback boundary | Revert `src/components/game/ControlCluster.astro`, `AudioControl.astro`, `BaseLayout.astro` wiring, `global.css` cluster block, KeyHints/ViewHeader/GameMenu trims, `tests/e2e/views.spec.ts` cluster describe + the two `main`-scoped button-count edits; menu composition, shell.ts, links, keyboard semantics untouched |

## Test Summary

- **Total tests written**: 5 (all e2e, in `views.spec.ts`); **passing**: 57 e2e + 84 unit; 26/26 in views spec. **Layers**: E2E (5 new + 21 existing in spec); Unit (84 existing, untouched). **Approval tests**: None — additive markup/CSS. **Pure functions**: 0 (CSS media-query geometry + inert markup).

## Changed Lines (authored)

| File | ± |
|------|---|
| `tests/e2e/views.spec.ts` | +147 (5 cluster tests + helpers + 2 main-scope edits) |
| `src/styles/global.css` | +21 |
| `src/components/game/ControlCluster.astro` | new (~17) |
| `src/components/game/AudioControl.astro` | new (~16) |
| `src/components/game/KeyHints.astro` | 5 ± (class hook, drop Tailwind coarse variant) |
| `src/components/game/ViewHeader.astro` | −3 (drop KeyHints) |
| `src/components/game/GameMenu.astro` | −2 (drop KeyHints) |
| `src/layouts/BaseLayout.astro` | +2 (import + render) |
| `tasks.md` + `apply-progress.md` (openspec change) | 6/6 marks + cumulative merge |

Total authored changed lines ≈ 310 incl. artifacts (213 code/tests) — within the 400-line unit budget.

## Deviations from Design

- None in behavior. Design AD4 verbatim: fixed bottom-right (bottom 1.5rem / right 1.75rem), column, `transition:persist` in BaseLayout, hints hidden on `(max-height: 560px)` and `(pointer: coarse)`, mute ≥44px (Tailwind `min-h-11 min-w-11`, matching repo convention; the e2e asserts the computed ≥44px box).
- Boundary respected: `AudioControl.astro` is an inert accessible placeholder only — a disabled `aria-pressed="false"` "Sound: Off" button matching design AD5's no-track state, with a comment documenting the Unit 5/6 boundary (state reducer, HEAD probe, gesture unlock, fades, persistence, `<audio>` element all deferred). No audio logic, no FigureLayer, no docs changes.
- Implementation notes (not deviations): hide rule combined into one `@media (max-height: 560px), (pointer: coarse)`; `key-hints` class added to the KeyHints footer as the hide-rule hook (Tailwind `pointer-coarse:hidden` variant removed — hide is single-sourced in global.css per task 3.5); cluster is a page-level `<footer>` rendered after `<slot />` in BaseLayout (covers shell, all views, and 404 consistently).

## Issues Found

1. **Playwright `test.use()` scope trap (fixed in-test)**: `test.use()` calls inside one `test.describe` merge across the whole block (later calls override per-property) — the desktop tests silently ran at the LAST test.use's viewport (1280×500) plus coarse options from earlier calls, failing corner assertions by 220px. Fixed by nesting one `test.use` + its tests in a dedicated nested `describe` per context (desktop 1280×720 / coarse mobile 390×844 / coarse desktop 1024×768 / short 1280×500). NOTE: Unit 2's keyboard.spec uses the same pattern — it passes only because both contexts there are coarse (same collapse behavior); worth reviewing in a later unit.
2. **Astro Dev Toolbar button exposure (environmental, fixed in-test)**: mid-session the dev toolbar began exposing its 4 shadow-DOM buttons (Menu/Inspect/Audit/Settings) to `getByRole("button")` on every page (stable across a dev-server restart; absent from production builds). Two pre-existing count-all-buttons tests (SKILLS =3, RESUME =5) then failed with 8/10 — the failure is toolbar-induced, not caused by this unit (without the cluster they would still fail with 7/9). Fixed minimally: scoped those two assertions to `page.locator("main").getByRole("button")` (content region — the toolbar lives outside `<main>`), preserving intent exactly. My new tests use named locators only, so they are toolbar-proof by construction.
3. Dev server restarted mid-batch (old pid 280526 → new pid 465289) — the harness continued on the new server; full suite re-run green on it.

## Remaining Tasks

- Phase 4 (Unit 4): FigureLayer — tasks 4.1–4.4 (NOT in this batch). Phases 5–7 untouched per boundary.

## Workload / PR Boundary

- Mode: chained PR slice (auto-chain, feature-branch-chain); work unit `unit-3-bottom-right-control-cluster` → PR 3 (targets `feat/persona-ui-ux-remediation` tracker branch)
- Boundary: start = d38d833 (Unit 2 committed); end = tasks 3.1–3.6 verified; Unit 4 (FigureLayer) explicitly excluded; estimated review budget ≈ 310 authored changed lines incl. artifacts (unit budget 400)

---

# Unit 4 Batch (this batch — original figure layer)

## Batch Metadata

| Field | Value |
|-------|-------|
| Change / Work unit / Scope | `persona-ui-ux-remediation` / `unit-4-original-figure-layer` / Phase 4 tasks 4.1–4.4 only |
| Branch / Mode / Delivery | `feat/persona-ui-ux-remediation` (feature-branch-chain); Strict TDD (openspec `rules.apply.tdd: true`); `auto-chain` — no commit/push/PR |
| Attempt token / Evidence revision | `sha256:d37317f653cf422ce2b638d5b2882c82f156a816f3b25ff58421ac160e513666` (prior batches rev-1 + Units 2–3 merged above; token acquired by parent — this batch did not acquire/settle) |

## Settlement Evidence

- **Evidence revision**: fourth evidence batch; Units 1–3 preserved verbatim above (disk `apply-progress.md` is the artifact of record; Engram #6112 mirrors the summary).
- **Diagnosis**: fresh batch; no prior failed evidence, no remediation lineage. All RED failures intended (`.figure-layer` locator absent on every route), then GREEN.
- **Harness**: dev server reused (http://localhost:4321, HTTP 200 — `reuseExistingServer`); no servers started/stopped, no temp files inside the repo (probe scripts + screenshots in `/tmp/opencode/u4`; `test-results/` gitignored; biome-HEAD compare reused `/tmp/opencode/biome-head` worktree).
- **Process evidence**: baseline 84 unit + 4/4 reduced-motion e2e green; final full e2e 60 passing (57 baseline + 3 new), unit 84, `astro check` 0/0, `pnpm build` 7 pages clean, budget spec 4/4 vs rebuilt `dist/` (6.2KB gz/route), Biome 11 warnings on changed files vs 7 at HEAD — same two pre-existing `.astro` frontmatter false-positive classes (`noUnusedImports`/`noUnusedVariables`; delta = new FigureLayer constants used via `set:html`, invisible to static analysis); no new warning class.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 4.1 | `tests/e2e/reduced-motion.spec.ts` (figure layer describe) | E2E | ✅ 84 unit + 4 reduced-motion | ✅ Written (3 tests; all failed: no `.figure-layer`) | ✅ 7/7 after 4.2–4.3 | ✅ 7 routes × 4 placement probes + static under reduce on shell AND /projects + DOM-order/z-index/pointer-events probe | ✅ Fixed inverted `compareDocumentPosition` bit in the RED test (PRECEDING, not FOLLOWING — test bug, implementation was correct) |
| 4.2 | `src/components/FigureLayer.astro` (via reduced-motion.spec.ts) | E2E | ✅ 7/7 | ✅ (covered by 4.1 RED) | ✅ 7/7 | ✅ geometry audit: 6 variant compositions, bust present where designed, all shapes non-degenerate, fills/opacities in the 15–45% contract, zero console errors | ✅ Added missing `fill="#38e1ff"` on slashes/bars/chips (audit caught default-black fills) |
| 4.3 | `BaseLayout.astro` + `global.css` (via reduced-motion.spec.ts) | E2E | ✅ 7/7 | ✅ (rules missing → placements fail) | ✅ 7/7 | ✅ exact per-route placement matrix (shell/404 right half 640×720, projects band 1280×288, skills 52%.. right, about 704×446 bottom-left, contact 1280×396 wash, resume 537×547 left-mid) + gated 400ms entrance verified static under reduce | ➖ None needed |
| 4.4 | — (verification) | E2E | — | — | ✅ full e2e 60/60; unit 84/84; `astro check` 0/0; build clean; budget 4/4 | — | — |

## Work Unit Evidence

| Evidence | Required value |
|----------|----------------|
| Focused test command and exact result | `pnpm run test:e2e reduced-motion.spec.ts` → 7 passed (4 baseline + 3 new), 0 failed; `pnpm run test:unit` → 84 passed; full `pnpm run test:e2e` → 60 passed (57 baseline + 3 new) |
| Runtime harness command/scenario and exact result | Dev server localhost:4321; geometry audit probe (Playwright): all 7 routes render their variant SVG with the designed groups (shell/404 bust+slashes+chevrons+bars+chips; projects band; skills bust+chevrons; about bust+slashes+chips; contact wash+bust+bars+chips; resume bust+chips+slashes+chevrons), 0 out-of-bounds / 0 zero-size shapes, bust present on all figure routes, artifact opacities within 15–45%, zero console/page errors on 6 routes (1 pre-existing 404 asset 404, reproduced with changes stashed); screenshots captured to /tmp/opencode/u4 (model cannot view images — geometry verified programmatically) |
| Rollback boundary | Revert `src/components/FigureLayer.astro` (new), `BaseLayout.astro` (import + render), `global.css` figure-layer block (base + entrance + 7 route placements), `tests/e2e/reduced-motion.spec.ts` figure-layer describe; menu composition, control cluster, shell.ts, links, keyboard semantics untouched |

## Test Summary

- **Total tests written**: 3 (all e2e, in `reduced-motion.spec.ts`); **passing**: 60 e2e + 84 unit; 7/7 in reduced-motion spec. **Layers**: E2E (3 new + 4 existing in spec); Unit (84 existing, untouched). **Approval tests**: None — additive markup/CSS. **Pure functions**: 0 (static authored SVG geometry + CSS media-query placements).

## Changed Lines (authored)

| File | ± |
|------|---|
| `tests/e2e/reduced-motion.spec.ts` | +105 (3 figure-layer tests + helpers) |
| `src/components/FigureLayer.astro` | new (155) |
| `src/styles/global.css` | +70 |
| `src/layouts/BaseLayout.astro` | +2 |
| `tasks.md` + `apply-progress.md` (openspec change) | 4/4 marks + cumulative merge |

Total authored changed lines ≈ 396 incl. artifacts (332 code/tests) — within the 400-line unit budget.

## Deviations from Design

- None in behavior. Design AD3 verbatim: one original inline-SVG composition per route, deep-blue faceted featureless bust with cyan rims, bars/chevrons/chips/slashes at 15–45% opacity, `aria-hidden`, `pointer-events-none`, z-index -1 (same layer as the canvas, painted after it in DOM order — between atmosphere and content), zero JS, gated 400ms entrance fade (no-preference + `html[data-game-ready]` only) and fully static under reduced motion. DESIGN.md route placements applied: shell/404 oversized right half, projects cyan top band, skills right figure framing the center, about bottom-left, contact bottom blue wash + left figure, resume left-mid.
- Implementation notes (not deviations): route branches render server-side in one component (the design's "one SVG per route"); shared bust/artifact geometry authored once as frontmatter constants and injected with `set:html`; container insets (50%/52%/40vh/55vw/62vh/55vh/42vw/12%) are the authored values satisfying the qualitative DESIGN.md placements, asserted exactly by the route-variant e2e.

## Issues Found

1. **Playwright `emulateMedia` + dev-server HMR race (environmental, transient)**: two consecutive reduced-motion runs failed test 1 ("canvas paints one static frame") with `Execution context was destroyed, most likely because of a navigation` — the astro dev server was mid-rebuild from the just-saved SVG fill edit, so the page reloaded inside the test's 250ms evaluate window. After the server settled (6s), the same spec passed 7/7 and the full suite 60/60. Not a code defect (test passed twice before the edit with identical implementation).
2. **Contact-resolution external-network flake (pre-existing, transient)**: `contact-resolution.spec.ts` itch.io probe failed once in the full suite; passes in isolation (both URLs 200). Unrelated to this unit (network-dependent test).
3. **Model cannot view screenshots** (no image input support): visual verification was replaced by a programmatic geometry audit (bboxes, fills, opacities, group presence per route) — screenshots kept at `/tmp/opencode/u4` for human review.

## Remaining Tasks

- Phase 5 (Unit 5): Ambient audio — tasks 5.1–5.7 (NOT in this batch). Phases 6–7 untouched per boundary.

## Workload / PR Boundary

- Mode: chained PR slice (auto-chain, feature-branch-chain); work unit `unit-4-original-figure-layer` → PR 4 (targets `feat/persona-ui-ux-remediation` tracker branch)
- Boundary: start = current branch state (Unit 3 verified but uncommitted; HEAD `e109d63`); end = tasks 4.1–4.4 verified; Unit 5 (audio) explicitly excluded; estimated review budget ≈ 396 authored changed lines incl. artifacts (unit budget 400)

---

# Unit 5A Batch (this batch — audio reducer + control markup)

## Batch Metadata

| Field | Value |
|-------|-------|
| Change / Work unit / Scope | `persona-ui-ux-remediation` / `unit-5a-audio-reducer-control` / Phase 5 tasks 5.1–5.3 only (reducer + markup; wiring/probe/fades/e2e are 5.4–5.7, next slice) |
| Branch / Mode / Delivery | `feat/persona-ui-ux-remediation` (feature-branch-chain); Strict TDD (openspec `rules.apply.tdd: true`); `auto-chain` — no commit/push/PR |
| Attempt token / Evidence revision | `sha256:8f3630eb8a2716a7af91f7fec8637ea188fe2cb3d6960c984aa40bd945079145` (prior batches rev-1 + Units 2–4 merged above; token provided by parent — this batch did not acquire/settle) |

## Settlement Evidence

- **Evidence revision**: fifth evidence batch; Units 1–4 preserved verbatim above (disk `apply-progress.md` is the artifact of record; Engram #6112 mirrors the summary).
- **Diagnosis**: fresh batch; no prior failed evidence, no remediation lineage. RED = module missing (test file could not import `src/lib/audio/state.ts`), then GREEN.
- **Harness**: dev server reused (http://localhost:4321, HTTP 200 — `reuseExistingServer`); no servers started/stopped, no temp files inside the repo (probe script in `/tmp/opencode/u5a`; `test-results/` gitignored).
- **Process evidence**: baseline 84 unit + 5 cluster e2e green; final full e2e 60 passing (60 baseline + 0 new — markup verified via probe + regression), unit 98 (84 baseline + 14 new), `astro check` 0 errors/0 warnings, Biome 0 warnings on all three changed files.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 5.1 | `tests/unit/audio-state.test.ts` | Unit | ✅ 84 unit | ✅ Written (14 tests; file failed to import — module absent, intended RED) | ✅ 14/14 after 5.2 | ✅ full transition matrix: initial safe, probe-ok/fail, gesture gate (muted vs unmuted), toggle both directions, audio-error terminal from 3 states + no resurrection, restore flag + gesture gating | ✅ Aligned one expectation to the design contract (status terminal; mute preference survives) |
| 5.2 | `src/lib/audio/state.ts` | Unit | ✅ 84 + 14 RED | ✅ (covered by 5.1 RED) | ✅ 14/14 | ✅ idempotent probe-ok, probe-fail from both states, toggle no-op before unlock, terminal no-resurrection pair | ✅ Biome organizeImports fix |
| 5.3 | `src/components/game/AudioControl.astro` | Markup | ✅ 5/5 cluster e2e + 14 unit | ✅ (audio element + hooks absent) | ✅ probe-verified | ✅ `<audio loop preload="none">` + button hooks + accessible name via runtime probe; 4 cluster viewports re-asserted (44px target, corner, hints) | ✅ N/A — markup only |

## Work Unit Evidence

| Evidence | Required value |
|----------|----------------|
| Focused test command and exact result | `pnpm run test:unit audio-state` → 14 passed (RED: 1 failed | 84 passed before impl); full `pnpm run test:unit` → 98 passed; `pnpm exec playwright test views.spec.ts -g "bottom-right control cluster"` → 5 passed; full `pnpm run test:e2e` → 60 passed; `astro check` → 0 errors / 0 warnings |
| Runtime harness command/scenario and exact result | Dev server localhost:4321; Chromium probe: `[data-audio-element]` present (count 1) with `loop` + `preload="none"` + `src="/audio/background.mp3"`; `[data-mute-control]` disabled with `aria-pressed="false"`, `data-audio-state="no-track"`, accessible name "Sound: Off" (via `textContent` — the name the existing e2e locates), box 119×44 ≥ 44px; `trackRequests: 0` — no fetch of the missing `/audio/background.mp3` (preload="none" contract, no 404); `consoleErrors: []` |
| Rollback boundary | Revert `tests/unit/audio-state.test.ts` (new), `src/lib/audio/state.ts` (new), `src/components/game/AudioControl.astro` (markup upgrade — restores the Unit 3 inert placeholder); cluster positioning, ControlCluster, BaseLayout, menu composition, shell.ts, links, keyboard semantics untouched |

## Test Summary

- **Total tests written**: 14 (all unit, in `audio-state.test.ts`); **passing**: 98 unit + 60 e2e; 14/14 in audio-state spec. **Layers**: Unit (14 new + 84 existing); E2E (60 existing — cluster describe acted as regression guard for the button). **Approval tests**: None — new module + additive markup. **Pure functions created**: 1 (`reduceAudio` + `createAudioState`, design AD5 interface verbatim).

## Changed Lines (authored)

| File | ± |
|------|---|
| `tests/unit/audio-state.test.ts` | new (105) |
| `src/lib/audio/state.ts` | new (48) |
| `src/components/game/AudioControl.astro` | +15/−5 |
| `tasks.md` + `apply-progress.md` (openspec change) | 3/3 marks + cumulative merge |

Total authored changed lines ≈ 225 incl. artifacts (173 code/tests) — within the 400-line unit budget.

## Deviations from Design

- None in behavior. Design AD5 interfaces verbatim: `AudioStatus = "no-track" | "ready" | "playing" | "muted"`, `AudioEvent` kinds `probe-ok | probe-fail | audio-error | gesture | toggle | restore{muted}`, `reduceAudio(state: { status; muted }, event)`.
- Implementation notes (not deviations): initial state is `no-track` (safe default: nothing known → silent + disabled control until the probe resolves); `probe-ok` only arms from `no-track` (idempotent); `audio-error` → `no-track` keeps the `muted` preference (status is terminal, preference survives); `toggle` is a no-op before unlock (the wiring's gesture fires first anyway, and no-track must never toggle); `restore` sets only the `muted` flag so a restored muted preference gates the first `gesture` into `muted` (design data flow: "gesture → persisted muted? → silent | play()"). The one RED expectation corrected mid-cycle asserted `muted` resets on `audio-error`; the implementation preserves it — the test now pins the actual contract.

## Issues Found

- One transient full-suite flake: `budget.spec.ts` "with JS every route fills the viewport" failed once in the full run (dev-server HMR race class, same as prior units) — passed in isolation twice and in the final 60/60 full-suite rerun. No code impact.
- Playwright package not resolvable from `/tmp` probes under pnpm (ESM + NODE_PATH); resolved by importing from the pnpm store path (`node_modules/.pnpm/playwright@1.62.1/...`). Environment note, not a repo defect.

## Remaining Tasks

- Phase 5 continuation (Unit 5B, next slice): tasks 5.4–5.7 — e2e `ambient-audio.spec.ts`, `src/scripts/ambient-audio.ts` wiring, `public/audio/README.txt`, verify. Phases 6–7 untouched per boundary.

## Workload / PR Boundary

- Mode: chained PR slice (auto-chain, feature-branch-chain); work unit `unit-5a-audio-reducer-control` → PR 5 (targets `feat/persona-ui-ux-remediation` tracker branch)
- Boundary: start = current branch state (Units 3–4 verified but uncommitted; HEAD `30a4574`); end = tasks 5.1–5.3 verified; tasks 5.4–5.7 (wiring/e2e/README/verify) explicitly excluded; estimated review budget ≈ 225 authored changed lines incl. artifacts (unit budget 400)

---

# Unit 5B Batch (this batch — ambient audio wiring, e2e, README)

## Batch Metadata

| Field | Value |
|-------|-------|
| Change / Work unit / Scope | `persona-ui-ux-remediation` / `unit-5b-audio-wiring-e2e-readme` / Phase 5 tasks 5.4–5.7 only (wiring + e2e + BYO README + verify) |
| Branch / Mode / Delivery | `feat/persona-ui-ux-remediation` (feature-branch-chain); Strict TDD (openspec `rules.apply.tdd: true`); `auto-chain` with maintainer-accepted `size:exception` (Unit 5B) — no commit/push/PR |
| Attempt token / Evidence revision | `sha256:98d3f4621431681c6f169c36d482562b3777d54bbc44d7adc37b0d8d8589c0bf` (provided by parent — this batch did not acquire/settle; prior batches rev-1 + Units 2–5A merged above) |
| Size exception | **Accepted by maintainer (Jona, 2026-08-13)**: 546 code/test lines (631 incl. OpenSpec artifacts) exceed the 400-line review budget, but no clean sub-400 autonomous split keeps the runtime behavior together with its verifying E2E tests (wiring `src/scripts/ambient-audio.ts` 258 lines + `tests/e2e/ambient-audio.spec.ts` 261 lines are mutually verifying and cohesive) |
| Skill resolution | `skill_resolution: paths-injected` — orchestrator injected the skill file paths; all 7 loaded by path: `sdd-apply/SKILL.md`, `sdd-apply/strict-tdd.md`, `.agents/skills/astro-framework/SKILL.md`, `frontend-ui-engineering/SKILL.md`, `playwright/SKILL.md`, `chained-pr/SKILL.md`, `work-unit-commits/SKILL.md` |

## Settlement Evidence

- **Evidence revision**: sixth evidence batch; Units 1–5A preserved verbatim above (disk `apply-progress.md` is the artifact of record; Engram `sdd/persona-ui-ux-remediation/apply-progress` mirrors the summary).
- **Diagnosis**: fresh batch; no prior failed evidence, no remediation lineage. RED = spec file could not observe any wiring behavior (no probe, no state changes), then GREEN.
- **Harness**: dev server reused (http://localhost:4321, HTTP 200 — `reuseExistingServer`); no servers started/stopped by this batch; probe scripts + mp3 generator in `/tmp/opencode/u5b` (outside repo); `test-results/` gitignored.
- **Process evidence**: baseline 98 unit + 60 e2e green; final full e2e 66 passing (60 baseline + 6 new), unit 98, `astro check` 0 errors / 0 warnings (4 pre-existing hints), `pnpm build` clean (7 pages), Biome 0 issues on both new TS files (the 2 ControlCluster `.astro` noUnusedImports warnings are the pre-existing template-import false-positive class, present at HEAD).

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 5.4 | `tests/e2e/ambient-audio.spec.ts` | E2E | ✅ 98 unit + 60 e2e | ✅ Written (6 tests; all failed: no probe, no state transitions) | ✅ 6/6 after 5.5 | ✅ 6 scenarios: no-track terminal + swap adoption, lazy bytes + gesture gate, keyboard toggle + fade band + storage, reload persistence + muted gating, nav survival + no re-probe, reduced-motion | ✅ Two test-side races found + fixed during triage (see Issues); fade shape measured in-page (load-independent) |
| 5.5 | `src/scripts/ambient-audio.ts` (via ambient-audio.spec.ts) | E2E | ✅ 6/6 RED run | ✅ (covered by 5.4 RED) | ✅ 6/6 | ✅ HEAD-once per fresh load, HEAD-count pinned to 1 across swaps; probe-fail adoption; playing-survives-swap; storage failure path **NOT unit-covered here — runtime storage access lives in this file (`persistMuted`/`readPersistedMuted`), not in the pure reducer (`src/lib/audio/state.ts` has zero storage logic)**; covered at the E2E layer by Correction Batch 1 (storage read/write failure tests) | ✅ Import order (Biome); fade driver switched rAF → drift-corrected `setInterval` after stall diagnosis (see Issues) |
| 5.6 | `public/audio/README.txt` | Doc | — | — | ✅ (content verified: placement + copyright warning per spec scenario) | ➖ Single contract | ➖ None needed |
| 5.7 | — (verification) | E2E | — | — | ✅ `pnpm run test:unit` 98/98; `pnpm exec playwright test ambient-audio.spec.ts` 6/6; full `pnpm run test:e2e` 66/66; `astro check` 0/0; `pnpm build` clean | — | — |

## Work Unit Evidence

| Evidence | Required value |
|----------|----------------|
| Focused test command and exact result | `pnpm exec playwright test ambient-audio.spec.ts` → 6 passed (0 baseline + 6 new), stable across 50+ consecutive runs; `pnpm run test:unit` → 98 passed (98 baseline + 0 new; reducer suite untouched); full `pnpm run test:e2e` → 66 passed (60 baseline + 6 new) across 4 consecutive full runs |
| Runtime harness command/scenario and exact result | Dev server localhost:4321; (a) real environment (no track): probe HEAD → 404 → button disabled `aria-pressed=false` `data-audio-state=no-track` "Sound: Off", stays terminal across an About swap, HEAD count pinned at 1 (no re-probe), zero GETs; (b) route-intercepted silent MP3 (24 zero-filled MPEG-1 L3 frames, generated in-test): HEAD-only probe (bytes 0 until gesture), gesture unlock → single GET → plays, keyboard Enter toggle flips `aria-pressed`/label with a gradual in-page fade ending at exactly 0 then pause, `localStorage["portfolio:audio:muted"]` = "1"/"0", reload restores muted and gates the first gesture silent (GET count unchanged), playing audio survives an About view-transition swap on the same persisted element with HEAD/GET counts pinned at 1/1, reduced-motion emulation never autostarts and fades complete. (The historical "300–500ms" fade figure was measured with the rAF sampler — superseded by Correction Batch 1: interval sampler measured 375–376ms; band asserted at the spec's 200–450ms.) |
| Rollback boundary | Revert `src/scripts/ambient-audio.ts` (new), `tests/e2e/ambient-audio.spec.ts` (new), `public/audio/README.txt` (new), `src/components/game/ControlCluster.astro` script import (4 lines); reducer `state.ts`, AudioControl markup, cluster positioning, BaseLayout, shell.ts, menu, figures untouched |

## Test Summary

- **Total tests written**: 6 (all e2e, in `ambient-audio.spec.ts`); **passing**: 66 e2e + 98 unit; 6/6 in the spec (amended by Correction Batch 1: 8/8 with the two storage-failure tests). **Layers**: E2E (6 new + 60 existing). **Approval tests**: None — new module + additive markup. **Pure functions**: 0 (reducer already unit-covered; wiring is DOM/event glue).

## Changed Lines (authored)

| File | ± |
|------|---|
| `src/scripts/ambient-audio.ts` | new (258) |
| `tests/e2e/ambient-audio.spec.ts` | new (261) |
| `public/audio/README.txt` | new (23) |
| `src/components/game/ControlCluster.astro` | +4 (script import) |
| `tasks.md` + `apply-progress.md` (openspec change) | 4/4 marks + cumulative merge (~70) |

Total authored changed lines = 631 incl. artifacts (546 code/tests) — **exceeds the 400-line soft unit budget**; see Issues #4 for the settlement note.

## Deviations from Design

- None in behavior. Design AD5 verbatim: HEAD probe exactly once per fresh load with an in-flight guard, 200 → ready / 404 → no-track / 405 + network error → optimistic ready corrected by a later `audio-error`; probe result + state stashed on the persisted `ControlCluster` element (expando `__ambientAudio`) so swap re-init adopts it and never re-probes; `astro:before-swap` aborts in-flight probes; one-time pointerdown/keydown unlock; `localStorage["portfolio:audio:muted"]` try/catch, never throws; fades 400ms / 200ms reduced; `restore` sets only the muted flag so a persisted mute gates the first gesture into silence; no reduced-motion autostart; `<audio loop preload="none">` zero bytes until `play()`.
- Implementation notes (not deviations): (1) the fade driver is a 25ms drift-corrected `setInterval` instead of rAF — the rAF version intermittently stalled under dev-server churn (first frame delayed past an interrupt, or never dispatched), leaving the fade permanently dead; interval math is wall-clock so a stalled frame loop delays rather than kills the fade, and it completes even in throttled background tabs (see Issues #2). (2) The gesture-unlock listeners are armed only when the track is `ready` (per the reducer contract, a gesture while `no-track` is a no-op); tests establish `ready` before gesturing. (3) The toggle's first activation doubles as the unlock gesture (pointer/keydown fires first, then the click's toggle), matching the design data flow. (4) Stash adoption overrides the status to `playing` when the persisted `<audio>` element is audibly playing (`audio.paused === false` is the source of truth after a swap).

## Issues Found

1. **Test-side races (fixed in-test, both races were test bugs, not wiring bugs)**: (a) tests 3/4/5 pressed the unlock key before the probe resolved — while `no-track`, the gesture is a reducer no-op, so nothing played; fixed by asserting `data-audio-state="ready"` before unlocking. (b) the toggle test muted within ~50ms of unlocking — before the 400ms fade-in's first frame — so the interrupt retargeted from the true current volume (0) and the fade-out legitimately had no intermediate values; fixed by polling the fade-in to full volume (`volume == 1`) before muting, making the scenario the spec's actual premise ("GIVEN audio playing").
2. **rAF fade stall (wiring robustness, fixed)**: under dev-server churn, the rAF-driven fade intermittently never dispatched its scheduled frame (captured via in-page instrumentation: fade scheduled at 187.4ms, still pending at 236.9ms when the mute interrupt cancelled it; on one run the poll watched volume stay 0.000 for 8s while other rAF loops ran at 60fps). Switched the driver to a 25ms drift-corrected `setInterval`; 50+ consecutive spec runs and 4 full-suite runs clean since. The stall also affected real users on throttled/occluded tabs (rAF pauses when hidden; setInterval completes degraded), so the fix is product hardening, not a test accommodation.
3. **Full-suite transient flakes (environmental class, documented in every prior unit)**: one ambient-audio spec run failed immediately after a source edit (dev-server HMR rebuild race — the run raced the rebuild); one full-suite run failed once and passed on the immediate rerun; both match the HMR-race class already recorded in Units 2/4/5A. Also noted: the HEAD probe's 404 produces the browser's standard "Failed to load resource: 404" console entry (inherent to probing a possibly-missing file; fetch-level 404, handled by the wiring; same class as the pre-existing 404 asset noted in Unit 4).
4. **Budget note — RESOLVED: `size:exception` accepted by maintainer (Jona, 2026-08-13)**: this slice exceeds the 400 authored-line soft budget (631 incl. openspec artifacts; 546 code/tests) — the audio wiring module (258) + six-scenario e2e (261) are both single-purpose cohesive files with clean rollback boundaries (see above). Maintainer accepted `size:exception` with rationale: no clean sub-400 autonomous split keeps the runtime behavior together with its verifying E2E tests (wiring + spec are mutually verifying; a split would separate them or split one cohesive file). Recorded in this Batch Metadata table and in `tasks.md` (Review Workload Forecast).

## Remaining Tasks

- Phase 6 (Unit 6): regression verification — tasks 6.1–6.3 (budget spec + views spec regression + full verify) (NOT in this batch). Phase 7 (docs) untouched per boundary.

## Workload / PR Boundary

- Mode: `size:exception` (maintainer-accepted, 2026-08-13) — chained PR slice (feature-branch-chain); work unit `unit-5b-audio-wiring-e2e-readme` → PR 6 candidate (targets `feat/persona-ui-ux-remediation` tracker branch)
- Boundary: start = HEAD `7255e40` (Unit 5A committed by parent); end = tasks 5.4–5.7 verified; Phase 6 (6.1–6.3) and Phase 7 explicitly excluded
- Estimated review budget: 631 authored changed lines incl. artifacts (546 code/tests) — exceeds the 400-line soft budget; `size:exception` rationale: no clean sub-400 autonomous split keeps the runtime behavior together with its verifying E2E tests. Correction Batch 1 adds ~157 authored lines on top (see the correction section's Changed Lines table), inside the accepted exception.

---

# Unit 5B Correction Batch 1 (fresh-context validator findings)

## Batch Metadata

| Field | Value |
|-------|-------|
| Change / Work unit / Scope | `persona-ui-ux-remediation` / `unit-5b-audio-wiring-e2e-readme` — correction of Unit 5B evidence only; Phase 5 tasks 5.4–5.7 remain the unit of record |
| Lineage | Corrects Unit 5B evidence revision `sha256:98d3f4621431681c6f169c36d482562b3777d54bbc44d7adc37b0d8d8589c0bf`; native runtime attempt token `sha256:a838c4e74cc5e75a7ced28d77211be0c94bbb9f30689704982207918d44095fd` (parent owns settlement; this batch did not acquire/settle) |
| Branch / Mode / Delivery | `feat/persona-ui-ux-remediation` (feature-branch-chain); Strict TDD; `exception-ok` for this correction (maintainer accepted `size:exception`) — no commit/push/PR |
| Skill resolution | `skill_resolution: paths-injected` — all 7 skill files injected by path (see Unit 5B Batch Metadata table) |
| Scope guard | Phase 6 (6.1–6.3) and Phase 7 NOT implemented; ambient-audio design NOT redesigned; no unrelated files touched |

## Validator Findings → Corrections

1. **Missing runtime coverage for `localStorage` read/write failures** → added 2 E2E tests in `tests/e2e/ambient-audio.spec.ts` (storage read failure; storage write failure). The runtime storage access lives in `src/scripts/ambient-audio.ts` (`persistMuted`/`readPersistedMuted`, design AD5 try/catch); `src/lib/audio/state.ts` is a pure reducer with zero storage logic — coverage correctly placed at the E2E layer, not attributed to the reducer unit tests (see corrected 5.5 row above).
2. **Inaccurate evidence claim "storage failure path unit-covered (reducer 5.1)"** → corrected in the 5.5 TDD row (now states the runtime storage is not unit-covered and is covered at E2E by this batch).
3. **`size:exception` for Unit 5B** → accepted by maintainer (Jona, 2026-08-13); persisted in Unit 5B Batch Metadata, Issues #4, Workload/PR Boundary (above) and in `tasks.md` Review Workload Forecast.
4. **`skill_resolution: paths-injected`** → persisted in Unit 5B Batch Metadata (above) and repeated here.
5. **`assertFade` 600ms vs spec 450ms upper band** → tightened to 450ms deterministically (see evidence below); no test-tolerance exemption needed.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| Storage read failure | `tests/e2e/ambient-audio.spec.ts` (new test 7) | E2E | ✅ 6/6 ambient-audio + 98 unit | ✅ Written first. Approval-passed vs current try/catch (behavior already conforms). **Genuine RED captured by mutant**: with the `readPersistedMuted` try/catch stripped, the uncaught SecurityError kills the wiring — the control never reaches `ready`/`Sound: On`; test fails. Implementation restored byte-for-byte | ✅ 8/8 after restore | ✅ 2 cases: read path (getItem throws → in-memory default unmuted, playback still works) + write path (setItem throws → toggle cycles in memory); override-liveness probe asserts the in-page read genuinely throws (no ghost pass); zero page errors asserted on both | ➖ None needed (test-only; implementation already conforms) |
| Storage write failure | `tests/e2e/ambient-audio.spec.ts` (new test 8) | E2E | ✅ 6/6 + 98 unit | ✅ Written first. Approval-passed. **Genuine RED captured by mutant**: with the `persistMuted` try/catch stripped, the page surfaces `"storage denied"` page errors on each toggle and the test fails | ✅ 8/8 after restore | ✅ covered by the read/write pair above | ➖ None needed |
| Fade band tightening | `tests/e2e/ambient-audio.spec.ts` (`watchVolume` + `assertFade`) | E2E | ✅ 6/6 | ✅ (assertion strengthened from ≤600 to ≤450 per spec band) | ✅ 8/8 | ✅ sampled both fade directions (mute → 0, unmute → 1) across 15 consecutive runs | ✅ rAF sampler → 5ms in-page interval sampler (sampling-phase error bounded to one 5ms tick vs ~16.7ms rAF frame) |

## Work Unit Evidence

| Evidence | Required value |
|----------|----------------|
| Focused test command and exact result | `pnpm exec playwright test ambient-audio.spec.ts` → **8 passed** (6 baseline + 2 new storage-failure tests); **15/15 consecutive runs green** with the tightened 450ms fade band; `pnpm run test:unit` → 98 passed (unchanged); full `pnpm run test:e2e` → **68 passed** (66 baseline + 2 new) |
| Runtime harness command/scenario and exact result | Dev server localhost:4321 (reused, `reuseExistingServer`). (a) Storage read failure: `addInitScript` overrides `Storage.prototype.getItem` to throw `SecurityError` for key `portfolio:audio:muted` only; override liveness proven in-page; fresh-load restore falls back to in-memory default — button `data-audio-state=ready`, "Sound: On", gesture plays, `pageErrors: []`. (b) Storage write failure: `Storage.prototype.setItem` throws for the same key; mute/unmute cycle still flips `aria-pressed` + label + playback in memory, `pageErrors: []`. (c) Fade measurement probe (temporary spec, deleted after run): 8 in-page samples of the mute fade → **375–376ms** (nominal 400ms minus the ~25ms to the first driver tick; spec band 200–450ms holds with ~74ms headroom; no rAF-sampling artifact) |
| Rollback boundary | Revert the 2 new tests + `watchVolume`/`assertFade` changes in `tests/e2e/ambient-audio.spec.ts` (restores the 6-test spec with the 600ms bound) and the apply-progress/tasks artifact edits; `src/scripts/ambient-audio.ts` is **unchanged** by this batch (mutant edits reverted byte-for-byte — verified via `git status`/file read, file is untracked so no diff) |

## Changed Lines (authored, this correction batch)

| File | ± |
|------|---|
| `tests/e2e/ambient-audio.spec.ts` | 261 → 342 (+81 net: 2 storage tests = 75 lines; `watchVolume` sampler rewrite net 0; `assertFade` band +3; header comment +1) |
| `openspec/changes/persona-ui-ux-remediation/apply-progress.md` | +73 (correction section 68 incl. `---` separator; inline metadata/workload edits 5) |
| `openspec/changes/persona-ui-ux-remediation/tasks.md` | 86 → 89 (+3: Review Workload Forecast row + Phase 5 note) |

Total ≈ 157 authored changed lines — well below the 400-line budget; `src/scripts/ambient-audio.ts` untouched in the final state (verified byte-for-byte, 258 lines = original).

## Test Summary

- **Total tests written**: 2 (both e2e, in `ambient-audio.spec.ts`); **passing**: 68 e2e + 98 unit; 8/8 in the spec.
- **Layers**: E2E (2 new + 6 existing in spec). **Approval tests**: 2 (storage read/write failure — behavior already conformed; RED proven via mutant stripping). **Pure functions**: 0.

## Issues Found

1. **First-run HMR-race flake (documented class)**: the spec run immediately after each `src/scripts/ambient-audio.ts` mutant edit failed test 1 once (dev-server rebuild race); identical code passed on the immediate rerun — same class recorded in Units 2/4/5A/5B.
2. **Full-suite external-network flake (documented class, pre-existing)**: `contact-resolution.spec.ts` itch.io probe failed once in the full run; passes in isolation and the full rerun was 68/68 — same class recorded in Unit 4.
3. **Probe-script gotcha (environment, no code impact)**: measuring repeated fades in one context shares `localStorage` — a mute writes `"1"` and the next load restores muted, gating the gesture to silence (design behavior, confirmed working). The temporary measurement probe resets storage per load via `addInitScript`; the probe file was deleted after capture.
4. **`assertFade` band decision**: tightened from ≤600ms to the spec's ≤450ms. Deterministic basis: the nominal fade is 400ms of wall clock, the driver ticks at 25ms and the in-page sampler at 5ms, so the measured duration is 400 ± ~30ms; measured 375–376ms in 8 probe samples; 15/15 consecutive spec runs green. The historical 500ms observations were rAF-sampling artifacts (stalled frames near completion), eliminated by the interval sampler. No test-tolerance exemption required.

## Remaining Tasks

- Phase 6 (Unit 6): regression verification — tasks 6.1–6.3 (NOT in this batch). Phase 7 (docs) untouched per boundary.

## Workload / PR Boundary

- Mode: `size:exception` (maintainer-accepted) — correction batch rides on the Unit 5B exception; feature-branch-chain
- Boundary: start = Unit 5B verified state (HEAD `7255e40`); end = tasks 5.4–5.7 evidence corrected and re-verified; Phase 6/7 explicitly excluded
- Estimated review budget impact: +~157 authored lines for the correction (total Unit 5B scope now ~790 incl. artifacts, all inside the accepted exception)

---

# Unit 6 Batch (this batch — regression verification)

## Batch Metadata

| Field | Value |
|-------|-------|
| Change / Work unit / Scope | `persona-ui-ux-remediation` / `unit-6-regression-verification` / Phase 6 tasks 6.1–6.3 only (budget spec + views spec regression + full verify) |
| Branch / Mode / Delivery | `feat/persona-ui-ux-remediation` (feature-branch-chain); Strict TDD (openspec `rules.apply.tdd: true`); `auto-chain` — no commit/push/PR |
| Attempt token / Evidence revision | `sha256:ad88e1dee7583980988fd6cf34eae87114b1e4a5abb428b2665b3615c89e9db9` (provided by parent — this batch did not acquire/settle; prior batches rev-1 + Units 2–5B + Correction Batch 1 preserved verbatim above) |
| Size exception note | Unit 5B's maintainer-accepted `size:exception` does NOT extend to this unit; Unit 6 authored lines kept ≤400 (actual ≈ 205 incl. artifacts — see Changed Lines) |
| Skill resolution | `skill_resolution: paths-injected` — all 7 skill files injected by path (see Unit 5B Batch Metadata table) |
| Scope guard | Phase 7 (docs) NOT implemented; no source files touched this batch (test-only + artifacts); no new dependencies |

## Settlement Evidence

- **Evidence revision**: seventh evidence batch; Units 1–5B + Correction Batch 1 preserved verbatim above (disk `apply-progress.md` is the artifact of record; Engram mirrors the summary).
- **Diagnosis**: fresh batch; no prior failed evidence, no remediation lineage. One genuine RED surfaced mid-cycle (views keyboard-mute test) — diagnosed as a test-locator bug, not an implementation defect (see Issues #1). No production code changed in this unit.
- **Harness**: dev server reused (http://localhost:4321, HTTP 200 — `reuseExistingServer`); `pnpm build` re-run twice (once for baseline dist, once as final 6.3 verification); no servers started/stopped, no temp files inside the repo (`test-results/` gitignored).
- **Process evidence**: baseline 98 unit + 68 e2e + 4/4 budget + 26/26 views green before edits; final full e2e 71 passing (68 baseline + 3 new), unit 98, budget 5/5 vs rebuilt `dist/`, `pnpm build` 7 pages clean, `astro check` 0 errors / 0 warnings (4 pre-existing hints).

## Task Interpretation (no fabricated RED)

Tasks 6.1/6.2 name three contracts that are already suite-covered by earlier units in their own spec files: shell `aria-current`/`data-active` movement (keyboard.spec.ts "persistent keyboard-active indicator", 5 tests), figure `aria-hidden` on all seven routes (reduced-motion.spec.ts "figure layer", ROUTE_PLACEMENTS loop), keyboard mute on the shell (ambient-audio.spec.ts test 3). Per the orchestrator's "avoid duplicating existing test coverage" and strict-tdd's "do not fabricate RED for check-only verification", this batch added only the **genuinely missing regression angles** and pinned the suite-level contract:

- 6.1 genuine gap: the budget measurement counted only external `/_astro/*.js` chunks, but Astro **inlines** the ambient-audio wiring into every route's HTML (`<script type="module">`, 3016 chars / 1281 gz bytes per route) — the "including audio + figure scripts" contract was silently unmeasured. Fixed by summing inline module gz into the per-route total; new test pins that the audio wiring and the figure layer markup are inside the built document on every route (figure layer is zero-JS by design AD3, so it contributes markup/CSS only).
- 6.2 genuine gaps (both view-boundary angles no spec covered): (a) the shell active indicator is re-established on return from a view (swap re-init path — keyboard.spec only asserted focus restoration); (b) keyboard mute operability on a **direct view load** (ambient-audio.spec only exercised the shell route).
- Figure `aria-hidden`: suite-covered on all 7 routes by reduced-motion.spec — recorded, NOT duplicated.

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 6.1 | `tests/e2e/budget.spec.ts` (measurement + new test) | E2E (build artifact) | ✅ 98 unit + 4/4 budget | ✅ New test written first; approval-style (dist already conformed — no fabricated RED). Measurement gap proven: old sum excluded the inlined audio wiring (1281 gz bytes/route; views 6230 → 8444 after fix) | ✅ 5/5 | ✅ 6 routes × 2 marker types (audio wiring in measured set + figure-layer markup); inline-vs-external bundling agnostic (markers searched across both) | ➖ None needed (assertion-only) |
| 6.2 | `tests/e2e/views.spec.ts` (2 new tests) | E2E | ✅ 26/26 views + 98 unit | ✅ Written first; test A passed immediately (approval-style). Test B genuinely RED once: `aria-pressed` assertion could not resolve its name-scoped locator — the toggle HAD flipped the label to "Sound: Off" (implementation correct; stale-locator test bug, fixed in-test) | ✅ 28/28 views after locator fix | ✅ test A: 4 assertions (data-active, aria-current, exactly-one data-active, exactly-one aria-current); test B: full unlock→play→Enter-mute→paused cycle on /about (shell cycle already covered by ambient-audio.spec — route triangulation across the suite) | ✅ Locator decoupled from the accessible name (attribute hook), matching the ambient-audio.spec pattern |
| 6.3 | — (verification) | — | — | — | ✅ `pnpm run test:unit` 98/98; `pnpm exec playwright test` 71/71 (68 baseline + 3 new); budget 5/5 vs rebuilt dist; `pnpm build` 7 pages clean; `astro check` 0/0 | — | — |

## Work Unit Evidence

| Evidence | Required value |
|----------|----------------|
| Focused test command and exact result | `pnpm exec playwright test budget.spec.ts` → 5 passed (4 baseline + 1 new), 0 failed; `pnpm exec playwright test views.spec.ts` → 28 passed (26 baseline + 2 new), 0 failed; both specs together 33/33 stable across 3 consecutive runs; `pnpm run test:unit` → 98 passed (unchanged) |
| Runtime harness command/scenario and exact result | Dev server localhost:4321 (reused). (a) Budget: per-route gz totals now include inline modules — `/` 29817 bytes (external 27603 + inline 2214), every view 8444 (external 6230 + inline 2214); audio-wiring markers (`no-track`+`muted`) found in the measured script set on all 6 routes; `figure-layer` markup present in all 6 built documents. (b) Views regression: Escape from /about returns to the shell with About carrying `data-active` + `aria-current="page"` and exactly one indicator pair across the menu; direct /about load with an intercepted silent MP3 — probe HEAD once, first gesture GETs + plays, Enter on the focused mute control flips `aria-pressed` to "true" and label to "Sound: Off", audio paused, HEAD count still 1. Zero page errors. |
| Rollback boundary | Revert `tests/e2e/budget.spec.ts` (INLINE_MODULES + measurement + new test) and `tests/e2e/views.spec.ts` (remediation-regression describe: silentMp3 + 2 tests) plus the tasks.md/apply-progress marks; no production source touched by this unit — rollback is purely test/artifact reversion |

## Test Summary

- **Total tests written**: 3 (budget 1 + views 2, all e2e); **passing**: 71 e2e + 98 unit; 33/33 in the two modified specs.
- **Layers**: E2E (3 new + 68 existing). **Approval tests**: 3 (all three assert existing behavior — regression verification, not new behavior; the one genuine RED was a test bug). **Pure functions**: 0.

## Changed Lines (authored)

| File | ± |
|------|---|
| `tests/e2e/budget.spec.ts` | 132 → 172 (+44: INLINE_MODULES const 6, new presence test 27, measurement + inline 9, header line 1, net −3) |
| `tests/e2e/views.spec.ts` | 762 → 843 (+81: remediation-regression describe incl. silentMp3 helper + 2 tests) |
| `openspec/changes/persona-ui-ux-remediation/tasks.md` | 3/3 checkbox marks |
| `openspec/changes/persona-ui-ux-remediation/apply-progress.md` | +77 (Unit 6 section) |

Total authored changed lines ≈ 205 incl. artifacts (125 code/tests) — well within the 400-line unit budget (Unit 5B's exception does not apply here).

## Deviations from Design

- None. No production behavior changed; the batch only strengthened the test suite per tasks 6.1/6.2 and the portfolio-page spec's "Remediation regression boundaries" requirement. Design AD3/AD5 contracts (figure layer zero-JS, audio wiring inlined per route) were verified as-built, not altered.

## Issues Found

1. **Genuine RED — test-locator bug, not a defect (fixed in-test)**: the view keyboard-mute test failed once at the `aria-pressed` assertion with "element(s) not found" for `getByRole("button", { name: "Sound: On" })`. Root cause: the Enter toggle HAD already flipped the accessible name to "Sound: Off" (implementation correct), so a name-scoped locator could never resolve the post-toggle button. Fixed by locating `[data-mute-control]` (attribute hook — the same pattern ambient-audio.spec uses) and asserting the "Sound: On" name only for the pre-toggle presence check. Re-ran 3× stable.
2. **dist/ was stale at batch start** (predated the Unit 5B ControlCluster script import — built HTML lacked the audio wiring). Rebuilt before the baseline budget run; the Unit 5B `pnpm build` evidence stands against the then-current source, but the on-disk dist had been overwritten by a later pre-Unit-5B state. No code impact; noted for the record.
3. **Measurement-gap discovery (task 6.1 substance)**: Astro inlines small module scripts, so the pre-existing budget test silently excluded the audio wiring. The fix (inline gz included) changes every route's reported total; all routes remain far below 100KB (max 29.8KB gz on `/`). The inline audio module measures 1281 gz bytes/route with the current toolchain (3016 chars); the earlier recorded 1277 figure was gzip-level variance across zlib/node versions, not a content change — re-measured at 1281 against a fresh `pnpm build`.

## Remaining Tasks

- Phase 7 (Unit 7): documentation — tasks 7.1–7.4 (`PRD.md`, `DESIGN.md` via `scripts/validate-design-md.sh`, `ARCHITECTURE.md`, `README.md`/`docs/`) (NOT in this batch).

## Workload / PR Boundary

- Mode: chained PR slice (auto-chain, feature-branch-chain); work unit `unit-6-regression-verification` → PR 7 candidate (targets `feat/persona-ui-ux-remediation` tracker branch)
- Boundary: start = Unit 5B Correction Batch 1 verified state (HEAD `7255e40`, Units 3–5B uncommitted on the feature branch); end = tasks 6.1–6.3 verified; Phase 7 explicitly excluded
- Estimated review budget impact: ≈ 205 authored changed lines incl. artifacts (unit budget 400; Unit 5B's `size:exception` does not apply to this unit)

---

# Unit 7 Batch (this batch — documentation synchronization)

## Batch Metadata

| Field | Value |
|-------|-------|
| Change / Work unit / Scope | `persona-ui-ux-remediation` / `unit-7-documentation-sync` / Phase 7 tasks 7.1–7.4 only (PRD.md, DESIGN.md, ARCHITECTURE.md, README.md + docs/) |
| Branch / Mode / Delivery | `feat/persona-ui-ux-remediation` (feature-branch-chain); docs-only batch — Strict TDD project mode applies, but no RED is fabricated for documentation (passive structural readback + task-required doc validation) |
| Attempt token / Evidence revision | `sha256:4a45c8fd779f2cfdf2593bee6c0b885a70cec6db6274d57e0167d1eb0f6bb5b8` (provided by parent — this batch did not acquire/settle; prior batches rev-1 + Units 2–6 + Correction Batch 1 preserved verbatim above) |
| Skill resolution | `skill_resolution: paths-injected` — 6 skill files injected by path: `sdd-apply`, `documentation`, `cognitive-doc-design`, `.agents/skills/astro-framework`, `chained-pr`, `work-unit-commits` |
| Scope guard | No source/test files touched this batch (docs + artifacts only); sdd-verify and sdd-archive NOT run (orchestrator boundary) |

## Settlement Evidence

- **Evidence revision**: eighth evidence batch; Units 1–6 + Correction Batch 1 preserved verbatim above (disk `apply-progress.md` is the artifact of record; Engram `sdd/persona-ui-ux-remediation/apply-progress` mirrors the summary).
- **Diagnosis**: fresh batch; no prior failed evidence, no remediation lineage. Documentation is passive — structural readback and task-required doc validation replace artificial semantic ceremony; no RED written (strict-tdd: do not fabricate RED for docs).
- **Harness**: no server needed (docs-only). `pnpm build` re-run once to re-measure the inline audio module gz (see Issues #1). No temp files inside the repo.
- **Process evidence**: baseline `pnpm lint` → 0 errors, 62 baseline warnings (pre-existing, none new); `scripts/validate-design-md.sh` (project copy absent — ran the documentation skill's copy, see Issues #2) → `LINT OK` + `SCHEMA OK` before edits, re-run green after; structural readback re-read the persisted tasks and apply-progress after edits (all checkboxes verified).

## Task Interpretation (docs-only, no fabricated RED)

- 7.1 `PRD.md`: already described the remediated system (accepted criteria written with the target); the single stale spot was the "three-layer background" reference in Technical Specifications — now four layers (figure/artifact layer added).
- 7.2 `DESIGN.md`: mostly synchronized; corrected the no-track control label ("Sound: Off", not "No ambient track" — matches `render()` in `src/scripts/ambient-audio.ts` and the e2e locator), the menu entrance stagger (25ms implemented vs documented 30–50ms — `menuOverlayOptions`), and the audio fade easing claim (implemented ramp is linear, not ease-out). Validated with the DESIGN.md validator.
- 7.3 `ARCHITECTURE.md`: component details/failure modes already described the implementation; replaced the pre-migration framing (System Overview "landing implementation being replaced", Key Decisions "current src/ model, being replaced", the whole Migration Notes section, and the resume "will be added during apply" note) with the landed state; updated the header date.
- 7.4 `README.md` + `docs/CODEBASE-GUIDE.md` + `docs/codebase/mental-model.md`: README still described the deleted landing (Hero/Featured Work/anchors) and the wrong TypeScript version (7.0.2 → ^6.0.3); refreshed to the game-menu product, added the user-facing BYO audio setup/controls section, and updated the docs table (ADR-0003/0004 + CODEBASE-GUIDE). Guide/mental-model: three-layer → four-layer background, new files (FigureLayer, ControlCluster, ambient-audio.ts, lib/audio/state.ts, audio specs), ADR-0004, and the delivered remediation change reference.

## TDD Cycle Evidence

| Task | Verification | Layer | RED | GREEN | TRIANGULATE | REFACTOR |
|------|--------------|-------|-----|-------|-------------|----------|
| 7.1 | `PRD.md` (four-layer background + criteria re-read) | Structural readback | ➖ No RED fabricated (docs-only) | ✅ text matches implemented layers + criteria | ✅ 2 checks: layer stack vs BaseLayout DOM order; criteria vs specs (indicator, stagger, cluster, figure, audio, budget) | ➖ None needed |
| 7.2 | `DESIGN.md` (menu, indicator, figure, cluster, audio) | Validator + readback | ➖ None | ✅ `validate-design-md.sh` → LINT OK + SCHEMA OK (6 pre-existing warnings, same at HEAD) | ✅ audio label/fade/stagger values cross-checked against `ambient-audio.ts` + `keys.ts` + `global.css` | ➖ None needed |
| 7.3 | `ARCHITECTURE.md` (component details, failure modes, migration notes) | Structural readback | ➖ None | ✅ migration notes now describe the landed state; components/failure modes already matched | ✅ claims vs `shell.ts`, `FigureLayer.astro`, `ambient-audio.ts`, `state.ts`, `package.json` | ➖ None needed |
| 7.4 | `README.md` + `docs/CODEBASE-GUIDE.md` + `docs/codebase/mental-model.md` | Structural readback | ➖ None | ✅ README describes the game-menu product + BYO audio setup; guide/mental-model updated (four layers, new files, ADR-0004) | ✅ links point to real files; versions vs `package.json`; no stale landing references remain | ➖ None needed |

## Work Unit Evidence

| Evidence | Required value |
|----------|----------------|
| Focused test command and exact result | `pnpm lint` → 0 errors, 62 baseline warnings, none new (Biome); `bash /home/jona/.config/opencode/skills/documentation/scripts/validate-design-md.sh DESIGN.md` → `LINT OK` + `SCHEMA OK` (the project ships no `scripts/validate-design-md.sh`; the documentation skill's validator is the canonical equivalent) |
| Runtime harness command/scenario and exact result | `N/A` — docs-only unit: no runtime boundary exists (no server, no test suite touched; verification is structural readback + lint + DESIGN.md validation, per tasks.md 7.1–7.4). `pnpm build` was re-run once purely to re-measure the inline audio module gz for the Unit 6 evidence correction (see Issues #1). |
| Rollback boundary | Revert the doc edits: `PRD.md` (four-layer line), `DESIGN.md` (audio label/states, fade easing, stagger band, budget wording), `ARCHITECTURE.md` (header date, overview framing, resume note, Key Decisions row, Migration Notes), `README.md` (refresh), `docs/CODEBASE-GUIDE.md`, `docs/codebase/mental-model.md`, plus the Unit 6 cosmetic evidence corrections and this Unit 7 section in `apply-progress.md` and the 7.1–7.4 marks in `tasks.md`; no source or test file is touched by this unit |

## Changed Lines (authored)

| File | ± |
|------|---|
| `PRD.md` | 1 (four-layer background) |
| `DESIGN.md` | 6 (audio label ×2, fade easing, stagger ×2, budget wording) |
| `ARCHITECTURE.md` | ~20 (header date, overview framing, resume note, Key Decisions row, Migration Notes rewrite) |
| `README.md` | ~45 (What Is This?, Features, BYO audio section, config + docs table fixes) |
| `docs/CODEBASE-GUIDE.md` | ~9 (four-layer mental model, directory map, ADR links) |
| `docs/codebase/mental-model.md` | ~18 (four-layer background, capabilities, data flow, entry points, change reference) |
| `openspec/changes/persona-ui-ux-remediation/apply-progress.md` | +75 (Unit 7 section 71 incl. `---` separator; Unit 6 cosmetic corrections 4) |
| `openspec/changes/persona-ui-ux-remediation/tasks.md` | 4/4 checkbox marks |

Total authored changed lines ≈ 154 incl. artifacts (76 docs + 74 apply-progress incl. section + 4 tasks marks) — well within the 400-line unit budget.

## Issues Found

1. **Unit 6 evidence correction (gzip variance, not content)**: the inline audio module measures **1281 gz bytes/route** (3016 chars) against a fresh `pnpm build` with the current node/zlib; the apply-progress's "1277 gz" figures were gzip-level variance across toolchain versions. Corrected all three occurrences (6.1 task-interpretation line, 6.1 TDD row, Issues #3) to the measured 1281 with the variance note; per-route totals (29817 `/`, 8444 views; inline 2214) are unchanged and match the Unit 6 evidence exactly.
2. **No project-local `scripts/validate-design-md.sh`**: the project ships `scripts/{validate-architecture-md.sh, generate_openapi.py, validate_openapi.py}` but not the DESIGN.md validator; ran the canonical copy from the `documentation` skill (`~/.config/opencode/skills/documentation/scripts/validate-design-md.sh`), which performs the same official-linter + local schema/order checks. `validate-architecture-md.sh` was not run because ARCHITECTURE.md's own validator targets a different template contract (the project's ARCHITECTURE.md follows its own approved structure, not the skill's template) — noted, not forced.
3. **Docs were largely pre-synchronized**: PRD/DESIGN/ARCHITECTURE already described the remediated target from earlier phases; this batch corrected the residual stale spots (layer count, audio label, stagger/easing values, pre-migration framing, versions, landing-model references) rather than rewriting documents wholesale. README/guide/mental-model carried the real staleness (deleted landing model, three-layer background, missing ADR-0004/new files).

## Remaining Tasks

- None — Phases 1–7 complete (tasks 1.1–7.4 all marked `[x]`). sdd-verify and sdd-archive are NOT run by this batch (orchestrator boundary); `next_recommended: sdd-verify`.

## Workload / PR Boundary

- Mode: chained PR slice (auto-chain, feature-branch-chain); work unit `unit-7-documentation-sync` → PR 8 (final slice, targets `feat/persona-ui-ux-remediation` tracker branch)
- Boundary: start = Unit 6 verified state (HEAD `7255e40`, Units 3–6 uncommitted on the feature branch); end = tasks 7.1–7.4 verified; sdd-verify/archive explicitly excluded
- Estimated review budget impact: ≈ 154 authored changed lines incl. artifacts (unit budget 400)

---

## Gatekeeper Correction — Unit 7 (one corrective rerun)

- **Trigger**: automatic gatekeeper corrective rerun, Unit 7 only — narrowly scoped docs/evidence correction. No source or test files touched; Phase task completion unchanged (tasks 7.1–7.4 stay `[x]`); sdd-verify and sdd-archive not run (orchestrator boundary).
- **Attempt token**: `sha256:1c2931b81a4ef6f4d96c614a26a6ea64428940d8ef143fdbebdcfcaf86e0eea5` (parent settles; this batch did not acquire/settle).
- **Corrections applied**:
  1. Stale live paths `openspec/changes/persona-game-menu-navigation/` → archived `openspec/changes/archive/2026-08-11-persona-game-menu-navigation/` in `ARCHITECTURE.md` (Migration Notes) and `docs/codebase/mental-model.md` (What Exists Today, Entry Points); prose adjusted so the archived change is not implied active.
  2. Unsupported `ARCHITECTURE.md` Failure Modes claims corrected: Playwright runs Chromium only (no Firefox/Safari project matrix — the View-Transitions row now states the E2E-verified full-page fallback and names the cross-browser gap); no E2E asserts absence of an audio file in `dist` (the Copyrighted-media row now states verified coverage and names the missing automated check as a future gap).
  3. Unit 7 lint evidence wording corrected to `0 errors, 62 baseline warnings, none new` (re-verified: `pnpm lint` → `Found 62 warnings`, no errors), not 0 warnings.
  4. `docs/CODEBASE-GUIDE.md` E2E directory map completed (added `keyboard`, `contact-resolution`, `transitions-evidence` specs; unit map was already complete).
- **Preserved**: all cumulative content above (Units 1–6, Unit 5B Correction Batch 1, Unit 7 batch) verbatim; `skill_resolution: paths-injected` preserved (see Batch Metadata).
