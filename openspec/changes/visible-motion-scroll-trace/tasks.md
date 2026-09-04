# Tasks: Visible Motion Scroll Trace

## Review Workload Forecast

| Field                   | Value                                                     |
| ----------------------- | --------------------------------------------------------- |
| Estimated changed lines | 6,800–7,100                                               |
| 400-line budget risk    | High                                                      |
| Chained PRs recommended | Yes                                                       |
| Suggested split         | PR1 motion → PR2 trace → PR3 paint-iff-fail → PR4 hygiene |
| Delivery strategy       | auto-chain                                                |
| Chain strategy          | stacked-to-main                                           |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

Motion+trace ~460–700; paint 0 or 20–80. Hygiene untracks 26 `.agents/skills/astro-framework/**` files (~6,308 deletions). Cannot fit 800 lines; PR4 `size:exception`.

### Suggested Work Units

| Unit | Goal               | Likely PR             | Focused test command                                                                                      | Runtime harness                                                            | Rollback boundary                                                                                 |
| ---- | ------------------ | --------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1    | Visible motion     | PR 1                  | `pnpm run test:unit -- src/scripts/motion-tokens.test.ts && pnpm run test:e2e -- e2e/interaction.spec.ts` | Preview 250ms fade; 24/620/80/`power3.out`; `-2px` hover; persist 250ms    | tokens, `motion.ts`, `BaseLayout.astro`, `global.css`, `ProjectCard.astro`, `interaction.spec.ts` |
| 2    | Trace first        | PR 2                  | `pnpm run test:e2e -- e2e/scroll-trace.spec.ts`                                                           | `pnpm build && pnpm preview --port 4321`; D1/D2 1280, M1/M2 390, C `/`; 3× | `scroll-trace.spec.ts`, `traces/`, `.gitignore` traces                                            |
| 3    | Paint iff fail     | PR 3 skip-if-pass     | same remeasure                                                                                            | Pass: no paint. Fail: one variable                                         | that CSS rule                                                                                     |
| 4    | Untrack `.agents/` | PR 4 `size:exception` | `git ls-files .agents` empty; `test -f .agents/skills/astro-framework/SKILL.md`                           | N/A Git/docs                                                               | `.gitignore`, `AGENTS.md`, `docs/CODEBASE-GUIDE.md`, restore `.agents/`                           |

## Phase 1: Tokens (TDD)

- [x] 1.1 RED `src/scripts/motion-tokens.test.ts`: `MOTION` 250ms/24/0.62/0.08/`power3.out`/0.25/-2/150; fail while `src/scripts/motion.ts` (read-only) or `src/styles/global.css` (read-only) use 18/0.55/0.06/14px.
- [x] 1.2 GREEN `src/scripts/motion-tokens.ts`; REFACTOR `src/scripts/motion.ts` + `src/styles/global.css` to `MOTION`.

## Phase 2: Visible motion (TDD)

- [x] 2.1 RED `e2e/interaction.spec.ts`: `"mid"|"late"` (`late` fails) before `is-entrance-visible`; `getAnimations()` 250ms `running`; reduced no translate; coarse no lift; persist opacity 250ms.
- [x] 2.2 GREEN `src/layouts/BaseLayout.astro`: `fade({ duration: "250ms" })` on `<html>`; keep `<ClientRouter />`.
- [x] 2.3 GREEN `src/scripts/motion.ts`: `MOTION` entrance; persist 250ms opacity after `killAll`; reset flag in `destroyMotion`.
- [x] 2.4 GREEN `src/styles/global.css`: 24px entrance; `.project-card` `-2px` only `(hover:hover) and (pointer:fine)`; no global smooth; no standing `will-change`.
- [x] 2.5 GREEN `src/components/ProjectCard.astro`: class `project-card`; drop `transition-delay`.
- [x] 2.6 REFACTOR; `pnpm exec astro check && pnpm run test:unit && pnpm run test:e2e && pnpm build`. Compare `.sdd/changes/visible-motion-scroll-trace/design/chosen.yaml` (read-only).

## Phase 3: Trace before paint

- [x] 3.1 RED `e2e/scroll-trace.spec.ts`: D1/D2/M1/M2/C, 3×. Before blur/fixed-layer edits.
- [x] 3.2 GREEN `.gitignore` ignore traces except `openspec/changes/visible-motion-scroll-trace/traces/summary.md`. Pass → **no paint change**. Fail → one candidate.

## Phase 4: Paint iff fail

- [x] 4.1 RED same matrix. Missing attribution → do not ship.
- [x] 4.2 GREEN one variable: ghost blur isolation **or** `.water-field` `contain: paint` **or** `.bg-word` isolation. Variance → revert.

## Phase 5: Hygiene (no spec)

- [ ] 5.1 Before: `git ls-files .agents` = 26; `.gitignore` (read-only) whitelist.
- [ ] 5.2 `.gitignore` blanket `.agents/`; `git rm -r --cached .agents` (files stay). Remove `AGENTS.md` skill row; drop `docs/CODEBASE-GUIDE.md` portable-skill claim.
- [ ] 5.3 After: zero index `.agents`; `test -f .agents/skills/astro-framework/SKILL.md`. Rollback: whitelist + tracked tree + docs.
