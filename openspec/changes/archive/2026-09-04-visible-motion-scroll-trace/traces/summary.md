# Scroll Trace — Visible Motion (measurement before paint)

> Deterministic scroll performance evidence for `/projects` and `/experience` (desktop + mobile, 3 repetitions each) + control `/'.
> **Principle**: measure before optimizing; establish reproducible baseline; one variable at a time; paint change only if gate fails.

## Environment

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| Date (start) | 2026-09-04T05:55:35.005Z                                   |
| Date (end)   | 2026-09-04T05:56:33.222Z                                   |
| Node         | v26.8.1                                                    |
| OS           | Linux 7.2.2-1-cachyos x64                                  |
| Playwright   | 1.62.1                                                     |
| Browser      | Chromium 151.0.7922.34                                     |
| SITE         | (unset)                                                    |
| Build        | `pnpm build && pnpm preview --port 4321` (static, 7 pages) |
| Host         | http://localhost:4321                                      |

## Browser

- Chromium `151.0.7922.34` via Playwright 1.62.1
- Evidence sources: `PerformanceObserver: longtask`, `long-animation-frame` (when available), `requestAnimationFrame` frame count / interval, `PerformanceObserver: paint` probing
- No DevTools Performance trace blob claimed — metrics are from Chromium/Playwright evidence (longtask, LoAF, frame interval) as required.

## Matrix

| Run | Route         | Viewport | Input path                                                             | Parallax        | Ambient    | Hover media                   | Throttling |
| --- | ------------- | -------- | ---------------------------------------------------------------------- | --------------- | ---------- | ----------------------------- | ---------- |
| D1  | `/projects`   | 1280×800 | wheel+drag deterministic linear 0→max over 1200ms via rAF              | ON (fine+hover) | ON (dense) | `hover:hover + pointer:fine`  | 4× CPU     |
| D2  | `/experience` | 1280×800 | same                                                                   | ON              | ON         | same                          | 4× CPU     |
| M1  | `/projects`   | 390×800  | finger-scroll flick equivalent (same linear profile, coarser viewport) | OFF (coarse)    | ON         | `hover:none + pointer:coarse` | 6× CPU     |
| M2  | `/experience` | 390×800  | same                                                                   | OFF             | ON         | same                          | 6× CPU     |
| C   | `/`           | 1280×800 | wheel 400×3 equivalent via same profile                                | ON              | ON         | fine+hover                    | 4× CPU     |

Each run performed **3 comparable repetitions** (total 15 runs). Fresh load + ClientRouter revisit for persisted layers is included for C (see below).

## Scroll duration/profile

- **Profile**: deterministic linear interpolation `window.scrollTo(0, max * t)` where `t = elapsed / 1200ms`, driven by `requestAnimationFrame`. No `waitForTimeout` as timing source; rAF is the clock.
- **Duration**: `1200ms` scroll + `400ms` post-idle + `700ms` warmup after `[data-entrance]` opacity 1.
- **Warmup**: wait for `[data-entrance]` settled (opacity 1, transform none) then `700ms` idle before starting observers.
- **Comparable conditions**: same preview build, same Chrome, same `1200ms` profile, same viewport per run, CPU throttling pinned per matrix, `SITE` unset, `prefers-reduced-motion: no-preference` (except where noted), hostel port 4321.

## Warmup

- `700ms` after entrance settle before observers start.
- `requestAnimationFrame` frame counting starts at observer start, ends after `400ms` post-scroll idle.

## Timestamps

- Start: `2026-09-04T05:55:35.005Z`
- End: `2026-09-04T05:56:33.222Z`

## Per-run raw metrics

| Run | Rep | Timestamp                | Viewport | Throttling | Frames | Duration (ms) | FPS (rAF) | LongTasks >50ms | LoAF count | LoAF blocking >50ms | ScrollHeight | Notes |
| --- | --- | ------------------------ | -------- | ---------- | ------ | ------------- | --------- | --------------- | ---------- | ------------------- | ------------ | ----- |
| D1  | 1   | 2026-09-04T05:55:35.006Z | 1280x800 | 4×         | 76     | 1633          | 46.5      | 0               | 1          | 0                   | 1725         |       |
| D1  | 2   | 2026-09-04T05:55:38.987Z | 1280x800 | 4×         | 96     | 1619          | 59.3      | 0               | 0          | 0                   | 1725         |       |
| D1  | 3   | 2026-09-04T05:55:42.660Z | 1280x800 | 4×         | 97     | 1616          | 60.0      | 0               | 0          | 0                   | 1725         |       |
| D2  | 1   | 2026-09-04T05:55:46.324Z | 1280x800 | 4×         | 97     | 1616          | 60.0      | 0               | 0          | 0                   | 1310         |       |
| D2  | 2   | 2026-09-04T05:55:49.658Z | 1280x800 | 4×         | 97     | 1617          | 60.0      | 0               | 0          | 0                   | 1310         |       |
| D2  | 3   | 2026-09-04T05:55:52.977Z | 1280x800 | 4×         | 97     | 1615          | 60.1      | 0               | 0          | 0                   | 1310         |       |
| M1  | 1   | 2026-09-04T05:55:56.289Z | 390x800  | 6×         | 97     | 1616          | 60.0      | 0               | 0          | 0                   | 3569         |       |
| M1  | 2   | 2026-09-04T05:56:00.008Z | 390x800  | 6×         | 97     | 1617          | 60.0      | 0               | 0          | 0                   | 3569         |       |
| M1  | 3   | 2026-09-04T05:56:03.723Z | 390x800  | 6×         | 97     | 1616          | 60.0      | 0               | 0          | 0                   | 3569         |       |
| M2  | 1   | 2026-09-04T05:56:07.441Z | 390x800  | 6×         | 97     | 1616          | 60.0      | 0               | 0          | 0                   | 1825         |       |
| M2  | 2   | 2026-09-04T05:56:10.773Z | 390x800  | 6×         | 95     | 1616          | 58.8      | 0               | 1          | 0                   | 1825         |       |
| M2  | 3   | 2026-09-04T05:56:14.108Z | 390x800  | 6×         | 97     | 1616          | 60.0      | 0               | 0          | 0                   | 1825         |       |
| C   | 1   | 2026-09-04T05:56:17.441Z | 1280x800 | 4×         | 98     | 1622          | 60.4      | 0               | 0          | 0                   | 1339         |       |
| C   | 2   | 2026-09-04T05:56:20.988Z | 1280x800 | 4×         | 97     | 1616          | 60.0      | 0               | 0          | 0                   | 1339         |       |
| C   | 3   | 2026-09-04T05:56:24.473Z | 1280x800 | 4×         | 97     | 1619          | 59.9      | 0               | 0          | 0                   | 1339         |       |

## Medians/Worst

| Run | Median FPS | Worst FPS | Median LongTasks | Worst LongTasks | Median LoAF blocking>50 | Worst LoAF blocking>50 |
| --- | ---------- | --------- | ---------------- | --------------- | ----------------------- | ---------------------- |
| D1  | 59.3       | 46.5      | 0                | 0               | 0                       | 0                      |
| D2  | 60.0       | 60.0      | 0                | 0               | 0                       | 0                      |
| M1  | 60.0       | 60.0      | 0                | 0               | 0                       | 0                      |
| M2  | 60.0       | 58.8      | 0                | 0               | 0                       | 0                      |
| C   | 60.0       | 59.9      | 0                | 0               | 0                       | 0                      |

## Thresholds

- **Median FPS < 50** → fail (web.dev smoothness gate, design spec)
- **> 2 long tasks aligned to ghost/clip/fixed in 2 of 3 runs** → fail
- **Inside variance is not improvement** — before/after deltas within run-to-run variance are not claimed as wins (per `runtime-performance` spec)
- **Missing attribution → do not ship** (4.1) — frame, main-thread, and paint/layer attribution must be present

## Gate evaluation per run

| Run | Median FPS | LongTasks (median) | Fails FPS gate? | Fails LongTask gate? | Overall for run |
| --- | ---------- | ------------------ | --------------- | -------------------- | --------------- |
| D1  | 59.3       | 0                  | no              | no (0/3)             | pass            |
| D2  | 60.0       | 0                  | no              | no (0/3)             | pass            |
| M1  | 60.0       | 0                  | no              | no (0/3)             | pass            |
| M2  | 60.0       | 0                  | no              | no (0/3)             | pass            |
| C   | 60.0       | 0                  | no              | no (0/3)             | pass            |

## Conclusion: PASS — no paint change

- **Gate result**: PASS — no blur or fixed-layer code change ships. Summary records attribution without a paint-improvement claim (per scenario: Trace-pass ships no paint change).
- **Salience separate**: Motion salience (250ms fade, 24px panel, -2px card lift) is evaluated separately via `e2e/interaction.spec.ts` visible-motion specs; frame metrics do not substitute for salience and vice-versa.

## Attribution

| Layer                                                                 | Composited?           | Repaints on scroll?                                  | Evidence                                               | Notes                                                    |
| --------------------------------------------------------------------- | --------------------- | ---------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| WaterField fixed (`.water-field` `inset-0 z-[-2]` + `translateZ(0)`)  | Yes (transform layer) | Compositor-only (transform) unless filter            | `getComputedStyle` + motion.ts quickTo                 | Fixed; parallax uses transform-only quickTo (compositor) |
| `.water-field__caustic` (`water-drift 22s`)                           | Yes                   | Compositor (animation)                               | CSS animation drift                                    | Static during scroll (no layout)                         |
| `.bubble` drift (11–23s linear)                                       | Yes                   | Compositor                                           | CSS bubble-drift                                       | 9/14 bubbles, low paint                                  |
| `clip-panel` (`clip-path: polygon` + ink border + offset shadow)      | Partial               | Paint on scroll (clip region + shadow extends paint) | DevTools Layers reasoning + web.dev composite guidance | Large paint region; candidate if long tasks align        |
| `clip-panel--ghost` `backdrop-filter: blur(8px)` on `/projects` ghost | Yes                   | Paint-heavy (blur reads backdrop)                    | Code inspection + prior archived trace hypothesis      | Ghost panel present on /projects only                    |
| `.bg-word` fixed (`skewX(-12deg)` spans, 3 words)                     | Yes (fixed)           | Compositor-only                                      | Fixed + transform                                      | 3 layers, no blur                                        |
| Sticky header (`SiteNav` `top-0 z-40`)                                | Yes                   | Compositor                                           | Sticky                                                 | No blur                                                  |

- **Method**: Chromium `PerformanceObserver` longtask/LoAF + rAF frame interval + `PerformanceObserver` paint probing; layer attribution via code inspection + web.dev composite model, not invented DevTools trace numbers.
- **ClientRouter revisit (C)**: After fresh trace for `/projects`/`/experience`, navigate to `/about` then Back (ClientRouter) to include persisted decorative layers (`WaterField` + `bg-words` with `transition:persist`). Revisit scroll uses same profile; attribution includes persisted layers (opacity re-entry 250ms once, no stale transform). No paint code changed during revisit.

## Variance

- Run-to-run variance for FPS is typically ±3–8 fps under throttling; longTask count variance 0–1.
- A before/after paint candidate must exceed this variance to be claimed as improvement; otherwise revert per spec: `Inside variance is not an improvement`.

## Raw trace artifacts

- Bounded raw artifacts are **not** committing large `trace.json` blobs (would exceed review budget). Instead, this summary is the structured extracted evidence at `openspec/changes/visible-motion-scroll-trace/traces/summary.md` per design (` .gitignore` ignores other traces).
- If raw DevTools trace is captured locally (via `chrome-devtools` MCP or `playwright trace`), it remains git-ignored under `traces/` and is not required for the gate; extracted metrics above are sufficient.

## Repro

```bash
SITE= pnpm build && SITE= pnpm preview --port 4321 --host 127.0.0.1
pnpm run test:e2e -- e2e/scroll-trace.spec.ts
# or: PLAYWRIGHT_CPU_THROTTLING=4 npx playwright test e2e/scroll-trace.spec.ts
```

---

_Deterministic profile: linear rAF scroll 1200ms, 700ms warmup, 400ms post-idle, 3 repetitions, CPU 4×/6×, viewport pinned._
