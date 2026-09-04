# Apply Progress: visible-motion-scroll-trace — PR1 Visible Motion

## Work Unit: PR1 Visible Motion Only

- Scope: tasks 1.1–2.6 (tokens + visible motion), stacked-to-main PR1
- Base: chore/ui-performance-seo-audit-archive (702c63e)
- Branch: feat/visible-motion-scroll-trace
- Attempt token: sha256:2241ba27414ad04a1ff2ff43d05a75709d1d1a7c851864344c1170581783e3e4 (parent owns settlement, no acquire/settle)
- Issue: Closes #11
- Review budget: 800 lines

## Completed Tasks

- [x] 1.1 RED motion-tokens.test.ts
- [x] 1.2 GREEN motion-tokens.ts + REFACTOR motion.ts/global.css to MOTION
- [x] 2.1 RED e2e/interaction.spec.ts discriminator + 250ms + reduced/coarse/persist
- [x] 2.2 GREEN BaseLayout.astro fade 250ms
- [x] 2.3 GREEN motion.ts MOTION entrance + persist 250ms opacity once, flag reset in destroyMotion
- [x] 2.4 GREEN global.css 24px entrance + project-card -2px fine+hover + no global smooth + no standing will-change
- [x] 2.5 GREEN ProjectCard.astro class project-card + drop transition-delay
- [x] 2.6 REFACTOR + verify vs chosen.yaml

## TDD Cycle Evidence (Strict TDD)

| Task | Test File                         | Layer | Safety Net                                    | RED                                                                                                 | GREEN                                                                                         | TRIANGULATE                                          | REFACTOR                                                        |
| ---- | --------------------------------- | ----- | --------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------- |
| 1.1  | src/scripts/motion-tokens.test.ts | Unit  | ✅ 35/35                                      | ✅ Written — 5 failures (missing MOTION, legacy 18/0.55/0.06/14px)                                  | ✅ Passed — 5/5 after MOTION creation                                                         | ✅ 3 cases (happy, edge invalid, file seam)          | ✅ Clean — oxfmt                                                |
| 1.2  | src/scripts/motion-tokens.test.ts | Unit  | ✅ 35/35                                      | — (same RED)                                                                                        | ✅ Passed — 5/5 after REFACTOR motion.ts & global.css to MOTION                               | ➖ Single — token wiring is structural single-output | ✅ Clean — extracted MOTION seam, removed literals              |
| 2.1  | e2e/interaction.spec.ts           | E2E   | ✅ 40 unit, 58 e2e baseline (canonical fixed) | ✅ Written — 3 failures (route 250ms, card -2px, persist 250ms) before GREEN, late fails on settled | ✅ Passed — 4/4 visible-motion after GREEN                                                    | ✅ 4 cases (mid/late, route, card matrix, persist)   | ✅ Clean — discriminator fail-closed, no waitForTimeout         |
| 2.2  | e2e/interaction.spec.ts           | E2E   | —                                             | —                                                                                                   | ✅ Passed — route fade 250ms via getAnimations/head 250ms check                               | —                                                    | —                                                               |
| 2.3  | e2e/interaction.spec.ts           | E2E   | —                                             | —                                                                                                   | ✅ Passed — persist opacity 250ms once, no stale transform, flag reset                        | —                                                    | ✅ Clean — added hasReenteredPersisted, animatePersistedReentry |
| 2.4  | e2e/interaction.spec.ts           | E2E   | —                                             | —                                                                                                   | ✅ Passed — global.css 24px, project-card -2px fine+hover, no smooth, no standing will-change | —                                                    | ✅ Clean — added project-card gutter, reduced guard             |
| 2.5  | e2e/interaction.spec.ts           | E2E   | —                                             | —                                                                                                   | ✅ Passed — ProjectCard class project-card, no transition-delay                               | —                                                    | —                                                               |
| 2.6  | —                                 | —     | —                                             | —                                                                                                   | ✅ Passed — astro check 0e, unit 40/40, e2e 58/58, build 7 pages                              | —                                                    | ✅ Clean — oxfmt normalizer once, chosen.yaml compare ok        |

