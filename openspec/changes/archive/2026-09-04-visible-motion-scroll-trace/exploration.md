# Exploration: visible-motion-scroll-trace

## Current State

**Stack / routing / layout.** Astro 7.2.10 `output: static`, `@tailwindcss/vite` + `@theme` tokens in `src/styles/global.css`, GSAP 3.15.0 vanilla (`src/scripts/motion.ts`), `ClientRouter` (`astro:transitions`) in `src/layouts/BaseLayout.astro` with **no** `transition:animate` directive — Astro defaults to 180 ms `astroFadeIn/Out` `cubic-bezier(0.76,0,0.24,1)` (confirmed in archived dist `<style>`). Layout composes `Head`, `ClientRouter`, early `documentElement.classList.add("js")`, `SkipLink`, `WaterField` (`transition:persist="water-field"`, `aria-hidden="true"`, `loading="lazy"`), decorative `.bg-word` spans (`transition:persist="bg-words"`; three words: Backend / Engineer / Santiago), `SiteNav`, `<main id="main">`, `Footer`, and `motion.ts` imported via `<script>`.

**Motion implementation — verified on current disk.**

- **Entrance.** `global.css` baseline: `[data-entrance] { opacity:1 }`, `.js [data-entrance] { opacity:0; transform: translateY(14px) }`. GSAP timeline in `src/scripts/motion.ts:157-168` does `fromTo(entrances, { y:18, opacity:0 }, { y:0, opacity:1, duration:0.55, stagger:0.06, overwrite:"auto", ease:"power3.out" })` at `t=0`. On `onComplete` it adds `is-entrance-visible`, clears `transform`/`opacity` inline, and `clearWillChange()`. Aria/data: every `ClippedPanel` section and each `ProjectCard` (`data-entrance`, `transition-delay:${index*60}ms` inline) participates. Motion tokens in `global.css:54-58` exist (`--duration-fast 150ms`, `--duration-med 280ms`, `--duration-slow 520ms`, `--ease-out`) but are **not** wired to GSAP — GSAP uses literal `0.55`/`0.06`/`power3.out`.
- **Ambient.** `WaterField.astro` renders 9 (default) / 14 (dense on `/projects`) `.bubble` spans with `left/bottom/size/--bubble-dur/--bubble-x/animation-delay` inline; CSS `bubble-drift var(--bubble-dur) linear infinite` (11–23 s) and `.water-field__caustic` `water-drift 22s linear infinite alternate`. `motion.ts:191-228` animates persisted ambient only when `shouldAnimateAmbient` is true: `waterImg scale 1.04→1 duration 0.9 clearProps`, `caustic opacity 0→0.9 duration 0.6`, `bgWords x:-18→0 opacity 0→0.045 duration 0.7 stagger 0.08`. `collectAmbient():193-129` sets `shouldAnimateAmbient = !isPersisted || !document.documentElement.hasAttribute("data-astro-transition")` — so after a `ClientRouter` navigation where `data-astro-transition` is present, persisted `water-field`/`bg-words` are finalized to static `opacity 0.42/0.9` and **do not re-enter**. They remain fixed layers.
- **Parallax.** `setupParallax:232-261` gated by `allowsParallax() = !prefersReduced() && matchMedia("(hover:hover) and (pointer:fine)").matches`. Uses `gsap.quickTo(img,"x",{duration:0.9,ease:"power2.out"})` etc., RAF-batched `pendingX/Y = (client/width-0.5)*10/8`, veil at `0.6` scale. `mousemove` is `passive`, torn down in `killAll()` on `astro:before-swap`. Existing e2e proves coarse/no-hover produces no offset, fine+hover produces `translate|matrix` delta via `waitForFunction(t!==""&&t!=="none"&&t!==before)`.
- **Scroll.** No `scroll-snap`, no wheel handler, no overflow scroller, no `content-visibility` (verified via Grep). `global.css:281-283` `html { scrollbar-gutter: stable }` and `overflow-x: clip` only. Global `html { scroll-behavior:smooth }` was **removed** in the archived change — current `global.css` has only `@media(prefers-reduced-motion:reduce){ html{scroll-behavior:auto !important} }`. No site-wide smooth.
- **Card / panel hover.** `ProjectCard.astro:12` `article.clip-panel` has no hover transform; its inner CTA links use `transition-colors` inset `clip-path`, `hover:bg-ink hover:text-white` only. Index teaser cards `index.astro:88-94` use `hover:bg-surface-tint transition-colors` and `group-hover:gap-2` on the arrow — color + shadow + 1 px translateY on the primary button (`hover:translate-y-[1px] hover:shadow-[5px…]`) are the only displacement. Desktop panels have no lift/scale.
- **Potential paint costs (hypothesis, no trace yet).** Fixed `WaterField` `inset-0 z-index:-2` image `112%` + `transform:translateZ(0)` (compositor layer), `clip-path: polygon(...)` panels with `2px solid ink` + `8px offset shadow` (large paint region, clips trigger paint on scroll), `clip-panel--ghost` `backdrop-filter: blur(8px)` on `/projects` ghost panel, and three fixed `.bg-word` `skewX(-12deg)` spans. `will-change` is transient JS-only since the archive fix (set before timeline, cleared on complete/kill/swap); no standing stylesheet `will-change` remains.

