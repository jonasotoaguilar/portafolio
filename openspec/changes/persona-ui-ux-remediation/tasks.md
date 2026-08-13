# Tasks: Persona UI/UX Remediation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 1300–1600 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → … → PR 8 |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

Commits map 1:1 to units, conventional commits, tests/docs with their unit.

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Active/focus indicator | PR 1 | `pnpm test:e2e keyboard.spec.ts` | `astro dev --background`; ArrowDown walk | Revert `shell.ts`/`GameMenu.astro`/`global.css` active rules |
| 2 | Diagonal staggered menu | PR 2 | `pnpm test:e2e keyboard.spec.ts` | dev server; 1024px + coarse emulation | Revert menu config + `.menu-item` CSS |
| 3 | Bottom-right ControlCluster | PR 3 | `pnpm test:e2e views.spec.ts` | dev server; desktop + touch viewport | Remove `ControlCluster.astro` + `BaseLayout` wiring |
| 4 | FigureLayer across routes | PR 4 | `pnpm test:e2e reduced-motion.spec.ts` | dev server; reduced-motion emulation | Remove `FigureLayer.astro` + route CSS |
| 5 | Audio reducer + control | PR 5 | `pnpm test:unit audio-state.test.ts` | N/A — pure reducer, no browser surface | Revert `state.ts` + unit test |
| 6 | Audio DOM wiring + e2e | PR 6 | `pnpm test:e2e ambient-audio.spec.ts` | dev server with/without `public/audio/background.mp3` | Revert `ambient-audio.ts` + `AudioControl` wiring |
| 7 | Budget + regression e2e | PR 7 | `pnpm test:unit && pnpm test:e2e` | `pnpm build` + preview; JS-off | Revert spec extensions |
| 8 | Docs refresh | PR 8 | `pnpm lint` | N/A — docs only | Revert doc files |

## Phase 1: Active/Focus Indicator (defect first)

- [x] 1.1 RED — `tests/e2e/keyboard.spec.ts`: ArrowDown moves `data-active`+`aria-current`; `:focus-visible` outline stays visible
- [x] 1.2 GREEN — `src/scripts/shell.ts`: set `data-active`+`aria-current` on init/move; clear on teardown
- [x] 1.3 GREEN — `src/components/game/GameMenu.astro`: `data-menu-item` markup + hover hooks
- [x] 1.4 GREEN — `src/styles/global.css`: accent-400 text, clip-path accent layer, 2px cyan bar, hover mirror, 150ms; never suppress `:focus-visible`
- [x] 1.5 Verify — `pnpm test:e2e keyboard.spec.ts`

## Phase 2: Diagonal Staggered Menu

- [x] 2.1 RED — `keyboard.spec.ts`: centered/center-right stagger, non-overlap ≥1024px; coarse collapse, ≥44px targets
- [x] 2.2 GREEN — `GameMenu.astro`: per-item `--item-x`/`--item-skew`/`--item-size` (design AD1 offsets)
- [x] 2.3 GREEN — `global.css`: `.menu-item` var rule; 768–1023px half offsets −4°; <768px/coarse collapse
- [x] 2.4 Verify — e2e pass

## Phase 3: Control Cluster

- [x] 3.1 RED — `tests/e2e/views.spec.ts`: fixed bottom-right cluster, no desktop overlap
- [x] 3.2 RED — coarse pointer: hints hidden, mute reachable ≥44px
- [x] 3.3 GREEN — create `src/components/game/ControlCluster.astro` (KeyHints + AudioControl slot, `transition:persist`)
- [x] 3.4 GREEN — `KeyHints.astro`/`ViewHeader.astro`: content-only trim
- [x] 3.5 GREEN — `BaseLayout.astro`: render cluster; `global.css`: position + hide rules (max-height 560px, pointer-coarse)
- [x] 3.6 Verify — e2e pass

## Phase 4: Figure Layer

- [x] 4.1 RED — `reduced-motion.spec.ts`: figures `aria-hidden`/`pointer-events-none`, static under reduce
- [x] 4.2 GREEN — create `src/components/FigureLayer.astro`: original SVG polygons per route, no copied art
- [x] 4.3 GREEN — `BaseLayout.astro`: render; `global.css`: `html[data-route]` variant placements (shell/projects/skills/about/contact/resume/404)
- [x] 4.4 Verify — e2e pass

## Phase 5: Ambient Audio

- [ ] 5.1 RED — create `tests/unit/audio-state.test.ts`: `no-track→ready⇄playing⇄muted`, `audio-error`→no-track terminal, restore
- [ ] 5.2 GREEN — `src/lib/audio/state.ts` pure reducer
- [ ] 5.3 GREEN — create `src/components/game/AudioControl.astro`: `<audio loop preload="none">`, `aria-pressed` button, disabled no-track state
- [ ] 5.4 RED — create `tests/e2e/ambient-audio.spec.ts`: no-track, gesture gate, toggle, persistence, nav survival, no re-probe
- [ ] 5.5 GREEN — `src/scripts/ambient-audio.ts`: HEAD probe once (in-flight guard, stash on persisted cluster, abort on `astro:before-swap`), one-time gesture unlock, 400/200ms fades, try/catch storage
- [ ] 5.6 GREEN — `public/audio/README.txt`: BYO licensed-track contract
- [ ] 5.7 Verify — `pnpm test:unit && pnpm test:e2e ambient-audio.spec.ts`

## Phase 6: Regression Verification

- [ ] 6.1 RED — `budget.spec.ts`: <100KB gz/route including audio + figure scripts
- [ ] 6.2 RED — `views.spec.ts`: `aria-current`/`data-active`, figure `aria-hidden`, keyboard mute
- [ ] 6.3 Verify — `pnpm test:unit && pnpm test:e2e && pnpm build`

## Phase 7: Documentation

- [ ] 7.1 `PRD.md` — remediated system acceptance criteria/UX
- [ ] 7.2 `DESIGN.md` — menu, indicator, figure, cluster, audio (run `scripts/validate-design-md.sh`)
- [ ] 7.3 `ARCHITECTURE.md` — component details, failure modes, migration notes
- [ ] 7.4 `README.md` refresh (stale landing), `docs/CODEBASE-GUIDE.md` + `docs/codebase/mental-model.md`, setup/audio docs
