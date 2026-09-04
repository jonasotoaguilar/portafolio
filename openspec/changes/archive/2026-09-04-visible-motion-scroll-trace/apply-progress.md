# Apply Progress: visible-motion-scroll-trace — PR1 Visible Motion + PR2 Trace (no paint) + PR4 Hygiene (`.agents/` untrack)

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

## Work Unit: PR4 Hygiene — untrack `.agents/` (this slice)

- Scope: tasks 5.1–5.3 (hygiene, no spec) — blanket `.agents/` ignore + `git rm --cached` + docs cleanup, stacked-to-main PR4
- Base: perf/visible-motion-scroll-trace (46795a1) — PR #17 draft
- Branch: chore/remove-tracked-agents (child of perf/visible-motion-scroll-trace, stacked-to-main)
- Attempt token: sha256:03650070564fc9db5c75aacb9b0c9abc3f51bdaa347f700d2fd0567e2ed46a6e; max 7000; parent owns settlement (no acquire/settle)
- Issue: N/A — repository-hygiene continuation; document N/A in PR linkage (no invented issue) — explicitly authorized as scoped hygiene
- Review budget: original 800 (PR1-2) / PR4 800; authorized ceiling 7000 via scoped `size:exception` (Jonathan explicitly authorized; deleting 26 tracked files ~6308 deletions cannot be coherently split)
- Evidence revision: not embedded — this file MUST NOT contain its own SHA-256 (a self-hash can never verify). The gate `evidence_revision` is the SHA-256 of the final committed bytes of this file, computed by the parent AFTER commit via read-back, and reported outside this file. Prior committed revision of this file (failed evidence): sha256:66fde97586fd076af06c9f5275e5b51594f51d66d387413475d479f6ea2d0f37 — remediated by the correction below.

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
- [x] 5.1 Before: `git ls-files .agents` = 26; `.gitignore` whitelist — verified pre-state
- [x] 5.2 `.gitignore` blanket `.agents/`; `git rm -r --cached .agents` (files stay); remove `AGENTS.md` skill row; drop `docs/CODEBASE-GUIDE.md` portable-skill claim
- [x] 5.3 After: zero index `.agents`; `test -f .agents/skills/astro-framework/SKILL.md` — rollback whitelist + tracked tree + docs

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

### PR4 Hygiene (this slice — `.agents/` untrack)

| Evidence                                          | Required value                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused test command and exact result             | `git ls-files .agents` → empty (0 entries, was 26); `test -f .agents/skills/astro-framework/SKILL.md` → exists (local preserved); `git check-ignore -v .agents/` → `.gitignore:30:.agents/` and `.agents/skills/astro-framework/SKILL.md` ignored — all pass                                                                                    |
| Runtime harness command/scenario and exact result | N/A Git/docs-only — no runtime boundary (build/tests prove no reliance on tracked skill files). Harness `pnpm run build` → 7 pages, 11 images, 318ms — passes without `.agents/` in index. Structural readback `git grep -l "\.agents" -- AGENTS.md docs/CODEBASE-GUIDE.md` → only ignore-policy line in AGENTS.md (allowed), docs clean        |
| Rollback boundary                                 | Exact files/behavior revertible without unrelated work: `git restore --staged .agents && git checkout HEAD -- .agents` + `.gitignore` whitelist ` .agents/*` + `!.agents/skills/...` (4 lines) + `AGENTS.md` skill row + `docs/CODEBASE-GUIDE.md` portable-skill block + `tasks.md` 5.1–5.3 + `apply-progress.md` PR4 section. No product code. |

## Deviations from Design

None — implementation matches design.md, chosen.yaml, and runtime-motion/runtime-performance deltas. No new dependency, no redesign, preserved reduced-motion, fine+hover gating, transient will-change, native scroll, parallax gating. Trace uses Chromium/Playwright evidence (longtask, long-animation-frame, rAF frame interval) without claiming DevTools Performance trace blob, per design constraint. Paint gate respected: PASS → no blur/clip-path/fixed-layer change.

## Issues Found

None blocking. Prior SITE-gate build artifact leak fixed in PR1. Trace cold-start D1 rep1 46.5 fps (below median) is variance, not gate failure — median 59.3 passes. All 3 M runs at 6× throttling still 60 fps, confirming no fixed-layer jank at current scroll budget.