**Prior archived change context.** `openspec/changes/archive/2026-09-03-ui-performance-seo-audit` verify-report is `pass_with_warnings` (31/34 scenarios compliant, 3 PARTIAL: seven-route Lighthouse baseline missing, scroll restoration depth, motionInitCount tautology). Motion/SEO invariants now shipped: `will-change` transient, global smooth removed, `SiteNav` lifecycle correct, LCP `priority` on hero `/` and profile `/about` only. Those invariants constrain this change: do not regress reduced-motion, hover/fine gating, or transient will-change.

### Verified hypotheses (re-checked on current disk)

| Hypothesis                                                        | Verdict                              | Evidence                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ClientRouter default fade ~180 ms flat                            | **Confirmed**                        | `BaseLayout` has bare `<ClientRouter />`, no `transition:animate`; archived dist shows default `astroFadeIn/Out 180ms cubic-bezier(0.76,0,0.24,1)`. Visually near-imperceptible on 6 menu scenes with no shared-element beyond `hero-image` (`transition:name` only on home).                                                                    |
| Panel entrance y18/0.55/stagger0.06 borderline imperceptible      | **Confirmed**                        | `motion.ts:159` `y:18 opacity0 duration0.55 stagger0.06 power3.out`. At 18 px over 550 ms the pixel velocity is ~33 px/s; stagger 60 ms produces a soft cascade that reads as a single fade at scroll speed or on 60 Hz without slow-motion stepping. DESIGN intends “subtle motion, not decoration” but the brief now asks for visibly legible. |
| Ambient WaterField/bubbles slow, persisted layers do not re-enter | **Confirmed**                        | CSS 22 s drift, 11–23 s bubbles; `collectAmbient` persist guard finalizes to static opacity on ClientRouter revisits. Second visit to same route shows no ambient re-entrance — background appears frozen relative to first load.                                                                                                                |
| Card hover mostly color/shadow, minimal displacement              | **Confirmed**                        | `ProjectCard` and index teaser `transition-colors` only; compare to docs/hover affordance — no `translate/scale` on card root, only button shadow nudge. On desktop `pointer:fine` the dossier grid feels static.                                                                                                                                |
| No scroll-snap/wheel/overflow scroller                            | **Confirmed**                        | Grep `scroll-snap                                                                                                                                                                                                                                                                                                                                | wheel.*handler | overflow.*scroll | content-visibility` empty; scroll is native document scroll only. “Blocky scroll” is not caused by a JS scroller. |
| Scroll paint cost candidates, no frame trace yet                  | **Confirmed hypothesis, unmeasured** | Fixed layers + clip-path + backdrop-filter are paint/composite suspects per web.dev composite guidance, but **no frame trace exists** — Lighthouse single sample was LCP only, no scroll/jank trace. Must not change blur/layers before evidence.                                                                                                |

