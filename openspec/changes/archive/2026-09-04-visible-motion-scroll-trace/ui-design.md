# UI Design: visible-motion-scroll-trace

## Surfaces and mode

Six menu scenes + 404 share `BaseLayout`. Mode: `experience` (game-menu world) with `read` for dossier scan. Authority: `.sdd/changes/visible-motion-scroll-trace/design/chosen.yaml` (`inherit-existing`, balanced package). Root `DESIGN.md` / `PRODUCT.md` unchanged.

## Visual authority

`inherit`. No palette, type, clip, shadow, or composition change. No new identity, logo, or material. WaterField stays decorative veil (`aria-hidden`, image opacity 0.42).

## Confirmed direction / focal hierarchy

Unchanged: content column over field. Motion exists so a route change and panel arrival are **legible**, not spectacular. Focal sequence: 250ms page fade, then 24px / 620ms panel cascade (80ms stagger, `power3.out`). Continuity: persisted water/bg-words re-enter as opacity only (250ms), never a second spatial drift. Feedback: `/projects` dossier `ProjectCard` lifts `-2px` on fine+hover. Frequency: hover is cheap (150ms); navigation is occasional (250ms); entrance is authored once per load (620ms).

## Composition / layout

No layout delta. Do not restage scenes, add shared-element names, or slide routes. Index featured teasers stay color/chip controls without card lift.

## Type / color / material

Inherit. Lift uses transform only — no extra shadow, blur, or scale. Ghost-panel `backdrop-filter` is not a visual redesign target; paint isolation waits on the trace gate.

## Interaction / motion intent

- Route: documented Astro fade, 250ms, opacity only. Reduced motion: instant, no spatial route move.
- Panels: existing `[data-entrance]` nodes (inner panel bodies **and** dossier cards as today). Distance 24px so the cascade reads as staged, not a single fade.
- Cards: **only** `ProjectCard` on `/projects`. Coarse/touch keep chips and links; no hover-only dead affordance. Reduced: no lift.
- Ambient: first load may keep the existing bounded water scale; ClientRouter revisit is a short opacity breath, then still. No duplicate bubble/caustic setup.
- Scroll: native. Blocky feel is a measurement question, not a smooth-scroll restore.

## Responsive / adaptive

360/375/768/1280 unchanged. Lift media: `(hover:hover) and (pointer:fine)` only — 390-wide coarse emulation has no lift. Desktop 1280 shows lift.

## Required states

Reduced-motion: field and content readable and static; opacity/state remain. Persist back/forward: layers visually unoffset. Focus ring, SkipLink, and sticky nav chrome unchanged.

## Design-system delta

Add motion tokens that **encode the admitted numbers** (250 / 24 / 620 / 80 / `power3.out` / `-2px` / 150ms hover / 250ms re-entry). Do not retarget unrelated `--duration-med` (280ms) used elsewhere. No new component family.

## Comp / reference

`chosen.yaml` winner `inherit-existing`. Concept/comp rounds skipped. No generated image.

## UI verification

- Mid-navigation opacity in (0,1) at 250ms; reduced has no 250ms spatial fade.
- Panel in-flight sample before settle; reduced has no translate.
- Fine+hover `ProjectCard` `-2px`; coarse and reduced unmoved; teasers unlifted.
- Persist revisit: opacity re-entry once, no leftover transform.
- Rendered inherit at 360/375/768/1280; scroll traces are performance evidence, not a visual pass.
