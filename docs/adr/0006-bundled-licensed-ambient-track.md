# ADR-0006: Bundled Pixabay-Licensed Ambient Track over BYO

## Status

Accepted

## Date

2026-08-13

## Deciders

Jonathan Soto (jonasotoaguilar)

## Context

ADR-0004 shipped no bundled audio and asked the owner to drop a BYO track at `/audio/background.mp3`, which left the default deployed site silent. The direction now licenses a real ambient track — "Acid Jazz Groove" by alex-morgan (source `https://pixabay.com/music/cafe-acid-jazz-groove-517096/`) under the Pixabay Content License (commercial use and modification permitted; standalone redistribution prohibited; Content ID registered; AI modified/generated; identity confirmed manually from user-supplied data, not page-hash-proven). The design must bundle an optimized derivative of that track, never the raw source, keep the site silent until a user gesture (browser autoplay policy), expose no direct download affordance, default to track-present with no-track as the fallback, and surface real media failures distinctly from the expected absence. Forces:

- Copyright: no Persona/ATLUS soundtrack or SFX may ship; the Pixabay license permits commercial + modification but not standalone redistribution, and attribution is optional.
- Autoplay policy: audible playback requires a user gesture.
- Payload: the source is 5.5MB (256kbps) and the committed derivative ~2.86MB, so the repo gains ~8.4MB total (raw source excluded from `dist`; only the derivative ships); the derivative must be a committed, deterministic, CI-safe artifact.
- Provenance: identity and license fields must be recorded in the register regardless of whether a visible credit is rendered.

## Decision

Ship exactly one ambient track as a committed deterministic derivative `public/audio/background.mp3`, re-encoded from the untouched source `assets/music/background.mp3` by `scripts/optimize-audio.mjs` using the system `ffmpeg` (proven at `/usr/bin/ffmpeg`) with pinned flags `-c:a libmp3lame -b:a 128k -ar 48000 -joint_stereo 1` (~2.86MB, 178.99s). MP3 is universally supported, so no codec fallback is needed; the derivative is committed (deterministic and CI-safe — CI does not require ffmpeg) and the script is the documented regenerator, recording the derivative sha256. The raw source never ships and `assets/music/` is never copied into `dist`. Runtime behavior carries forward from ADR-0004 unchanged: `<audio loop preload="none">` (zero bytes before play), a HEAD probe detects presence (no body bytes), playback unlocks once on the first `pointerdown`/`keydown`, mute persists to `localStorage["portfolio:audio:muted"]`, and the `<audio>` element survives route swaps via `transition:persist`. The reducer now defaults to track-present: `probe-ok` → `ready`; `probe-fail` (404, derivative absent) → `no-track` (expected, silent); `audio-error` → a distinct terminal `error` state ("Sound: Error", `data-audio-state="error"`, console warn). The provenance register records the full licensed-music entry (`title` "Acid Jazz Groove", `creator` alex-morgan, `source-url` `https://pixabay.com/music/cafe-acid-jazz-groove-517096/`, `license`/`license-url`, `acquisition-date`, local source and production derivative paths, `commercial-use: permitted`, `modification: permitted`, `attribution-requirement: optional`, `standalone-redistribution: false`, `content-id-registered: true`, `ai-modified-generated: true`, `identity-confirmation: manual`); a visible credit is optional. The provenance gate allows only the registered derivative audio in `dist` (rejecting all other audio) and requires `assets/icon` to be absent. `public/audio/README.txt` is replaced with a provenance/maintenance doc pointing at the register and the regeneration command.

## Consequences

### Positive

- Licensed and audible by default; no copyright risk (only the registered Pixabay derivative ships; nothing from ATLUS/SEGA).
- Lazy: zero bytes fetched before the first gesture; HEAD probe keeps the first-load budget intact.
- CI-safe and deterministic: the committed derivative ships regardless of whether ffmpeg is present in CI; the register + gate make the audio auditable and reject unregistered or official audio.

### Negative

- A ~2.9MB binary is committed to the repository and served from `public/`.
- Derivative regeneration is a maintainer-run step (pinned ffmpeg flags); it is not part of the default build.

### Neutral

- Attribution remains optional (Pixabay license) but provenance is mandatory; a visible credit, if added, is a small footer note.

## Options Considered

### Option A: Committed deterministic derivative + ffmpeg regenerator (chosen)

Deterministic, CI-safe, auditable, no new package dependency (system `ffmpeg`).

### Option B: Build-time ffmpeg encode on every build

Adds an ffmpeg requirement to CI and cross-version non-determinism; rejected.

### Option C: AAC/Opus primary + MP3 fallback `<source>` list

Adds a second file and a codec matrix for no support gain (MP3 alone is universal); rejected.

### Option D: Keep BYO (ADR-0004)

Leaves the default site silent and the contract obsolete; superseded.

### Option E: Ship the raw 5.5MB source MP3 directly

Violates the "source raw MP3 must not ship" and payload constraints; rejected.

## Action Items

1. [ ] Add `scripts/optimize-audio.mjs` and commit the derivative `public/audio/background.mp3`.
2. [ ] Extend `assets/PROVENANCE.yaml` with the licensed-music entry and update `scripts/verify-provenance.mjs` to allow only the registered derivative and reject `assets/icon` presence.
3. [ ] Update `src/lib/audio/state.ts` (`error` status, default track-present) and `src/scripts/ambient-audio.ts` (error path + warn).
4. [ ] Replace `public/audio/README.txt` with the provenance/maintenance doc.
5. [ ] Extend unit + E2E suites (default ready, no-track fallback, distinct error, no download link, lazy bytes, no raw source in `dist`).

## References

- [ADR-0004: BYO licensed ambient audio](0004-byo-licensed-ambient-audio.md) — superseded
- [ADR-0005: Owner-created persona/sprite assets with provenance register](0005-owner-created-assets-provenance.md)
- [Design: Reference-Driven View Redesign](../../openspec/changes/reference-driven-view-redesign/design.md)
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — ambient audio component and failure modes
- [DESIGN.md](../../DESIGN.md) — audio states and accessibility contract