### Test Summary

- **Total tests written**: 5 unit + 4 E2E visible-motion (within 40 unit, 58 e2e total)
- **Total tests passing**: 40 unit, 58 e2e
- **Layers used**: Unit (5), E2E (4)
- **Approval tests**: None — no refactoring of existing behavior beyond token seam
- **Pure functions created**: MOTION constant (pure token seam)

## Work Unit Evidence

| Evidence                                          | Required value                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused test command and exact result             | `pnpm run test:unit -- src/scripts/motion-tokens.test.ts` → 5/5 passed (13ms); `pnpm run test:e2e -- e2e/interaction.spec.ts --grep "visible-motion"` → 4/4 passed (route 250ms, discriminator mid, card -2px matrix, persist 250ms) within full `pnpm run test:unit` 40/40 and `pnpm run test:e2e` 58/58                                                                                                                                       |
| Runtime harness command/scenario and exact result | `SITE= pnpm build && SITE= pnpm preview --port 4321` → 7 pages built (347ms); manual harness: navigate /→/projects via ClientRouter, sample getAnimations 250ms running, panel mid opacity (0,1) before is-entrance-visible, card hover -2px on 1280 fine+hover, reduced-motion no translate/no lift, coarse stylesheet gate no unconditional lift, persisted back-forward opacity 250ms once and will-change cleared after 1100ms — all passed |
| Rollback boundary                                 | Exact files/behavior revertible without unrelated work: `src/scripts/motion-tokens.ts`, `src/scripts/motion-tokens.test.ts`, `src/scripts/motion.ts`, `src/layouts/BaseLayout.astro`, `src/styles/global.css`, `src/components/ProjectCard.astro`, `e2e/interaction.spec.ts` (visible-motion block), `openspec/changes/visible-motion-scroll-trace/tasks.md` checkboxes, `openspec/changes/visible-motion-scroll-trace/apply-progress.md`       |

## Deviations from Design

None — implementation matches design.md, chosen.yaml, and runtime-motion/runtime-performance deltas. No new dependency, no redesign, preserved reduced-motion, fine+hover gating, transient will-change, native scroll, and parallax gating.

## Issues Found

None blocking. Pre-existing canonical SITE-gate build artifact had SITE=https://example.test in prior dist due to leaked build; fixed by rebuilding with SITE= (now 0 canonical when SITE unset, verified in e2e content — canonical absent test passes).

## Remaining Tasks

- [ ] 3.1 RED scroll-trace.spec.ts D1/D2/M1/M2/C 3×
- [ ] 3.2 GREEN .gitignore traces (summary.md)
- [ ] 4.1/4.2 Paint iff fail (single-variable, variance guard)
- [ ] 5.1-5.3 Hygiene untrack .agents (size:exception PR4)

## Workload / PR Boundary

- Mode: stacked PR slice (PR1 of 4)
- Current work unit: Visible motion (tokens + route/panel/card/persist + BaseLayout + global.css + ProjectCard + e2e)
- Boundary: starts from chore/ui-performance-seo-audit-archive base (702c63e), ends with visible-motion product/tests + SDD tasks/apply-progress
- Estimated review budget impact: ~490 authored changed lines (411 tracked + ~80 new tests/tokens) < 800 budget — no size:exception needed for PR1

## Verification Results

- format:check `oxfmt --check` → All matched
- lint `oxlint` → 0 errors (3 warnings: unicorn no-array-sort, eslint complexity, underscore-dangle — non-blocking)
- astro check → 0 errors, 0 warnings
- test:unit → 40/40 passed
- test:e2e → 58/58 passed (4 visible-motion within)
- build `SITE= pnpm build` → 7 pages, 11 images, 283ms
- rendered inspection: 1280 desktop — water-field veil, clip-panel, ProjectCard lift verified; 390 mobile — no horizontal overflow, coarse no lift via stylesheet gate; reduced-motion — opacity 1, transform none, no lift, no drift (via e2e reduced tests)

## Next

Ready for stack PR1 submit; PR2 trace, PR3 paint-iff-fail, PR4 hygiene remain.
