# Apply Progress: visible-motion-scroll-trace — PR1 Visible Motion + PR2 Trace (no paint)

## Work Unit: PR1 Visible Motion Only

- Scope: tasks 1.1–2.6 (tokens + visible motion), stacked-to-main PR1
- Base: chore/ui-performance-seo-audit-archive (702c63e)
- Branch: feat/visible-motion-scroll-trace
- Attempt token: sha256:2241ba27414ad04a1ff2ff43d05a75709d1d1a7c851864344c1170581783e3e4 (parent owns settlement, no acquire/settle)
- Issue: Closes #11
- Review budget: 800 lines

## Work Unit: PR2 Trace + Conditional Paint Gate (this slice)

- Scope: tasks 3.1–4.2 (trace + conditional paint gate), stacked-to-main PR2
- Base: feat/visible-motion-scroll-trace (81342e7) — PR #16 draft
- Branch: perf/visible-motion-scroll-trace (child of feat/visible-motion-scroll-trace, stacked-to-main)
- Attempt token: sha256:406aba3944b31164399b55d38a61f796e7863e44e8be11b7301ece039d1fa0d6 (parent owns settlement, no acquire/settle)
- Issue: N/A — measurement-only continuation; document N/A in PR linkage (no invented issue)
- Review budget: 800 lines (original); exception ceiling 900 via corrective token sha256:0c1bd381eddb2404e56847239da69e9186db570b6acf83288d31848eb67cc184 — PR #17 actual 885 = 848 additions + 37 deletions (≤900)
- Evidence revision: sha256:93340c0492f4bfbe2748879c3e706fa314cde4508e537bbddad1266ec92d7a36 (traces/summary.md sha256 — failed gate revision; remediated by correction below)
- Correction work unit: scroll-trace-size-exception-validation — corrective token sha256:0c1bd381eddb2404e56847239da69e9186db570b6acf83288d31848eb67cc184, remediates sha256:93340c0492f4bfbe2748879c3e706fa314cde4508e537bbddad1266ec92d7a36, max 900

## Completed Tasks

- [x] 1.1 RED motion-tokens.test.ts
- [x] 1.2 GREEN motion-tokens.ts + REFACTOR motion.ts/global.css to MOTION
- [x] 2.1 RED e2e/interaction.spec.ts discriminator + 250ms + reduced/coarse/persist
- [x] 2.2 GREEN BaseLayout.astro fade 250ms
- [x] 2.3 GREEN motion.ts MOTION entrance + persist 250ms opacity once, flag reset in destroyMotion
- [x] 2.4 GREEN global.css 24px entrance + project-card -2px fine+hover + no global smooth + no standing will-change
- [x] 2.5 GREEN ProjectCard.astro class project-card + drop transition-delay
- [x] 2.6 REFACTOR + verify vs chosen.yaml
- [x] 3.1 RED e2e/scroll-trace.spec.ts D1/D2/M1/M2/C 3× before blur/fixed-layer edits
- [x] 3.2 GREEN .gitignore ignore traces except openspec/changes/visible-motion-scroll-trace/traces/summary.md — PASS → no paint change
- [x] 4.1 RED same matrix — missing attribution would block ship, attribution present
- [x] 4.2 GREEN one-variable gate — PASS so explicitly not triggered, no paint change (variance guard preserved)

## TDD Cycle Evidence (Strict TDD)