## Affected Areas

- `src/layouts/BaseLayout.astro` — `ClientRouter` policy (`transition:animate` choice), `transition:persist` on `WaterField`/`bg-words`, shared slot that hosts route/page motion.
- `src/scripts/motion.ts` — entrance timeline (`y`, `duration`, `stagger`, `ease`), `shouldAnimateAmbient` persist guard, `setupParallax` gating + RAF, `watchReducedMotion` live toggle, lifecycle `astro:page-load` / `astro:before-swap` → `destroyMotion`/`killAll`.
- `src/styles/global.css` — entrance baseline/visible classes, `WaterField` + `bubble` keyframes, `clip-panel`/`clip-panel--ghost` (`backdrop-filter`), `.bg-word` fixed layers, motion tokens (`--duration-*`, `--ease-*`), `@media(prefers-reduced-motion:reduce)` reset.
- `src/components/WaterField.astro` — persisted decorative field, bubble count/variant, `loading="lazy"` image, `aria-hidden`.
- `src/components/ClippedPanel.astro` — panel primitive used on every route; clip size, ghost/tint modifiers, shadow.
- `src/components/ProjectCard.astro` — dossier card on `/projects` (data-entrance, `transition-delay`, hover affordance to be made visible on desktop).
- `src/pages/*.astro` — six routes (`/`, `/projects`, `/skills`, `/experience`, `/about`, `/contact`) + `404.astro` — each scene's panel set that currently shares identical `data-entrance` treatment with no per-scene staging.
- `src/components/SiteNav.astro` — sticky header `top-0 z-40 border-b-[3px]` — fixed layer that may contend on scroll; `will-change: auto` inline already present.
- `e2e/interaction.spec.ts` — entrance final-state, `will-change` transient, parallax gating, reduced-motion, persist teardown assertions; must evolve from final-state-only to in-flight + token-seam checks (see Tests below).
- `openspec/specs/{runtime-motion,runtime-performance}` — current specs (frozen) and the new `visible-motion-scroll-trace` delta(s) that this exploration will draft (not written here).

## Approaches

### 1. Calibrated tokens — make existing motion legible without new choreography

Adjust only timing/spatial values inside the current `motion.ts` + `global.css` language: wire `global.css` tokens to GSAP, separate page vs panel vs card, keep ambient gated, keep `will-change` transient. Route transition stays at Astro default fade (or subtly tuned via `transition:animate` API) — no new shared-element choreography.

- **Entrance.** Page container `fade+ y 0→` with `duration 0.45–0.65 token` + `power2.out` (crisp, not bouncy); panels cascade `stagger 0.08–0.10` capped at 5, delay from `data-index` not global timer; cards on `/projects` stagger `0.07` only on desktop/motion-ok, reduced-motion collapses to opacity instant. Ambient: on first load, single 0.8–1.0 s `water scale` is enough — do not extend bubble/caustic; on `shouldAnimateAmbient==false` keep static (no re-animate, avoids jarring re-drift). Optional: re-enable a 250 ms ambient re-fade on revisit (opacity only) if user research flags the freeze as stale — default is keep static.
- **Route transition.** Keep document fade but lift to **220–260 ms** `ease-out` for perceptibility (still non-spectacular) via `transition:animate="fade"` re-export or Astro 8 `ViewTransition` API if adopted. No slide — slide would imply spatial metaphor the six menu scenes do not share. Spec must pick one duration value (single source: `global.css --duration-med` mapped to Router).
- **Card hover (desktop, fine+hover only).** Add compositor-safe `transform translateY(-2px)` + `shadow 8→10px` on `ProjectCard` root gated by `@media (hover:hover) and (pointer:fine)` and `prefers-reduced-motion:no-preference`. Keep color; displacement is the only new signal. Never gate card affordance on hover alone — touch still gets chips/links.
- Pros: Inherits DESIGN palette/typography — no new visual identity; smallest diff (<150 lines); preserves all a11y gates; low reviewer load; rehearsal is the existing system tuned for perceptibility.
- Cons: Perceptibility lift is incremental — may still feel restrained if stakeholders expected authored delight; does not fix scroll jank if root cause is paint (separate trace step required).
- Effort: Low

