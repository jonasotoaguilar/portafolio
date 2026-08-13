# Apply Progress — persona-ui-ux-remediation (cumulative: Unit 1 + Unit 2)

- **Unit 1** (Phase 1, tasks 1.1–1.5, active/focus indicator): ✅ DONE — committed at `f616ea0`, evidence `rev-1`.
- **Unit 2** (Phase 2, tasks 2.1–2.4, diagonal staggered menu): ✅ DONE — this batch, uncommitted, evidence `sha256:ff5066ed49abc4ca34cd88efa9e52bc3d88e0d5f7af1521859328e2a8972cc0b`.

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
