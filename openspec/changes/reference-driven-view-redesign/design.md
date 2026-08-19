# Design: Reference-Driven View Redesign

**Change**: `reference-driven-view-redesign` · **Author**: sdd-design

## Technical Approach

On the Astro 7 SSG: clip-path light panels + `surface-light` token family over the dark ocean base; named View Transition groups; procedural Canvas 2D ocean (waves/bubbles/caustic); roving-tabindex fix (#6186); section-nav shortcut. Mockups (`docs/assets/mockup/`) are input-only. Owner `assets/persona` (11) + `assets/sprites` (14, renamed) → gitignored derivatives; `DecorativeTypeLayer.astro` renders one oversized route word (`aria-hidden`, zero-JS); a licensed track ships as a committed MP3 derivative. No new deps (Sharp, system ffmpeg). Budgets hold (<100KB gz JS; lazy audio).

*Vision: cannot view images; matrix locked (#6196/#6198).*

## Architecture Decisions

| Decision | Choice | Rejected / rationale |
|---|---|---|
| Principal persona (LOCKED) | Matrix below; favorites persona_1/8/11 ship | persona_3/4/5 support-only, 7/10 near-dups deferred |
| Light tokens | `surface-light` "cut" family over dark base | Theme inversion breaks dark identity; PRD no-toggle |
| Purple asset accents | Asset-native hues only inside `aria-hidden` layers | Hue-normalize alters art |
| Roving tabindex | One cursor (`active`=0, others `-1`); Enter opens focused | #6186 fix |
| Route motion | Named VT groups (`figure`/`panel`/`menu`); in-view = interruptible CSS transition | React island (ADR-0001/0003); keyframes |
| Static stats | `stats` array in `site.config.yaml` (zod) | No build network/client fetch |
| Decorative type | `DecorativeTypeLayer.astro`; replaces `Watermark.astro` (delete) | SVG/canvas text; 4th VT group |
| Sprite rename | `assets/icon`→`assets/sprites`; `IconAccent.astro`→`SpriteAccent.astro`; role `icon`→`sprite` | No alias/symlink/fallback/duplicate |
| Bundled track | Committed derivative via `optimize-audio.mjs` (pinned ffmpeg flags) | Build-time encode; codec fallback; BYO |

## Locked Route Matrices

Persona, sprite, word per route (placement/crop/orientation → portfolio-page spec + DESIGN.md):

| Route | Principal | Sprite | Word |
|---|---|---|---|
| Home `/` | persona_1 | asset_12_clock | PORTFOLIO (vertical, accent-600@0.9) |
| About | persona_2 | asset_09_badge_dev | DEVELOPER (cyan@0.14) |
| Projects | persona_6 | asset_10_computer | BUILD (surface-light@0.10) |
| Skills | persona_9 | asset_14_fire | STACK (cyan@0.14) |
| Contact | persona_11 | asset_04_mariposa_neon | CONNECT (vertical, light@0.12) |
| Resume | persona_8 | asset_05_card | EXPERIENCE (cyan@0.10) |

Contract: one sprite/route (opacity 8–15%, ≤160px/96px, `aria-hidden`, outside text/44px); one word/route, token-only, Anton, `z-index:-1`; <768px re-flows.

## Data Flow

```
config+content ─► zod ─► static HTML
persona|sprites ─► Sharp ─► gitignored dist-assets/ (Unit D wires dist)
music source ─► ffmpeg ─► public/audio/background.mp3 ─► dist/audio
mockups ─► reference-only · runtime: canvas rAF, keyboard scripts, audio probe (5 states), VT groups
```

## File Changes

| File | Action |
|---|---|
| `PersonaLayer.astro`, `SpriteAccent.astro`, `DecorativeTypeLayer.astro` | Create |
| `Watermark.astro` | Delete |
| `section-nav.ts`, `canvas/waves.ts`, `canvas/bubbles.ts` | Create |
| `scripts/optimize-audio.mjs` | Create (ffmpeg derivative, sha256) |
| `optimize-assets.mjs`, `verify-provenance.mjs`, `PROVENANCE.yaml` | Modify (role `sprite`; licensed-music; reject `assets/icon`) |
| `view.ts`, `shell.ts`, `living-background.ts`, `audio/state.ts`, `ambient-audio.ts`, `AudioControl.astro` | Modify (tabindex; tab sync; ocean; `error`) |
| `schemas.ts`, `site.config.yaml`, `resume.yaml` | Modify (stats; prune resume projects/skills) |
| `global.css`, `BaseLayout.astro`, `FigureLayer.astro`, 6 pages, game components | Modify |
| `assets/music/background.mp3` + `public/audio/background.mp3` | Create / commit derivative |

## Interfaces

```
waves.ts: createWaveField(seed,w,h)→WaveField; stepWaves; renderWaves; WAVE_BAND_CAP=3
audio: AudioStatus = "no-track"|"ready"|"playing"|"muted"|"error"
  probe-ok→ready; probe-fail(404)→no-track; audio-error→error(distinct)
PROVENANCE licensed-music: title "Acid Jazz Groove", creator alex-morgan,
  source-url https://pixabay.com/music/cafe-acid-jazz-groove-517096/, Pixabay Content License,
  attribution optional, no-standalone, content-id, ai-modified, identity manual
```

## Testing

| Layer | Coverage |
|---|---|
| Unit | waves/bubbles determinism; audio reducer; stats/schema prune; provenance; WORDS map; assetPath; gate rejects `assets/icon` |
| Integration | section-nav ring + inert home; decorative-type per route; derivative-only dist scan |
| E2E | #6186 regression; six compositions; word vocabulary; no h-scroll; reduced-motion; audio ready/no-track/error + zero-byte pre-gesture; budget; mockups+icon excluded |

## Threat Matrix

Only build-time `ffmpeg` subprocess applicable (VCS/PR/doc rows N/A): `spawn` args array (no shell), fixed paths, pinned flags, no user input. RED: non-zero exit/missing source fails cleanly; determinism; raw source never in `dist`. Failure → derivative absent → `no-track` (never error).

## Migration / Rollout (feature-branch chain)

12+ revertible slices. A keyboard (#6186) → B1 register+gate → B2 optimizer+derivatives (`sprite`) → C1 pure waves/bubbles/particles → C2 living-background orchestration + static-frame + `global.css` utility + views E2E (no size exception; 532 = Unit C total, not `living-background.ts`) → D primitives+tokens (3 layers) → E Home+About+stats → F Projects+Skills → G Contact+Resume → H1 transitions → H2 section-nav → I1 audio (optimizer+derivative+register+audio state) → I2 docs/ADR sync + regression. Sprite-rename correction may need its own slice if budget demands. Forecast: High risk, chained PRs.

## Doc / ADR Integrations

DESIGN.md: tokens, sprite-accent, decorative type, VT motion, audio states, resume editorial (no Projects/Skills). ARCHITECTURE.md: ocean, asset pipeline, ambient-audio. ADR-0004→superseded by ADR-0006 (mechanics carried); ADR-0006 locks URL + ~8.4MB repo weight; ADR-0005 sprite rename + licensed-music scope. Lifecycle validated.

## Spec Correction Handoff (sdd-spec)

sdd-spec MUST add `source-url: https://pixabay.com/music/cafe-acid-jazz-groove-517096/` to the licensed-music requirement (design records the locked URL; no spec mutation here).

## Open Questions

None.