### 2. Staged scene choreography — typed panel/card roles + route as focal sequence

Introduce a compact motion thesis: `Focal moment = page load / ClientRouter navigation`; `Continuity = panel dossier stays clipped but animates as a group`; `Feedback = card hover lift on desktop`; `Frequency = navigation is occasional → standard motion is earned, card hover is frequent → 120–150 ms only`. Implement via `data-entrance-role="page|panel|card"` and a variant map in `motion.ts` (`page: y10 opacity 0 duration 0.45`, `panel: y16 stagger 0.09`, `card: y12 stagger 0.07`) with interruptibility (`overwrite:auto`, `quickTo` unchanged). Route uses `transition:animate="fade"` + shared `hero-image` retained + one new shared element (`panel-heading`) only if measured as non-jarring. Ambient stays bounded: pause bubble `animation-play-state` when `document.hidden`.

- Pros: Perceptibility without spectacle — roles make the menu feel intentional; reuse existing tokens; test seams are deterministic (`role` variants).
- Cons: More surface to verify (six routes × two viewports × reduced-motion × touch); risk of generic stagger spray if roles are ignored and every element gets identical treatment.
- Effort: Medium

### 3. Measured-native + addressable scroll layer budget (NOT taken before trace)

Keep Approach 1/2 for motion, but **after** trace evidence, conditionally address the scroll layer budget only if trace proves overflow: reduce `clip-panel--ghost` blur area, contain fixed layers with `contain: paint`, or promote `WaterField` caustic off main-thread with `transform`-only isolation. Earlier archived evidence left `backdrop-filter: blur(8px)` and full-viewport fixed fields as the likely paint budget.

- Pros: Ties paint change to frame evidence, satisfies the “no blur/layer change before evidence” constraint; targets real bottleneck.
- Cons: Highest complexity; requires the trace protocol below to be executed before any paint change; not authorized to ship in the same slice as motion tuning unless trace already proves the bottleneck.
- Effort: High (trace + fix + re-measure)

## Recommendation

**Adopt Approach 1 as the proposal baseline, with Approach 2’s role map as a bounded variant to be confirmed via design admission.**

Rationale: the brief asks for “visibly legible” without spectacle or new identity — calibrating the existing GSAP language (distance, duration, stagger, ease, hover lift) satisfies it with the smallest durable change and keeps the motion system cohesive via existing `--duration-*`/`--ease-*` tokens. Approach 2’s roles are compatible as a seam inside Approach 1 (no extra dependency), so the proposal can draft one variant set and let a 30-second admission pick the final stagger/display values rather than building a second system. Approach 3 is correctly gated behind the scroll trace and must not ship as a speculative optimization — it violates the performance-optimization hard rule (“measure before optimizing”) and the brief’s explicit gate.

Proposal shape — two tracked slices, both on this change branch:

1. **Motion salience (this change’s deltas).** One `runtime-motion` extension for `visible-motion` (page/panel/card legibility, desktop hover lift gated, reduced-motion preserved) plus one `runtime-performance` addendum that only defines the scroll/trace protocol as **measurement**, not as a paint fix.
2. **Scroll evidence (following slice on same change).** Execute the trace protocol, attach the evidence, and only then — if frames prove backdrop/clip/fixed attribution — propose the minimal layer/blur containment fix. No claim of “scroll fix” without that report.

No dependency added, no route identity changed, global `scroll-behavior:smooth` stays removed.

## Risks

