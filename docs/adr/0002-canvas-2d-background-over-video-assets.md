# ADR-0002: Canvas 2D Living Background over Video Assets

## Status

Accepted

## Date

2026-08-10

## Deciders

Jonathan Soto (jonasotoaguilar)

## Context

The Persona-3 reference site (`persona3-website`) ships its living background as media: `main1.mp4` (27.3 MB) and `circletransition.mp4` plus multiple PNG/JPG frames. For the portfolio, the background must feel alive (particles and fog), survive Astro View Transitions, respect `prefers-reduced-motion`, and fit a < 100KB gzipped JavaScript budget with no heavyweight assets. Forces:

- No video/asset weight: heavy MP4s are the single largest page-weight driver in the reference repo.
- Zero extra codebases: a rendering pipeline for animated video is a second project to maintain.
- Interaction and determinism: the layer should degrade predictably and never block content.
- The glow and scanlines already exist as pure CSS layers; the living layer is the only animated JavaScript surface.

## Decision

Implement the living background as a Canvas 2D layer in pure TypeScript: a `requestAnimationFrame` game loop (clear -> update -> draw) rendering particles/fog. The canvas element carries `transition:persist` so it survives Astro View Transitions across routes; with `prefers-reduced-motion: reduce` it paints a single static frame and never starts the loop. Zero rendering dependencies; the layer is decorative (`aria-hidden`, `pointer-events-none`).

## Consequences

### Positive

- No media assets: kilobytes of canvas code instead of 27+ MB of video.
- TypeScript-only, zero dependencies, fully deterministic and testable (pure update/draw functions).
- Native reduced-motion handling: a static frame costs nothing.
- The layer can react to viewport size, devicePixelRatio, and tab visibility; pausing on hidden tabs avoids idle battery drain.
- `transition:persist` keeps the loop alive across view transitions with no remount.

### Negative

- Main-thread animation work per frame; bounded by capping particle count and devicePixelRatio, and by pausing when the tab is hidden.
- More authored code than dropping in a video file; the particle/fog system must be tuned.
- Canvas output is not accessible or indexable — acceptable because the layer is decorative and content sits above it.

### Neutral

- Browser canvas support is universal among modern engines; older browsers simply show the CSS glow and scanlines.

## Options Considered

### Option A: Canvas 2D in TypeScript (chosen)

| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium (particle system, loop lifecycle) |
| Cost | Zero (no assets, no deps) |
| Scalability | Fixed cost, capped |
| Team familiarity | High (TypeScript) |
| Ecosystem / Tooling | None required |
| Operational overhead | None |

**Pros:**
- Zero asset weight and zero dependencies.
- Full control: static frame under reduced motion, pause on hidden tabs, DPR-aware rendering.
- Lives in the same repo and type system as the rest of the site.

**Cons:**
- Must author and tune the particle/fog simulation.
- Runs on the main thread (mitigated by caps and lifecycle pausing).

### Option B: Video assets (MP4 / Remotion transparent WebM)

| Dimension | Assessment |
|-----------|------------|
| Complexity | High |
| Cost | High (asset weight; render pipeline) |
| Scalability | Fixed weight per video |
| Team familiarity | Low |
| Ecosystem / Tooling | Second codebase (React + Remotion render) |
| Operational overhead | Render on every visual change |

**Pros:**
- Pixels are deterministic and photorealistic; no runtime simulation.

**Cons:**
- 27 MB class weights in the reference repo; violates the JS/asset budget.
- Transparent WebM (Remotion's alpha format) has a Safari alpha-support gap, so cross-browser transparency is not reliable.
- A render pipeline and second codebase for the compositor; every tweak is a re-render.
- Reduced-motion handling requires a separate static frame asset.

### Option C: CSS-only living background

| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | Zero |
| Scalability | Not applicable |
| Team familiarity | High |
| Ecosystem / Tooling | None |
| Operational overhead | None |

**Pros:**
- Zero JS; runs off the main thread.

**Cons:**
- Cannot produce a convincing particle/fog field or interactivity; only gradients and scanlines (already in use as CSS layers 1 and 2).
- The "living layer" would have to be dropped, weakening the Persona-3 identity.

## Trade-off Analysis

Video wins on fidelity and authoring simplicity but loses on every constraint that matters: weight, cross-browser alpha (Safari), a second codebase, and a re-render pipeline. CSS alone cannot deliver the living layer. Canvas 2D trades authored simulation code for zero dependencies, zero asset weight, native reduced-motion behavior, and lifecycle control — the correct trade for a decorative layer on a performance-budgeted static site.

## Action Items

1. [x] Decide the three-layer background order: CSS glow (1), CSS scanlines (2), Canvas 2D (3) — all behind content, `pointer-events-none`.
2. [ ] Implement the particle/fog system with a rAF loop (clear -> update -> draw) in TypeScript.
3. [ ] Add `transition:persist` to the canvas element for View Transition survival.
4. [ ] Paint a single static frame and skip the loop under `prefers-reduced-motion: reduce`.
5. [ ] Cap particle count and devicePixelRatio; pause the loop on hidden tabs.
6. [ ] Verify with E2E: reduced-motion emulation shows a static frame; navigation does not remount the layer.

## References

- Reference repo: /home/jona/repos/persona3-website (`public/main1.mp4`, `public/circletransition.mp4`)
- [ADR-0001](0001-astro-static-over-react-spa.md) — architecture decision that this layer enhances
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — runtime flow for the canvas lifecycle
- [DESIGN.md](../../DESIGN.md) — Motion section for timing, easing, and reduced-motion values
