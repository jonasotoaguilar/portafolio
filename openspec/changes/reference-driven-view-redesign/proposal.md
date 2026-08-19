# Proposal: Reference-Driven View Redesign

## Intent

Ocean system, white contrast cuts, original persona/sprites assets; keyboard first.

## Scope

### In Scope

1. Fix keyboard defects first (focus/activation, Tab→arrow sync); E2E.
2. Six compositions: Home (white cut, cropped PORTFOLIO, stat card); About (diagonal stats, tall portrait); Projects/Contact (left menu + right detail/art); Skills (left categories + right list); Resume (editorial, no tabs).
3. Ocean: deep/ocean blue, cyan, white cuts; SVG/CSS/canvas waves/particles.
4. Motion: dissolve/recede out, edges in; transform+opacity; interruptible; ≤400ms (≤200ms reduced).
5. `Ctrl+Alt+ArrowLeft/Right` cycles About→Resume→Projects→Skills→Contact; inert home; conflict-safe.
6. Audio: licensed track `assets/music/background.mp3`; no-track fallback; real error distinct.
7. Assets (owner): `assets/persona` principal per route (`persona_1`/`persona_2` full-body, `persona_3`–`persona_5` profile/support, `persona_6`–`persona_11` menu/page; favorites `persona_1`/`persona_8`/`persona_11`); `assets/sprites` decorative/repeatable; mockups reference-only.
8. Rename `assets/icon` → `assets/sprites`; no alias/symlink/fallback.
9. Optimize selected PNGs (originals untouched); static stats, no live GitHub/visits.

### Out of Scope

Live GitHub/visits; official/fan Persona assets/logos/screenshots/soundtrack; direct MP3 download; standalone redistribution; `assets/icon` compat path; heavy deps; procedural-SVG swap.

## Capabilities

### New Capabilities

- `asset-provenance`: source/license register — owner originals (Jonathan Soto, commercial+modification), external CC0/MIT, Pixabay Content License music (URL/license/creator/flags/acquisition/manual-confirmation); no Atlus.

### Modified Capabilities

- `persona-navigation`: cursor/focus + section-nav.
- `portfolio-page`: six compositions, stat card, Resume editorial.
- `living-background`: ocean waves + particles.
- `ambient-audio`: licensed track + no-track vs real error.
- `site-transitions`: choreographed entrances.
- `resume-content`: drop Projects/Skills.
- `portfolio-content`: static `stats`.

## Approach

Progressive enhancement: clip-path panels, light tokens, named VT groups, canvas waves, section-nav; optimize persona/sprites PNGs. Music: source under `assets/music`; optimized derivative (format/bitrate in design), integrated, no preload, lazy GET after gesture, optional credit. No new deps; slices A–I.

## Affected Areas

- `view.ts`/`shell.ts` — focus/Tab.
- `pages/*.astro`, game components — six compositions.
- `global.css`, canvas, `entrances.ts` — tokens/waves/VT.
- `assets/persona/*.png`, `assets/sprites/*.png` — principal + decorative.
- `assets/music/background.mp3` — source + derivative.
- `section-nav.ts`, `audio/state.ts`, content, tests — shortcut/audio/stats/provenance.

## Risks

- Music identity not hash-proven (Low) — user provenance + manual-confirmation.
- Asset licensing (Med) — owner + CC0/MIT + Pixabay register; no Atlus.
- VT choreography (Med) — named-group degradation; e2e.
- Clip-path mobile/white contrast (Med) — stacked <768px; 44px targets; AA.
- PNG weight 1.3–2.2MB (Med) — responsive optimization.
- Unit C oversized (Med) — split post-planning.

## Rollback Plan

Slices A–I revertible (feature-branch chain); Unit C split before apply; audio = drop derivative (no-track fallback).

## Dependencies

exploration.md; Engram #6192/#6196/#6245/#6246.

## Success Criteria

- [ ] #6186 fixed; regression E2E green
- [ ] six compositions render; zero-JS flow intact
- [ ] assets: persona + sprites only, originals untouched, provenance + music manual-confirmation, mockups excluded
- [ ] motion ≤400ms (≤200ms reduced); section-nav conflict-safe; audio track/no-track vs distinct error
- [ ] SSG, WCAG 2.2 AA, <100KB preserved