- **Spectacle vs legibility drift.** Tuning y/stagger/ease without a thesis can slide into generic entrance spray. Mitigation: proposal drafts a single `motion thesis` paragraph (focal/continuity/feedback/frequency/budget per `references/animate.md`) and a variant table with one chosen stagger/duration per role.
- **Reduced-motion regression.** Increasing displacement risks reducing the reduced path to “too much gone” or “still moves.” Mitigation: reduced-motion assertions stay: every variant collapses to `opacity` instant + `transform:none`, verified via `emulateMedia({reducedMotion:"reduce"})` on load and after ClientRouter back/forward.
- **Persisted ambient freeze vs re-animate.** Re-animating persisted layers on every navigation re-introduces the stale-layer bug the archive fixed; keeping them static may feel flat. Mitigation: default static with a measured 250 ms opacity re-fade option behind a feature-flag decision owned by Product/design admission (not invented here).
- **Carousel-assumed parallax on sticky header + fixed fields.** Adding card lift plus existing parallax + drift may tip desktop compositing budget on low-end. Mitigation: trace protocol includes a desktop fine+hover scroll run and a `will-change: transform` budget check; parallax/Sticky header stays `auto` unless trace proves need.
- **Test brittleness (screenshot timing).** Asserting screenshots mid-animation under variable scheduling is flaky and slow. Mitigation: salience tests use deterministic in-flight observable or token seams (see below), not screenshots.
- **ClientRouter measurement variance.** 180 vs 260 ms route fade differences are within run-to-run jitter if measured only once. Mitigation: trace protocol requires repeated navigations and `astro:page-load` timing, not a single Lighthouse score.

## Trace Protocol — executable browser trace for blocky scroll (measurement only, no fix yet)

**Authority:** performance-optimization hard rule + archive finding “no frame trace yet” + `references/motion-quality.md` rendered-verification method. This protocol is the prerequisite for Approach 3.

** Representative route selection.** Use the longest scrollable routes: `/experience` (timeline panels) and `/projects` (dense dossier grid + ghost panel with `backdrop-filter`) as primaries; `/` as control (short, hero `view-transition` image present). `404` excluded. Document measured content height per route before each run.

** Matrix (all combinations unless flagged impractical).**

| Run | Route         | Viewport | Input path                                      | Parallax      | Ambient | Hover media                   | Attributions on                                                                                                                    |
| --- | ------------- | -------- | ----------------------------------------------- | ------------- | ------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| D1  | `/projects`   | 1280×800 | wheel 5× 400 px + drag scrollbar 600 px, 60 fps | fine+hover ON | ON      | `hover:hover + pointer:fine`  | WaterField fixed, `.water-field__caustic`, `.bubble` drift, `clip-path` panels, `backdrop-filter` ghost, sticky header, `.bg-word` |
| D2  | `/experience` | 1280×800 | same                                            | ON            | ON      | same                          | same minus blur (no ghost)                                                                                                         |
| M1  | `/projects`   | 390×800  | finger scroll 4 flicks + slow drag              | OFF (coarse)  | ON      | `hover:none + pointer:coarse` | same, no parallax                                                                                                                  |
| M2  | `/experience` | 390×800  | same                                            | OFF           | ON      | same                          | same                                                                                                                               |
| C   | `/`           | 1280×800 | wheel 400 px ×3                                 | ON            | ON      | fine+hover                    | control                                                                                                                            |

Each run performed both **fresh load** and **ClientRouter revisit** (navigate to `/about` then Back) to capture persisted-layer contention.

** Toolchain (existing project tools first, no new dep).**

1. **Chrome DevTools Performance trace (preferred).** Use a harness-native browser via `chrome-devtools` MCP or `playwright trace` fallback: `npx playwright test --debug=cli` attach pattern per `playwright-cli` skill, or raw CDP `Performance.enable` / `Tracing`. Capture: `Timeline` with `Frames`, `Main thread` flame, `Paint`, `Layer borders`. Steps per run:
   ```
   startTracing({ categories: ["devtools.timeline","disabled-by-default-devtools.screenshot"],
                  screenshots:true, enableJSProfile:false })
   load route → waitForFunction([data-entrance] opacity 1) → idle 700 ms
   scroll sequence (record exact delta/timing from protocol) → idle 400 ms
   stopTracing → save trace.json
   ```