| Task | Test File                             | Layer | Safety Net                                    | RED                                                                                                 | GREEN                                                                                         | TRIANGULATE                                                                      | REFACTOR                                                          |
| ---- | ------------------------------------- | ----- | --------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1.1  | src/scripts/motion-tokens.test.ts     | Unit  | ✅ 35/35                                      | ✅ Written — 5 failures (missing MOTION, legacy 18/0.55/0.06/14px)                                  | ✅ Passed — 5/5 after MOTION creation                                                         | ✅ 3 cases (happy, edge invalid, file seam)                                      | ✅ Clean — oxfmt                                                  |
| 1.2  | src/scripts/motion-tokens.test.ts     | Unit  | ✅ 35/35                                      | — (same RED)                                                                                        | ✅ Passed — 5/5 after REFACTOR motion.ts & global.css to MOTION                               | ➖ Single — token wiring is structural single-output                             | ✅ Clean — extracted MOTION seam, removed literals                |
| 2.1  | e2e/interaction.spec.ts               | E2E   | ✅ 40 unit, 58 e2e baseline (canonical fixed) | ✅ Written — 3 failures (route 250ms, card -2px, persist 250ms) before GREEN, late fails on settled | ✅ Passed — 4/4 visible-motion after GREEN                                                    | ✅ 4 cases (mid/late, route, card matrix, persist)                               | ✅ Clean — discriminator fail-closed, no waitForTimeout           |
| 2.2  | e2e/interaction.spec.ts               | E2E   | —                                             | —                                                                                                   | ✅ Passed — route fade 250ms via getAnimations/head 250ms check                               | —                                                                                | —                                                                 |
| 2.3  | e2e/interaction.spec.ts               | E2E   | —                                             | —                                                                                                   | ✅ Passed — persist opacity 250ms once, no stale transform, flag reset                        | —                                                                                | ✅ Clean — added hasReenteredPersisted, animatePersistedReentry   |
| 2.4  | e2e/interaction.spec.ts               | E2E   | —                                             | —                                                                                                   | ✅ Passed — global.css 24px, project-card -2px fine+hover, no smooth, no standing will-change | —                                                                                | ✅ Clean — added project-card gutter, reduced guard               |
| 2.5  | e2e/interaction.spec.ts               | E2E   | —                                             | —                                                                                                   | ✅ Passed — ProjectCard class project-card, no transition-delay                               | —                                                                                | —                                                                 |
| 2.6  | —                                     | —     | —                                             | —                                                                                                   | ✅ Passed — astro check 0e, unit 40/40, e2e 58/58, build 7 pages                              | —                                                                                | ✅ Clean — oxfmt normalizer once, chosen.yaml compare ok          |
| 3.1  | e2e/scroll-trace.spec.ts              | E2E   | ✅ 40 unit, 58 e2e baseline (post-PR1)        | ✅ Written — 3 failures (summary missing before generation)                                         | ✅ Passed — 4/4 scroll-trace after GREEN (deterministic rAF scroll, 3× per config)            | ✅ 5 configs ×3 reps (D1/D2/M1/M2/C) + warmup 700ms, 1200ms profile, attribution | ✅ Clean — oxfmt, rAF profile, no DevTools blob claim             |
| 3.2  | e2e/scroll-trace.spec.ts + .gitignore | E2E   | ✅ 62 e2e after trace                         | ✅ Written — .gitignore missing traces ignore                                                       | ✅ Passed — .gitignore ignores traces/* except summary.md, summary PASS → no paint change     | ➖ Single — gate is PASS path                                                    | ✅ Clean — .gitignore lines 38–40                                 |
| 4.1  | e2e/scroll-trace.spec.ts              | E2E   | ✅ 62 e2e                                     | ✅ Written — missing attribution would fail same matrix                                             | ✅ Passed — attribution table present (WaterField, ghost blur, clip-panel, bg-word, header)   | ✅ Verified missing-attribution guard                                            | ✅ Clean — attribution via code inspection, not invented DevTools |
| 4.2  | e2e/scroll-trace.spec.ts + global.css | E2E   | ✅ 62 e2e                                     | — (same matrix)                                                                                     | ✅ Passed — Conclusion PASS so explicitly not triggered, no contain:paint / isolation change  | ➖ Single — variance guard documented                                            | ✅ Clean — no paint change, preserve visual contract              |

### Test Summary

- **Total tests written**: 5 unit (1.1–1.2) + 4 E2E visible-motion (2.1) + 4 E2E scroll-trace (3.1–4.2) = 13 focused
- **Total tests passing**: 40 unit, 62 e2e (58 prior + 4 scroll-trace)
- **Layers used**: Unit (5), E2E (8)
- **Approval tests**: None — no refactoring of existing behavior beyond token seam and trace measurement
- **Pure functions created**: MOTION constant, median(), formatSummary() (trace), measureOne() (trace harness)

## Work Unit Evidence

### PR1

| Evidence                                          | Required value                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused test command and exact result             | `pnpm run test:unit -- src/scripts/motion-tokens.test.ts` → 5/5 passed (13ms); `pnpm run test:e2e -- e2e/interaction.spec.ts --grep "visible-motion"` → 4/4 passed (route 250ms, discriminator mid, card -2px matrix, persist 250ms) within full `pnpm run test:unit` 40/40 and `pnpm run test:e2e` 58/58                                                                                                                                       |
| Runtime harness command/scenario and exact result | `SITE= pnpm build && SITE= pnpm preview --port 4321` → 7 pages built (347ms); manual harness: navigate /→/projects via ClientRouter, sample getAnimations 250ms running, panel mid opacity (0,1) before is-entrance-visible, card hover -2px on 1280 fine+hover, reduced-motion no translate/no lift, coarse stylesheet gate no unconditional lift, persisted back-forward opacity 250ms once and will-change cleared after 1100ms — all passed |
| Rollback boundary                                 | Exact files/behavior revertible without unrelated work: `src/scripts/motion-tokens.ts`, `src/scripts/motion-tokens.test.ts`, `src/scripts/motion.ts`, `src/layouts/BaseLayout.astro`, `src/styles/global.css`, `src/components/ProjectCard.astro`, `e2e/interaction.spec.ts` (visible-motion block), `openspec/changes/visible-motion-scroll-trace/tasks.md` checkboxes, `openspec/changes/visible-motion-scroll-trace/apply-progress.md`       |

### PR2 (this slice)

| Evidence                                          | Required value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused test command and exact result             | `pnpm exec playwright test e2e/scroll-trace.spec.ts` → 4/4 passed (839ms isolated, 31.7s full suite 62/62). Command: `pnpm run test:e2e -- e2e/scroll-trace.spec.ts` → 4/4. RED run before generation: 3 failures (summary missing); GREEN after generation: 4/4.                                                                                                                                                                                                                                                                                                                                                                            |
| Runtime harness command/scenario and exact result | `SITE= pnpm build && SITE= pnpm preview --port 4321` → 7 pages (282ms). Deterministic scroll profile: linear `window.scrollTo(0, max*t)` via rAF, 1200ms scroll + 400ms post-idle + 700ms warmup after `[data-entrance]` settle, CPU throttling 4× (D/C) /6× (M) via CDP `Emulation.setCPUThrottlingRate`, viewports 1280×800 (D/C) /390×800 (M), routes /projects (D1/M1), /experience (D2/M2), / (C), 3 comparable repetitions each (15 runs), SITE unset, host 127.0.0.1:4321. Result: median FPS 59.3–60.0 (threshold 50), longTasks median 0, LoAF blocking median 0, worst FPS 46.5 (D1 rep1 cold) but median passes. Conclusion PASS. |
| Rollback boundary                                 | Exact files/behavior revertible without unrelated work: `e2e/scroll-trace.spec.ts`, `openspec/changes/visible-motion-scroll-trace/traces/summary.md`, `.gitignore` lines 38–40 (traces/* ignore), `openspec/changes/visible-motion-scroll-trace/tasks.md` checkboxes 3.1–4.2, `openspec/changes/visible-motion-scroll-trace/apply-progress.md` PR2 section. No paint CSS changed — rollback is deleting those files/lines.                                                                                                                                                                                                                   |

## Deviations from Design

None — implementation matches design.md, chosen.yaml, and runtime-motion/runtime-performance deltas. No new dependency, no redesign, preserved reduced-motion, fine+hover gating, transient will-change, native scroll, parallax gating. Trace uses Chromium/Playwright evidence (longtask, long-animation-frame, rAF frame interval) without claiming DevTools Performance trace blob, per design constraint. Paint gate respected: PASS → no blur/clip-path/fixed-layer change.

## Issues Found

None blocking. Prior SITE-gate build artifact leak fixed in PR1. Trace cold-start D1 rep1 46.5 fps (below median) is variance, not gate failure — median 59.3 passes. All 3 M runs at 6× throttling still 60 fps, confirming no fixed-layer jank at current scroll budget.

## Remaining Tasks

- [ ] 5.1 Before: `git ls-files .agents` = 26; `.gitignore` (read-only) whitelist.
- [ ] 5.2 `.gitignore` blanket `.agents/`; `git rm -r --cached .agents` (files stay). Remove `AGENTS.md` skill row; drop `docs/CODEBASE-GUIDE.md` portable-skill claim.
- [ ] 5.3 After: zero index `.agents`; `test -f .agents/skills/astro-framework/SKILL.md`. Rollback: whitelist + tracked tree + docs.

## Workload / PR Boundary

- Mode: stacked PR slice (PR2 of 4, PR1 feat/visible-motion-scroll-trace → PR #16, PR2 perf/visible-motion-scroll-trace → child) — correction scroll-trace-size-exception-validation
- Current work unit: Trace before paint + conditional paint gate (no paint) + size:exception record
- Boundary: feat/visible-motion-scroll-trace 81342e7 → e2e/scroll-trace.spec.ts + traces/summary.md + .gitignore + SDD 3.1–4.2; no product CSS/astro beyond harness.
- Review budget (actual): 885 = 848+37 (PR #17 feat...perf) vs 800 original (+85) — ceiling 900 via token sha256:0c1bd381eddb2404e56847239da69e9186db570b6acf83288d31848eb67cc184 → 885 ≤ 900 ✔. Breakdown ~637 harness +142 summary +6 gitignore +~92 progress +8 tasks. Cohesive gate (harness+summary atomic), one slicing pass, no code shaving. Maintainer "Aceptar size:exception" (Jonathan) — distinct from failed sha256:93340c0492f4bfbe2748879c3e706fa314cde4508e537bbddad1266ec92d7a36; parent settles --remediates-evidence-revision sha256:93340c0492f4bfbe2748879c3e706fa314cde4508e537bbddad1266ec92d7a36.

## Correction — Maintainer-Approved size:exception (scroll-trace-size-exception-validation)

- Token sha256:0c1bd381eddb2404e56847239da69e9186db570b6acf83288d31848eb67cc184 (max 900) remediates sha256:93340c0492f4bfbe2748879c3e706fa314cde4508e537bbddad1266ec92d7a36 — PR #17 perf/visible-motion-scroll-trace (base 81342e7) 885=848+37 vs 800 → ceiling 900 (885 ≤ 900).
- Why cohesive: D1/D2/M1/M2/C 3× rAF harness 637 + summary 142 + SDD/gitignore ~106 = atomic measure-before-paint; no cohesive split within 800 (one honest pass). Budget slices, never code.
- Maintainer approval: Jonathan "Aceptar size:exception" post-gate audit (native reset→acquire); parent owns settlement.
- Reviewer nav: e2e/scroll-trace.spec.ts → traces/summary.md → .gitignore/SDD; trace semantics and paint decisions untouched; scope guard: only apply-progress + PR body.
- New evidence revision: this file sha256 post-correction (distinct vs 933...); reported in commit/PR body.

## Verification Results

- format:check `oxfmt --check` → All matched (after `oxfmt` fix, summary.md formatted) — re-checked post-correction (see Correction Verification below)
- lint `oxlint` → 0 errors, 8 warnings (unicorn no-array-sort, complexity, underscore-dangle — non-blocking; prior 3 warnings + trace warnings)
- astro check → 0 errors, 0 warnings
- test:unit → 40/40 passed
- test:e2e isolated scroll-trace → 4/4 passed (839ms)
- test:e2e full → 62/62 passed (31.7s, includes 58 prior + 4 trace)
- build `SITE= pnpm build` → 7 pages, 11 images, 282ms
- rendered inspection: 1280 desktop — water-field veil, clip-panel, ProjectCard -2px fine+hover verified; 390 mobile — no horizontal overflow (e2e overflow test passes), coarse no lift via stylesheet gate; reduced-motion — opacity 1, transform none via e2e reduced tests; scroll-trace layers visually unoffset after revisit (persist opacity 250ms once)

## Correction Verification (proportional, scroll-trace-size-exception-validation)

- format:check targeted → `pnpm exec oxfmt --check -- openspec/changes/visible-motion-scroll-trace/apply-progress.md` → All matched; full `oxfmt --check` → All matched
- trace summary sha256:93340c0492f4bfbe2748879c3e706fa314cde4508e537bbddad1266ec92d7a36 unchanged; focused `playwright test e2e/scroll-trace.spec.ts` → 4/4; full `pnpm run test:e2e` → 62/62 (verified below)
- diff/stat proof → `git diff feat/visible-motion-scroll-trace --stat` → 5 files, 848+37=885 pre-correction; post-correction ≤900 (verified below); rollback: delete harness/summary/.gitignore lines, revert correction block.

## Next

Ready for correction commit + PR #17 body update via stack submit; parent settles with --remediates-evidence-revision sha256:93340c0492f4bfbe2748879c3e706fa314cde4508e537bbddad1266ec92d7a36. PR4 hygiene (size:exception) remains separate.
