# ADR-0005: Owner-Created Persona/Sprite Assets with Provenance Register over External Asset Sets

## Status

Accepted

## Date

2026-08-13

## Deciders

Jonathan Soto (jonasotoaguilar)

## Context

The reference-driven view redesign introduces photographic-style visual assets — principal persona images and decorative sprites — where the existing system was pure inline-SVG geometry. Jona holds a set of owner-created PNGs (`assets/persona` 11 files, `assets/sprites` 14 files — renamed from `assets/icon`, no alias/symlink/fallback/duplicate) plus six reference mockups (`docs/assets/mockup/mockup_1..6.png`) and four asset sheets (`docs/assets/asset_sheet/`). The reference screenshots themselves are the Persona-3 aesthetic but cannot ship as-is (Atlus/SEGA copyright); the mockups are inspiration only. Forces:

- Copyright: no official/fan Persona (ATLUS) character art, logos, screenshots, fonts, or audio may ship.
- Asset weight: persona PNGs are 1.3–2.2MB each; shipping originals would blow the LCP/budget contract.
- Provenance: every shipped visual asset must have a recorded license and usage role, with a gate that rejects unregistered assets.
- No new heavy dependencies: optimization must reuse Astro's bundled image service.

## Decision

Ship only Jona's owner-created `assets/persona` and `assets/sprites` PNGs, selected per the authoritative role hierarchy (one principal persona per route; `persona_1`/`persona_2` full-body; `persona_3`/`persona_4`/`persona_5` support-only; `persona_6`–`persona_11` page compositions; favorites `persona_1`/`persona_8`/`persona_11` preferred) and a single restrained `assets/sprites` accent per route. Originals stay byte-identical under `assets/`; responsive derivatives (AVIF primary, WebP fallback) are generated at build via Astro `astro:assets` (Sharp). A repository provenance register `assets/PROVENANCE.yaml` records, per shipped asset, file name, origin class, license, usage role, and — for owner-created entries — creator "Jonathan Soto" with commercial-use and modification both "permitted". A CI gate `scripts/verify-provenance.mjs` fails when a production asset lacks a complete register entry, when `assets/icon` exists (no alias/symlink/fallback/duplicate), or when any audio other than the registered licensed derivative appears in `dist`. Reference material (`docs/assets/mockup`, `docs/assets/asset_sheet`, any `docs/assets/example` path) is input-only and never copied into `dist`. External visual assets, if ever introduced, must be CC0 or MIT with exact source URL, license, attribution, and permissions recorded — otherwise rejected. Licensed music is recorded under the same register (origin class `licensed-music`) with the Pixabay Content License fields; the derivative pipeline and audio-state contract are owned by ADR-0006.

## Consequences

### Positive

- Zero copyright risk: only owner-created art ships; mockups/reference screenshots are never in the output.
- Budget-safe: only compressed derivatives load at runtime; originals (1.3–2.2MB) are never requested.
- Auditable: the provenance register + CI gate make every shipped asset traceable and reject unregistered/unknown-license assets.
- No new dependency: Sharp is already Astro's default image service.

### Negative

- The provenance register and validation gate add a small CI surface and a review burden per asset.
- Derivatives are regenerated at build (build-time image work), slightly increasing build time.

### Neutral

- `persona_3`/`persona_4`/`persona_5` support-avatar use and `persona_7`/`persona_10` principal reuse are deferred; the register accommodates them without schema change.

## Options Considered

### Option A: Owner-created assets + provenance register (chosen)

License-safe, budget-safe, auditable, no new dependency.

### Option B: External CC0/MIT icon sets (Lucide/Heroicons/Tabler, Simple Icons)

Permitted by the legal research but adds a dependency and an attribution surface for visual identity Jona already owns; rejected as unnecessary.

### Option C: Ship the reference mockups/screenshots

Copyright infringement (Atlus/SEGA) and multi-MB payload; rejected outright.

### Option D: Hue-normalize purple accents to the cyan palette

Alters Jona's original art and is unverifiable without a vision pass; rejected in favor of admitting asset-native accents as decorative-only.

## Action Items

1. [ ] Add `assets/PROVENANCE.yaml` and `scripts/verify-provenance.mjs`.
2. [ ] Wire `PersonaLayer.astro` + `SpriteAccent.astro` to import selected originals via `astro:assets`.
3. [ ] Extend E2E to assert only derivatives load and mockups/example files never appear in `dist`.

## References

- [Design: Reference-Driven View Redesign](../../openspec/changes/reference-driven-view-redesign/design.md)
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — asset pipeline component
- [DESIGN.md](../../DESIGN.md) — principal persona layer and sprite accent components
