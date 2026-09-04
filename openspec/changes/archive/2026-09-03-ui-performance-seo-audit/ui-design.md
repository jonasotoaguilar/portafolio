# UI Design: ui-performance-seo-audit

## Surfaces and mode

All six menu scenes plus 404, Footer, and persisted WaterField/bg-words. Mode: `read` / `experience`. Admission: inherit on every surface. Authority: `.sdd/changes/ui-performance-seo-audit/design/chosen.yaml` (`inherit-existing`). Root `DESIGN.md` unchanged.

## Visual authority

Inherit the Persona 3 light submerged world: canvas cyan/white/ink, clipped panels, ink offset shadows, water-field veil. No new palette, type, clip, radius, or composition. Do not restyle SiteNav, chips, or panel grammar.

## Focal hierarchy

Unchanged: content column over decorative field. WaterField stays background (`aria-hidden`, veil opacity 0.42). It must not read as the page’s primary image.

## Interaction / motion intent

LinkedIn becomes a real control using the existing GitHub/email chrome — solid ink border, same hover invert/underline — not the current dashed non-link. Footer LinkedIn uses the same underline treatment as GitHub. `target="_blank"` with `rel` including `me`.

About primary next-action stays the ghost-panel row control; only destination and label change (Contact, not Experience). Keep the existing uppercase ink-border button. The in-body Contact text link may remain secondary.

Motion stays the current subtle system: entrance `y`/opacity, water scale, caustic/bubble drift, fine-pointer parallax. No new choreography, view-transition names, or duration tokens. Reduced motion: field and content static and readable; no translation, drift, or parallax. Persist layers must return visually unoffset after back/forward.

Skip-to-content and route restoration stay instantaneous — no site-wide smooth scroll.

## Responsive / states

Same breakpoints (360/375/768/1280). LinkedIn links wrap like email (`break-all` where that pattern already exists). Contact three-up grid unchanged.

## Design-system delta

None. No token, component, or identity change.

## Comp / reference

`chosen.yaml` winner `inherit-existing`. No generated comp.

## UI verification

Rendered inherit at 360/375/768/1280; reduced-motion static field; ClientRouter persist unoffset; LinkedIn matches GitHub affordance; About CTA still reads as the scene’s next action; WaterField not visually competing as hero.