## Remaining Tasks

None — 15/15 tasks complete (PR1 6 + PR2 6 + PR4 3). Ready for verify (`sdd-verify`) and archive (`sdd-archive`) via parent orchestrator.

## Workload / PR Boundary

- Mode: stacked PR slice (PR2 of 4, PR1 feat/visible-motion-scroll-trace → PR #16, PR2 perf/visible-motion-scroll-trace → child) — correction scroll-trace-size-exception-validation
- Current work unit: Trace before paint + conditional paint gate (no paint) + size:exception record
- Boundary: feat/visible-motion-scroll-trace 81342e7 → e2e/scroll-trace.spec.ts + traces/summary.md + .gitignore + SDD 3.1–4.2; no product CSS/astro beyond harness.
- Review budget (actual): 885 = 848+37 (PR #17 feat...perf) vs 800 original (+85) — ceiling 900 via token sha256:0c1bd381eddb2404e56847239da69e9186db570b6acf83288d31848eb67cc184 → 885 ≤ 900 ✔. Breakdown ~637 harness +142 summary +6 gitignore +~92 progress +8 tasks. Cohesive gate (harness+summary atomic), one slicing pass, no code shaving. Maintainer "Aceptar size:exception" (Jonathan) — distinct from failed sha256:93340c0492f4bfbe2748879c3e706fa314cde4508e537bbddad1266ec92d7a36; parent settles --remediates-evidence-revision sha256:93340c0492f4bfbe2748879c3e706fa314cde4508e537bbddad1266ec92d7a36.

## Workload / PR Boundary — PR4 Hygiene

- Mode: stacked PR slice (PR4 of 4, stacked-to-main) — `size:exception` scoped hygiene
- Current work unit: PR4 `.agents/` hygiene (tasks 5.1–5.3)
- Boundary: perf/visible-motion-scroll-trace 46795a1 → `chore/remove-tracked-agents` → `.gitignore` (1 insertion, 5 deletions) + `AGENTS.md` (1/3) + `docs/CODEBASE-GUIDE.md` (0/4 delete) + `.agents/**` deletions (0/6308) + `tasks.md` (3/3) + `apply-progress.md` (merged) — Git/docs only, no product motion/trace code
- Review budget (actual): 30 files changed, 5 insertions, 6323 deletions = 6328 changed lines (pre-apply-progress). With merged apply-progress ~+90/30, total ~6328–6400 → ceiling 7000 (Jonathan explicitly authorized scoped `size:exception`; deleting 26 tracked files cannot be coherently split; slicing would produce partial untrack breaking atomic invariant). Original budget 800; authorized ceiling 7000; actual ~6328+ within ceiling.
- Cohesion rationale: `git rm -r --cached .agents` is atomic — splitting deletions across PRs would leave partial `.agents/` tracked state plus mismatched `.gitignore` and docs; never compress code to fit budget (budget constrains slicing, not code)
- User approval: Jonathan explicitly authorized scoped `size:exception` for this hygiene PR (prompt: `size:exception` for 6,300 deletions, parent owns settlement, attempt token sha256:03650070564fc9db5c75aacb9b0c9abc3f51bdaa347f700d2fd0567e2ed46a6e, max 7000)

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

## Verification Results — PR4 Hygiene

- `git ls-files .agents` → 0 (was 26) ✔
- `test -f .agents/skills/astro-framework/SKILL.md` → exists ✔ (local preserved)
- `git check-ignore -v .agents/` → `.gitignore:30:.agents/` ✔
- `git check-ignore -v .agents/skills/astro-framework/SKILL.md` → `.gitignore:30:.agents/` ✔
- `git grep -n "\.agents" -- AGENTS.md docs/CODEBASE-GUIDE.md` → AGENTS.md:14 ignore-policy line only (allowed), CODEBASE clean ✔
- `pnpm run format:check` → All matched ✔
- `pnpm run lint` → 0 errors, 8 warnings (non-blocking) ✔
- `pnpm run check` → 0 errors ✔
- `pnpm run test:unit` → 40/40 ✔
- `pnpm run build` → 7 pages, 11 images, 318ms ✔ (no reliance on tracked skill files)
- `pnpm run test:e2e` → 62/62 passed (31.8s, controlled harness: fresh `pnpm build` 7 pages/331ms + pre-started `astro preview` daemon on 127.0.0.1:4321 reused via `reuseExistingServer`, HTTP 200 verified before run, daemon stopped after) ✔

## Correction Verification (proportional, scroll-trace-size-exception-validation)

- format:check targeted → `pnpm exec oxfmt --check -- openspec/changes/visible-motion-scroll-trace/apply-progress.md` → All matched; full `oxfmt --check` → All matched
- trace summary sha256:93340c0492f4bfbe2748879c3e706fa314cde4508e537bbddad1266ec92d7a36 unchanged; focused `playwright test e2e/scroll-trace.spec.ts` → 4/4; full `pnpm run test:e2e` → 62/62 (verified below)
- diff/stat proof → `git diff feat/visible-motion-scroll-trace --stat` → 5 files, 848+37=885 pre-correction; post-correction ≤900 (verified below); rollback: delete harness/summary/.gitignore lines, revert correction block.

## Correction — agents-hygiene-evidence-correction (gate-failure fix)

- Scope: STRICTLY gate-failure correction. No product code, no planning docs, no `.agents` local files touched. Only this file edited.
- Native rescope: `agents-hygiene-evidence-correction`; corrective token sha256:ff40182df14990184607751de6da92fa44c0b7e3086ad659482df7ecdb58af2b (parent settles with `--remediates-evidence-revision sha256:66fde97586fd076af06c9f5275e5b51594f51d66d387413475d479f6ea2d0f37`).
- Defect 1 (hash discipline): the prior revision of this file embedded `Evidence revision: sha256:1f86...` while its actual committed bytes hashed to sha256:66fde9... — a self-referential claim that can never verify. Fixed by removing the embedded self-hash (see PR4 Work Unit line above); the gate revision is computed post-commit outside this file.
- Defect 2 (full-E2E early exit): prior `pnpm run test:e2e` exited via `config.webServer exited early` despite focused suites passing. Diagnosis — two compounding causes, neither touching product behavior: (a) a stale `astro preview` daemon from an earlier session held 127.0.0.1:4321 (PID 31026, 53 min old; `reuseExistingServer: true` so Playwright reused a stale server); (b) Astro 7 `preview` daemonizes into background, so a Playwright-spawned `pnpm build && pnpm preview` foreground process exits immediately once the daemon is up, which Playwright reports as early exit. Proven: standalone `pnpm build` → 7 pages/322ms OK; manual `pnpm preview` → "Preview server already running (pid ...)" with foreground exit 0.
- Controlled harness (conflict-free, no config/product change): killed stale daemon (PID 31026) → port 4321 verified free → `astro preview stop` to clear registry → fresh `pnpm build` (7 pages, 331ms) → started preview daemon (HTTP 200 on 127.0.0.1:4321 verified via curl) → single `pnpm run test:e2e` reused the live server → `astro preview stop` after (port verified free). Full-suite invocations this session: one pre-diagnosis attempt (early exit under stale-harness collision) + this one controlled run.
- Result: `pnpm run test:e2e` → 62 passed (31.8s), exit 0.
- Re-proof (post-correction): `git ls-files .agents` → 0; local `.agents/skills/astro-framework/SKILL.md` exists; `git check-ignore -v` → `.gitignore:30:.agents/` for dir and nested skill file; `git grep "\.agents" -- AGENTS.md docs/CODEBASE-GUIDE.md` → only AGENTS.md:14 ignore-policy line (allowed); PR diff vs `perf/visible-motion-scroll-trace` → 51+/6327- = 6378 ≤ 7000 ceiling; `format:check` ✔ (61 files); `lint` 0 errors; `check` 0 errors; `test:unit` 40/40; `build` 7 pages.
- Rollback boundary: revert this file to its prior committed revision; no other file changed in this correction.

## Next

Ready for correction commit + PR #17 body update via stack submit; parent settles with --remediates-evidence-revision sha256:93340c0492f4bfbe2748879c3e706fa314cde4508e537bbddad1266ec92d7a36. PR4 hygiene (size:exception) remains separate.
