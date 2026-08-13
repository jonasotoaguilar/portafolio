# Design: Persona UI/UX Remediation

## Technical Approach

Static markup + CSS + vanilla-script pattern: per-item menu config in `GameMenu.astro`, inline-SVG figure layer placed per route via `html[data-route]`, persisted bottom-right control cluster, license-safe ambient-audio island. No new deps; route/zero-JS/400ms/<100KB gz/reduced-motion contracts hold.

## Architecture Decisions

| # | Decision | Choice & rationale |
|---|----------|--------------------|
| 1 | Menu anchor & stagger | Center-right per-item offsets. Column at 55vw; per-item CSS vars in one `.menu-item` rule (no overlap). ≥1024px: ABOUT −2.25rem/−6°, RESUME +1.5rem/−6°, PROJECTS −3rem/−8° (largest), SKILLS +2.25rem/−6°, CONTACT −1rem/−8°. 768–1023px: half offsets, −4°; <768px/coarse: collapse, uniform clamp, 12px gap, 44px targets |
| 2 | Active/focus/hover | Persistent shared treatment. `data-active` + `:hover`: accent-400 text, diagonal clip-path accent layer, 2px cyan bar. `:focus-visible` accent-300 outline stays, never suppressed. `aria-current="page"` set by `shell.ts` only. 150ms color transition, no entrance motion |
| 3 | Figure/artifact language | Inline SVG polygons. Original faceted bust in deep-blue fills with cyan rims, plus bars/chevrons/chips/slashes at 15–45% opacity. One SVG per route in `FigureLayer.astro`, placed by `html[data-route]` CSS (placements in DESIGN.md). `aria-hidden`, `pointer-events-none`, zero JS |
| 4 | Control cluster | Fixed bottom-right (`ControlCluster.astro` in `BaseLayout`): bottom 1.5rem/right 1.75rem, column, `transition:persist` (audio survives swaps). Height <560px or coarse pointer: hints hidden, mute ≥44px |
| 5 | Ambient audio | HEAD probe + event fallback. Pure reducer `src/lib/audio/state.ts`: `no-track → ready ⇄ playing ⇄ muted`. HEAD probe (zero bytes): 200 → ready; 404 → no-track; network/405 → optimistic ready — a later `<audio>` `error` dispatches `audio-error` → no-track, silent. Probe exactly once per module init / persisted-island lifecycle, NOT per route swap: in-flight guard (idempotent); result stashed on the persisted `ControlCluster` element so swap re-init adopts it; `astro:before-swap` aborts in-flight probes. One-time pointer/keydown unlock; no reduced-motion autostart. Fades 400ms/200ms reduced. `localStorage["portfolio:audio:muted"]` try/catch → in-memory, never throws |
| 6 | Component boundaries | Shared layers + route-scoped CSS. Server shells `GameMenu`, `FigureLayer`, `ControlCluster` (KeyHints + `AudioControl` markup) in `BaseLayout`. Vanilla modules imported by components; pure logic in `lib/audio/state.ts`; styling in `global.css` |

## Data Flow

```
fresh page load → HEAD probe (once; in-flight guard)
   → 404 → no-track: disabled button (terminal)
   → 200 → ready → wait first pointerdown/keydown (once)
   → network/405 → optimistic ready
gesture → persisted muted? → silent | play() + fade-in
toggle → playing ⇄ muted (fade) → persist (try/catch)
<audio> error → audio-error → no-track: disabled button, silent (terminal)
swap → persisted <audio> keeps playing; re-init adopts stashed probe state —
  never re-probes
```

## File Changes

| File | Action |
|------|--------|
| `src/components/FigureLayer.astro` | Create — SVG figure layer |
| `src/components/game/ControlCluster.astro` | Create — fixed cluster (persisted) |
| `src/components/game/AudioControl.astro` | Create — `<audio preload="none">` + mute button |
| `src/lib/audio/state.ts` | Create — pure reducer |
| `src/scripts/ambient-audio.ts` | Create — DOM wiring |
| `public/audio/README.txt` | Create — BYO licensed-track contract |
| `docs/adr/0004-byo-licensed-ambient-audio.md` | Create |
| `tests/unit/audio-state.test.ts`, `tests/e2e/ambient-audio.spec.ts` | Create |
| `src/components/game/GameMenu.astro` | Modify — config + active markup |
| `src/components/game/KeyHints.astro`, `ViewHeader.astro` | Modify — content only |
| `src/scripts/shell.ts` | Modify — set `data-active` + `aria-current` |
| `src/layouts/BaseLayout.astro` | Modify — add FigureLayer + ControlCluster |
| `src/styles/global.css` | Modify — vars, treatment, cluster, variants |
| `tests/e2e/{keyboard,views,budget,reduced-motion}.spec.ts` | Modify — extend assertions |
| `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, `README.md` | Modify — doc integration; root `README.md` stale (pre-shell landing) — update alongside PRD/DESIGN/ARCHITECTURE and `public/audio/README.txt` |

## Interfaces / Contracts

```ts
type AudioStatus = "no-track" | "ready" | "playing" | "muted";
type AudioEvent =
  | { kind: "probe-ok" } | { kind: "probe-fail" }
  | { kind: "audio-error" } | { kind: "gesture" }
  | { kind: "toggle" } | { kind: "restore"; muted: boolean };
// reduceAudio(state: { status; muted }, event): { status; muted }
// audio-error → no-track (terminal)
```

- CSS: `.menu-item { --item-x; --item-skew; --item-size }`; `[data-menu-item][data-active]` + `aria-current="page"`; `html[data-route] .figure-layer` variants; cluster hides: `(max-height: 560px)`, `pointer-coarse`.
- Audio: src `/audio/background.mp3`; key `portfolio:audio:muted`; button `aria-pressed` + visible label.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Audio reducer transitions (incl. `audio-error` → no-track), probe idempotence, storage-failure fallback, shell active-set | Vitest |
| E2E | Spec scenarios (indicator, stagger, coarse, cluster, mute, no-track, gesture gate, persistence, reduced-motion, zero-JS, budget) + swaps never re-issue HEAD, `audio-error` fallback, figures hidden from AT | Playwright |
| UI/UX verification | Design-system verification vs changed UI + DESIGN.md | Adherence check |
| Mutation | One bounded campaign on changed executable targets | Stryker, in sdd-verify |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration. Rollback = revert the PR; figure/cluster/audio layers are additive; localStorage key isolated.

## Open Questions

None.