2. **Frame metrics extraction (no invented numbers).** From trace: `FPS/frame time` per second window, `long tasks >50ms` on main, `Layout/Paint` duration spikes aligned to `clip-path`/`backdrop-filter` layers, `Composite` duration, `will-change` promotion count. Report as table per run: median FPS during scroll, % dropped frames, top 3 long tasks with stack attribution.
3. **Layer / paint attribution.** DevTools Layers panel (or `chrome-devtools` layer view) to list composited layers: `WaterField`, `water-field__caustic`, `clip-panel` group, `ghost blur`, `.bg-word` fixed, sticky header. Record layer count and memory; note which layer(s) repaint on scroll (checkerboard vs compositor-only).
4. **Consistent conditions.** Same build (`SITE` unset, production `--host` preview `pnpm build && pnpm preview --port 4321`), same Chrome stable, CPU throttling **4×** for desktop runs, **6×** for mobile-emulated (match archive 4× baseline where feasible), `prefers-reduced-motion: no-preference`, `hover+fine` forced via `page.addInitScript` for D runs, `coarse/no-hover` for M runs. Viewport pinned per protocol, DPR 1 baseline. Repeat each run **3×** and report median — never a single sample as claim.
5. **Evidence artifact shape.** `openspec/changes/visible-motion-scroll-trace/traces/` (git-ignored traces) + committed `traces/summary.md` summarizing: route, viewport, input path, frame stats, layer attribution, and the **decision gate** — `blur/layer change is warranted iff median FPS < 50 or > 2 long tasks aligned to ghost/clip/fixed layers in 2/3 runs; else motion salience ships alone`.

** No invented metrics.** Thresholds above are protocol gates, not claims — they mirror web.dev LCP/INP/CLS wording style (sources S-24..S-27) but main-thread frame evidence is reported verbatim from trace output. The proposal MUST NOT cite a frame rate until traces are actually captured.

** Feasibility.** Feasible today: `playwright` 1.62.1 + `chrome-devtools` MCP are available in-repo (verify report used DevTools at `127.0.0.1:4321`). No new infra; traces can be reproduced locally or in CI with `npx playwright test` + `trace:true`. Risk: mobile touch attribution requires `playwright` `hasTouch` + `isMobile` emulation — that path must be mirrored by DevTools touch emulation to attribute parallax OFF correctly.

## Salience vs Performance — acceptance separation

| Concern                               | What it proves                                                                  | Metric belongs to salience                                                                                              | Metric belongs to performance                                                                                                                           | Pass rule                                                                                                                                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Route/page entrance legibility**    | User perceives a page change happened (not a teleport), without feeling latency | `duration`, `y` displacement, `stagger`, `ease`, **in-flight opacity/transform observable** vs **no-screenshot timing** | Frame rate / main-thread during navigation (performance) — must not jank, but not the legibility proof                                                  | Reduced-motion off: `page` variant completes opacity 1 + transform none; in-flight snapshot at `t=120ms` (or midpoint) shows `0<opacity<1 && y in (4,14)px` — inherited by reduced-motion collapsed test |
| **Panel cascade legibility**          | Panel group reads as intentionally staged, not single fade                      | `data-entrance-role` token mapping, `stagger` interval, max cascade window ≤ 600 ms                                     | Paint during cascade (no long task >50 ms); layer count                                                                                                 | Panels of same role show monotonically increasing `transition-delay`/GSAP stagger; reduced-motion collapses cascade                                                                                      |
| **Desktop card hover legibility**     | Dossier card has palpable feedback on desktop                                   | `hover` translateY/shadow token applied only when `(hover:hover and pointer:fine) and !reduce`; duration `150–220 ms`   | Hover does not trigger layout (transform-only) and does not create new composited layer leak                                                            | On fine+hover, `mouseenter` produces `translateY(-2px)` computed and `will-change: transform` only during hover transition                                                                               |
| **Scroll smoothness (blocky scroll)** | Scroll does not visibly drop frames or stutter on long routes                   | Scroll itself is **not motion salience** — legibility is navigation/hover, scroll must merely not be blocky             | **Frame metrics only**: median FPS during documented scroll path, long-task count, paint/composite attribution to `fixed / clip-path / backdrop-filter` | Trace protocol (above) — no perf fix without failing gate; motion change must not worsen FPS vs baseline median                                                                                          |

