# Design: Visible Motion Scroll Trace

## Technical Approach

Calibrate existing GSAP + `ClientRouter` to the closed balanced package (`chosen.yaml`). Specs: `runtime-motion` (visible fade/entrance/lift/re-entry; preserved teardown; no global smooth) and `runtime-performance` (trace first; paint only if the gate fails). No new identity or dependency. SEO/contact/privacy untouched.

## Architecture Decisions

| Decision            | Options                                                   | Tradeoff             | Choice                                                                                                                                                                                                     |
| ------------------- | --------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 250ms route fade    | Undocumented `ClientRouter` props vs `fade({ duration })` | Guess vs docs        | `import { fade } from "astro:transitions"`; `<html transition:animate={fade({ duration: "250ms" })}>`. Keep `<ClientRouter />`. No slide.                                                                  |
| Token ownership     | GSAP literals vs CSS-only vs shared module                | Drift vs one seam    | `src/scripts/motion-tokens.ts` exports `MOTION`; `@theme` mirrors; GSAP and tests consume `MOTION`.                                                                                                        |
| In-flight salience  | Screenshots / `waitForTimeout` vs discriminator           | Flake vs fail-closed | `waitForFunction` returns `"mid"` if opacity∈(0,1) or non-identity transform **before** `is-entrance-visible`; `"late"` if complete first. Route: `getAnimations()` duration 250, `playState==="running"`. |
| Card lift target    | Every `.clip-panel` vs teasers vs `ProjectCard`           | Blind vs dossier     | Only `ProjectCard.astro` (class `project-card`). Not `ClippedPanel`, not index teasers.                                                                                                                    |
| Ambient revisit     | Full ambient vs static vs opacity-only                    | Stale vs freeze      | After `killAll`, one 250ms opacity tween on persisted water/caustic/bg-words. No scale/x. Per-load flag; reset on `destroyMotion`.                                                                         |
| Scroll paint        | Tune blur now vs measure-first                            | Speculation          | Trace first. If gate fails, one attributed variable only.                                                                                                                                                  |
| Hover `will-change` | Stylesheet vs none                                        | MDN standing-hint    | None. `-2px` CSS transform only.                                                                                                                                                                           |

## Data Flow

```
click → ClientRouter
      → astro:before-swap → destroyMotion/killAll
      → html fade 250ms (documented fade())
      → persist WaterField + bg-words
      → astro:page-load → initMotion
            ├ reduced? instant opacity, no transform
            ├ [data-entrance] from MOTION (y24, 0.62s, stagger 0.08, power3.out)
            ├ first-load ambient: existing setup
            └ persisted: opacity re-entry 250ms once
fine+hover → .project-card:hover translateY(-2px)
scroll → native (no html { scroll-behavior: smooth })
```

## File Changes

| File                                | Action | Description                                                                                               |
| ----------------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| `src/scripts/motion-tokens.ts`      | Create | `MOTION` numbers below                                                                                    |
| `src/scripts/motion-tokens.test.ts` | Create | RED if CSS or GSAP literals disagree                                                                      |
| `src/scripts/motion.ts`             | Modify | Use `MOTION`; opacity re-entry + once-flag                                                                |
| `src/layouts/BaseLayout.astro`      | Modify | `fade({ duration: "250ms" })` on `<html>`                                                                 |
| `src/styles/global.css`             | Modify | Tokens; entrance `translateY(24px)`; `.project-card` lift in fine+hover and not reduced; no global smooth |
| `src/components/ProjectCard.astro`  | Modify | `project-card`; remove `transition-delay` (delays hover)                                                  |
| `e2e/interaction.spec.ts`           | Modify | In-flight, lift, re-entry; keep final-state/will-change/parallax/persist                                  |
| `e2e/scroll-trace.spec.ts`          | Create | Procedure, not an FPS CI gate                                                                             |
| `.gitignore`                        | Modify | Ignore traces except `summary.md`                                                                         |

No change: `WaterField.astro` HTML, `ClippedPanel.astro`, teasers, Head/SEO/contact, root `DESIGN.md`/`PRODUCT.md`.

## Interfaces / Contracts

```ts
export const MOTION = {
  routeFade: "250ms",
  entranceY: 24,
  entranceDuration: 0.62,
  entranceStagger: 0.08,
  ease: "power3.out",
  ambientReentry: 0.25,
  cardLift: -2,
  cardLiftMs: 150,
} as const;
```

In-flight: `"mid" | "late"` — `"late"` fails. Gate: median FPS < 50 or >2 long tasks on ghost/clip/fixed in 2/3 runs → one candidate on the attributed layer: ghost blur isolation, `contain: paint` on `.water-field`, or `.bg-word` isolation. Else no paint change.

## Testing Strategy

TDD: RED tokens + discriminator + lift + re-entry + 250ms fade → GREEN.

| Layer        | What                                                                                                                                                       | Approach                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Unit         | `MOTION` ↔ CSS; no `18/0.55/0.06`                                                                                                                          | Vitest                                                                           |
| E2E salience | Mid cannot pass on settle; reduced no translate; coarse no lift; persist opacity-only                                                                      | `waitForFunction` / `getAnimations`; no screenshots/`waitForTimeout`             |
| E2E retained | Final opacity, transient `will-change`, parallax, persist, no global smooth                                                                                | Existing specs                                                                   |
| Browser perf | D1 `/projects` 1280×800; D2 `/experience` 1280×800; M1/M2 390×800 coarse; C `/` 1280. Fresh + ClientRouter (`/about` then Back). 3×. CPU 4×/6×. SITE unset | chrome-devtools or Playwright CDP; commit `traces/summary.md`. Salience ≠ frames |

## Threat Matrix

N/A — no new routing, shell, subprocess, VCS/PR, executable-file, or process-integration boundary.

## Migration / Rollout

None. Motion may ship without paint. Paint only after failing gate and one-variable re-measure.

## Open Questions

None
