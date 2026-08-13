# Apply Progress — persona-ui-ux-remediation (cumulative: Unit 1 + Unit 2 + Unit 3)

- **Unit 1** (Phase 1, tasks 1.1–1.5, active/focus indicator): ✅ DONE — committed at `f616ea0`, evidence `rev-1`.
- **Unit 2** (Phase 2, tasks 2.1–2.4, diagonal staggered menu): ✅ DONE — committed at `d38d833`, evidence `sha256:ff5066ed49abc4ca34cd88efa9e52bc3d88e0d5f7af1521859328e2a8972cc0b`.
- **Unit 3** (Phase 3, tasks 3.1–3.6, bottom-right ControlCluster): ✅ DONE — this batch, uncommitted, evidence `sha256:cba0e53c27c34e33eef6cf3f38874ab589a9f5b6338ff459adcc0673123f7c8d`.

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
