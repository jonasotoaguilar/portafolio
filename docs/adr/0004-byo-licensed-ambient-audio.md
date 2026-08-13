# ADR-0004: BYO Licensed Ambient Audio over Bundled Soundtrack

## Status

Accepted

## Date

2026-08-12

## Deciders

Jonathan Soto (jonasotoaguilar)

## Context

The Persona-3/5 aesthetic includes ambient background music. The reference repos bundle ripped Atlus/SEGA tracks (`persona5-website-theme/public/audio/background.mp3`, `select.mp3`), which is copyright infringement and cannot ship. Browser autoplay policies additionally require a user gesture before audible playback, so a track cannot simply autoplay. The remediation must keep the site silent by default, fit the < 100KB gzipped JavaScript budget, persist a mute preference with no backend, and stay fully license-safe. Forces:

- Copyright: no Persona/ATLUS soundtrack or SFX may ship; the user's track is user-provided and licensed.
- Autoplay policy: audible playback is blocked until a user gesture (Chrome/Safari/Firefox).
- No backend: persistence is client-side only (localStorage) and must fail safely.
- Budget: audio code joins the existing scripts on every route, still under 100KB gz.

## Decision

Ship no bundled audio. Optional ambient playback loads a user-provided licensed track from `/audio/background.mp3` via `<audio loop preload="none">`, so track bytes download only when playback starts. Track presence is detected with a `HEAD` request (zero body bytes — never preloads the track): `200` → ready, `404` → a disabled "no ambient track" state, network failure/`405` → optimistic ready, and a later `<audio>` `error` event dispatches `audio-error` into the reducer, falling back to the disabled no-track state. The HEAD probe runs exactly once per module initialization/persisted-island lifecycle — idempotent via an in-flight guard, its result stashed on the persisted cluster element, so ClientRouter route swaps never re-probe. Playback starts silent and unlocks once on the first `pointerdown`/`keydown`; after that it resumes the persisted enabled/muted state. Volume fades 200–450ms (400ms default, 200ms under reduced motion); under `prefers-reduced-motion: reduce` the system never starts audio automatically. The muted state persists to `localStorage["portfolio:audio:muted"]` with try/catch reads and writes — storage failure keeps an in-memory state and never throws. The mute toggle is a real button with `aria-pressed` and a visible label, lives in the persisted bottom-right control cluster, and survives ClientRouter navigation via `transition:persist` (playback never restarts across swaps). `public/audio/README.txt` documents the BYO contract.

## Consequences

### Positive

- Zero copyright risk: nothing from ATLUS/SEGA ships; the only audio is a file the owner drops in.
- Silent by default; sound requires an explicit user gesture, satisfying autoplay policy and accessibility expectations.
- No track bytes on first load: `preload="none"` + HEAD probe keep the budget intact.
- State survives navigation without a backend; storage failure degrades to in-memory.

### Negative

- The default deployed site is silent (muted aesthetic until Jona adds a licensed track).
- A small state machine and probe add JavaScript surface and test surface.
- HEAD probe behavior varies across static hosts; the optimistic fallback covers it.

### Neutral

- A synthesized original ambient pad (Web Audio) remains a possible future original default; out of scope here.

## Options Considered

### Option A: BYO licensed track, HEAD probe, gesture unlock (chosen)

License-safe, budget-safe, proven pattern (the P5 reference repo itself ships a BYO README contract).

### Option B: Bundle the reference soundtrack

Copyright infringement (© ATLUS/SEGA) and 7.4MB of shipped media. Rejected.

### Option C: Web Audio-synthesized original pad as default

Original and zero-license-risk, but a second audio surface to design/tune; deferred to keep the change scoped.

### Option D: Build-time file existence check

Cannot see files dropped into `public/audio` after build; runtime HEAD probe covers both cases.

## Action Items

1. [ ] Add `AudioControl` + `ControlCluster` components and the `ambient-audio` script with the reducer in `src/lib/audio/state.ts`.
2. [ ] Add `public/audio/README.txt` with the BYO contract.
3. [ ] Wire gesture unlock, persistence, and reduced-motion rules per the design.
4. [ ] Extend unit + E2E suites (no-track state, gesture gate, persistence, navigation survival, reduced motion).

## References

- [Exploration: Persona UI/UX Remediation](../../openspec/changes/persona-ui-ux-remediation/exploration.md)
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — component details and failure modes
- [DESIGN.md](../../DESIGN.md) — design tokens, motion, and accessibility contract