Tests **must not** merely assert final `opacity:1` / `transform:none`. Every salience requirement gets one of these deterministic seams instead of screenshot mid-frame:

- **In-flight observable via animation clock.** Playwright captures GSAP state at a well-defined tick: `page.evaluate(()=> new Promise(r=> requestAnimationFrame(()=> r(getComputedStyle(el).opacity))))` inside `page.waitForFunction` after `runEntrance` but before `onComplete`. Or expose a `data-entrance-progress` probe only under test (`__visibleMotionProbe` counter) that increments on `tl.call` — then `expect(probe >0 && intermediateOpacity <1)` triangulates that the intermediate was real, not a tautology. The e2e file already uses `waitForFunction(t!==""&&t!=="none"&&t!==before)` — same pattern reused for entrance.
- **Token / API seam.** Assert the variant map exists and is consumed: `expect(getComputedStyle(document.documentElement).getPropertyValue('--duration-med')).toBe('280ms')` plus `motion.ts` exports `ENTRANCE_VARIANTS.page.duration === cssToken` (unit test), so production cannot shadow the token with a hardcoded `0.55` without breaking the test. One assertion per role is enough — no screenshot needed.
- **Hover gating seam.** `@media (hover:hover) and (pointer:fine)` block contains `translateY`, verified via `page.emulateMedia` matrix (fine vs coarse) + `getComputedStyle(card).transform` after synthetic `mouseenter`/`mouseleave` dispatched with `hover` override — deterministic, no timing flake.

## Tests — required / forbidden / retained

- **Forbidden.** New screenshots asserted with `toMatchSnapshot` at a guessed 200 ms; `expect(opacity).toBeTruthy()` (tautology); `waitForTimeout(N)` as the only proof an animation happened; asserting `scrollBehavior === "smooth"` as success.
- **Required new.** One unit per `ENTRANCE_VARIANTS` token wiring; one e2e per route for in-flight intermediate (not final) + reduced-motion collapse; one e2e for desktop hover lift gated on fine+hover vs coarse; one trace-summary artifact (not a test) attached to the next slice before any blur/layer PR.
- **Retained existing.** `e2e/interaction.spec.ts` final-state will-change/parallax/persist/teardown tests stay and gain in-flight companion assertions in the same file — do not duplicate them as a second suite. `src/lib/site-helpers.test.ts` / copy-deny style does not apply here — motion assertions live in `motion.test.ts` if introduced.

## Reuse vs New Research

- **Valid to reuse.** `research.md revision 1 (2026-09-03)` via Context7/MDN/web.dev/Schema already gives authoritative coverage for: `ClientRouter` lifecycle + `transition:persist` (S-01..S-05), `astro:assets` `priority/fetchpriority` (S-06..S-09), `will-change` transient pattern (S-13..S-15), `prefers-reduced-motion` (S-16), `scroll-behavior` semantics (S-17), `transform` compositor (S-18..S-20), sitemap/robots/canonical/OG/sameAs (S-10..S-12, S-30..S-33), Lighthouse/CWV thresholds (S-24..S-27), GSAP import surface (S-35..S-36). All accessed 2026-09-03 and still current — no contradictions on those questions.
- **State whether NEW external research materially improves this proposal.** **No.** A new `ctx_fetch_and_index` / Context7 pass would not materially improve the **motion salience** proposal because the thesis/timing/accessibility choices here are bounded product craft guarded by existing admissions (`animate.md` / `motion-quality.md` / `DESIGN.md` tokens), not by missing spec language. The only question where new research would add value is **pre-fix scroll attribution** once the trace protocol is actually executed — e.g., re-fetching Chromium paint/layer/blur budgeting guidance keyed to the specific attributed layer from the trace, which cannot be keyed until the trace exists. Therefore: do **not** run a second research slice before the proposal; instead add one research follow-up _after_ traces are attached if the trace gates a `backdrop-filter`/`clip-path` containment change.

