# Archive Report: Visible Motion Scroll Trace

## Change Archived

**Change**: visible-motion-scroll-trace
**Archived to**: `openspec/changes/archive/2026-09-04-visible-motion-scroll-trace/`
**Artifact store**: openspec
**Archive date**: 2026-09-04
**Archive slice**: branch `chore/visible-motion-scroll-trace-archive` (child of `chore/remove-tracked-agents`, stacked-to-main)

## Final State (Authoritative)

Per orchestrator final-state facts (outrank intermediate snapshots):

- PR #16 visible motion commit `81342e7`, draft, all checks passed.
- PR #17 trace commits `fdffe1d` + `46795a1`, draft, deterministic matrix PASS / no paint change, user-approved 900-line `size:exception`, 62/62 E2E.
- PR #18 hygiene commits `ddad13b` + `b786de6`, draft, `.agents` index empty / local files preserved / ignored / docs clean, user-approved 7000-line `size:exception`, controlled full E2E 62/62, final evidence hash `sha256:b941489b1e928bf19bdd35808bc0ffdcddb692bce09921a16d7d708b145c5f0e`.
- Final verify report: PASS WITH WARNINGS, 0 CRITICAL, 8/8 requirements, 21/21 scenarios (18 compliant, 3 partial), 40/40 unit, 62/62 E2E, build/check/lint/format pass, mutation typed N/A, evidence `sha256:bfb2a5feda4a353b568661ef612620c51fbbf15c52d8383bb8f584eda8869f85`.
- Task Completion Gate: persisted `tasks.md` 15/15 checked, 0 unchecked at archive time.

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| runtime-motion | Updated | 4 added (Visible Route Transition, Visible Panel Entrance, Fine Pointer Card Lift, Persisted Background Opacity Re-entry), 2 modified (Persist Teardown Before Swap, Smooth Scroll Does Not Compete With Navigation), 0 removed; 5 pre-existing requirements preserved; 9 requirements / 20 scenarios total |
| runtime-performance | Updated | 2 added (Scroll Trace Before Paint Optimization, Paint Change Is Trace-Gated And Single-Variable), 0 modified, 0 removed; 4 pre-existing requirements preserved; 6 requirements / 14 scenarios total |

### Source of Truth Updated

- `openspec/specs/runtime-motion/spec.md`
- `openspec/specs/runtime-performance/spec.md`

## Archive Contents

- proposal.md ✅
- specs/runtime-motion/spec.md ✅ (delta)
- specs/runtime-performance/spec.md ✅ (delta)
- design.md ✅
- tasks.md ✅ (15/15 tasks complete)
- apply-progress.md ✅
- verify-report.md ✅ (PASS WITH WARNINGS, 0 CRITICAL)
- exploration.md, preproposal.md, ui-design.md ✅ (supporting)
- traces/summary.md ✅ (trace PASS evidence)
- archive-report.md ✅ (this file, additive post-move)

## Warnings Preserved (Not Resolved by Archive)

Archive changes no product code and claims no warning resolved:

1. Route fade E2E assertion has fallback OR (`has250 || fadeDurationOk || htmlHasFade`); chrome-devtools in-flight sample showed `htmlOpacity: "1"` — 250ms fade not isolated in that sample. Classified PARTIAL, not UNTESTED.
2. Card lift test injects `.project-card.is-hover-sim` CSS when headless `:hover` is flaky; stylesheet `(hover: hover) and (pointer: fine)` gate + `-2px` proven. Classified PARTIAL.
3. Persist re-entry assertion has fallback OR (`has250Reentry || opacityOk`); 250ms tween not isolated in CDP (caustic 22000ms drift). Classified PARTIAL.
4. Design `@theme` MOTION mirror missing — CSS uses equivalent literals (`24px`, `150ms`) without an `@theme` seam. Specs still hold.
5. Mutation unmeasured — no mutation-testing framework in repo; typed N/A (framework absent), not fabricated PASS.
6. Astro 7 preview needs controlled pre-start/cleanup — preview daemonizes; Playwright-spawned foreground exits early. Use the controlled harness (free port → fresh build → pre-started daemon reused → stop after).
7. `waitForTimeout` remains in `interaction.spec.ts` (SUGGESTION only); 21 oxlint warnings non-blocking.

## Follow-ups (Not Started)

- Replace `waitForTimeout` in visible-motion E2E with deterministic `waitForFunction`.
- Consider an `@theme` MOTION mirror if token drift becomes a risk.
- Re-measure scroll trace before any future blur/clip/fixed-layer paint work (trace-gate is now canonical spec).

## Mechanical Verification

- Archive move performed via shell (`git mv` fallback to `mv` for untracked source) with pre-move recursive snapshot; mandatory `diff -r` readback empty (no differences) — byte identity preserved.
- Active `openspec/changes/` no longer contains `visible-motion-scroll-trace`.
- No CRITICAL findings in verify-report; archive proceeds with warnings recorded above.
- No product code touched by this archive slice (docs/spec-move only).
