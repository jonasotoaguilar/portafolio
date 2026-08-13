# Proposal: Persona UI/UX Remediation

## Intent

Remediate the game-shell UI toward the verified Persona-3-like target (blue/cyan/white, angular, oversized abstract figure, centered diagonal menu, bottom-right controls) and fix the documented-but-missing keyboard active indicator. Original assets only — no copyrighted Persona art, fonts, or audio.

## Scope

### In Scope

1. Recompose shell/home: centered/center-right diagonally staggered menu + ORIGINAL abstract silhouette figure + layered angular artifacts over the existing animated atmosphere.
2. Persistent colorful active treatment follows keyboard navigation (`data-active` + `aria-current`); visible focus never disappears; real links and `:focus-visible` semantics kept.
3. Keyboard/control guidance moves to a non-overlapping bottom-right cluster across relevant views.
4. Ambient-audio capability: keyboard-accessible mute toggle, localStorage persistence, gesture-unlocked playback, `preload="none"`, reduced-distraction behavior, BYO licensed-track contract, graceful no-track state. No bundled Persona soundtrack.
5. Coherent-system audit/remediation of `projects`, `about`, `skills`, `contact` (+ resume where applicable).
6. PRD.md / DESIGN.md / ARCHITECTURE.md / setup docs updated in later phases.
7. Preserve: static routes, progressive enhancement, reduced motion, coarse-pointer behavior, <100KB gz JS/route, zero-JS readability.

### Out of Scope

- Bundled music/SFX, character art, game fonts (copyright).
- New dependencies; 400ms motion envelope unchanged.
- Backend/API work.

## Capabilities

### New Capabilities

- `ambient-audio`: BYO-licensed background-music contract — mute toggle, persistence, gesture unlock, no-track state.

### Modified Capabilities

- `persona-navigation`: persistent colorful indicator; bottom-right hints cluster; centered diagonal composition; keyboard/no-scroll contracts unchanged.
- `living-background`: decorative vector figures/artifacts layer (static, `aria-hidden`).
- `portfolio-page`: coherent view treatment across routes.

## Approach

Exploration order, by leverage: (1) active-indicator fix in `shell.ts` + CSS; (2) centered diagonal menu via per-item config in `GameMenu.astro` (zero-JS transforms); (3) bottom-right hints; (4) original inline SVG/CSS figure layer; (5) audio island with `preload="none"`, gesture unlock, `public/audio/README.txt` BYO contract. Design-ui owns figure direction, indicator styling, cluster placement.

## Affected Areas

| Area | Impact |
|------|--------|
| `src/components/game/GameMenu.astro` | Modified — composition, indicator markup |
| `src/scripts/shell.ts`, `src/lib/menu/keys.ts` | Modified — active state toggle |
| `src/components/game/KeyHints.astro`, `ViewHeader.astro` | Modified — bottom-right cluster |
| `src/components/Background.astro`, `global.css` | Modified — figures layer |
| new `src/components/game/` audio island | New — mute toggle, unlock |
| `public/audio/README.txt` | New — BYO instructions |
| `tests/e2e/*`, `tests/unit/*` | Modified — indicator, audio, budget, motion |
| `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, docs | Later phases |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Copyright infringement via ripped assets | High (if ignored) | Original vector art; BYO audio; nothing copied |
| Visual fidelity unverifiable by this model | Med | Vision-capable verification before apply |
| Autoplay policy blocks audio | Med | Gesture unlock; silent default |
| Budget/a11y regression | Low | Extended e2e budget + motion + keyboard specs |

## Rollback Plan

`git revert` the change PR. No schema/migrations; audio state is localStorage-only. Figures layer is additive CSS/SVG — removing it restores the prior composition.

## Dependencies

None external. Existing stack only: Tailwind 4, motion, Astro islands.

## Success Criteria

- [ ] Keyboard-active shell item shows a persistent colorful indicator; `aria-current` asserted in e2e.
- [ ] Menu centered/diagonal-staggered; figures static under reduced motion.
- [ ] Hints + mute control form a non-overlapping bottom-right cluster; toggle keyboard-operable and persistent.
- [ ] No track → graceful no-track state; with user track → gesture-unlocked fade playback.
- [ ] All routes coherent; <100KB gz JS per route and zero-JS readability pass.