## Decisions Confirmed vs Open

- **Confirmed (do not re-decide in proposal; cite this exploration).**
  - Page/panel/desktop card motion will be made visibly legible — but within current DESIGN palette/typography/clip grammar, no new visual identity, no spectacle.
  - A real scroll frame/main-thread trace will be captured on representative long routes **before** any `backdrop-filter` or fixed-layer change.
  - `prefers-reduced-motion: reduce` path stays contractual and live-toggled (CSS + JS teardown); never ships reduced motion as “motion erased entirely” — opacity/state feedback remains.
  - `fine pointer + hover` gating stays; touch/coarse never depends on hover lift.
  - No global `scroll-behavior:smooth` restoration.
  - `will-change` stays transient JS-only; no standing stylesheet hint.

- **Open and human-owned (must close via admission before proposal locks).**
  - Final **duration/y/stagger/ease** numbers per variant (approaches above propose ranges; one owner-picked tuple per variant must be named).
  - **Route transition duration** within 220–260 ms window (or keep 180 if perceptibility goal is met by panels alone) — belongs to Product/design admission, not engineering guess.
  - **Card hover displacement budget** — owner to approve `-2px` vs `-3px` + shadow lift, and whether teaser row gets the same lift or only dossier cards.
  - **Ambient revisit behavior** — static forever vs 250 ms opacity re-fade on `ClientRouter` revisit (craft judgment the owner must pick after seeing both).
  - Which two routes + viewport pair constitute the **authoritative trace** baseline archived as `traces/summary.md` (proposal recommends `/projects` + `/experience` at 1280 + 390).

## Risks (short)

See Risks section above; the highest are reduced-motion regression, persist freeze vs re-animate choice, parallax/header compositing contention, and flaky screenshot timing if salience is not tested via deterministic seams.

## Ready for Proposal

**Yes.** Required product choices are now split into confirmed (above) and explicitly open/owned; the motion/legacy system is verified on current disk via CodeGraph + source reads; funded research is sufficient to reuse; the blocked change (backdrop/layer) is correctly gated on a trace whose protocol is defined and feasible with existing tooling. The proposal can be drafted single-slice for motion salience with a companion measurement slice for the scroll trace — **stop if admission for the open variants (duration/stagger/hover displacement/ambient revisit) has not closed**.

## References

- Current: `src/scripts/motion.ts`, `src/styles/global.css`, `src/components/WaterField.astro`, `src/components/ClippedPanel.astro`, `src/components/ProjectCard.astro`, `src/layouts/BaseLayout.astro`, `src/components/SiteNav.astro`, `src/pages/*.astro`, `PRODUCT.md`, `DESIGN.md`, `docs/CODEBASE-GUIDE.md`, `playwright.config.ts`.
- Archived: `openspec/changes/archive/2026-09-03-ui-performance-seo-audit/{exploration,proposal,research,specs/*}/`, `verify-report.md`, `astro.config.mjs`, `e2e/interaction.spec.ts`.
- Craft/Perf: `.agents/skills/sdd-ui/references/{critique,motion-quality,animate,audit,optimize}.md`, `.agents/skills/performance-optimization/references/measure-and-fix.md`, `.agents/skills/behavioral-correctness/references/test-quality.md`, `.agents/skills/astro-framework/references/view-transitions.md` (load on proposal).
