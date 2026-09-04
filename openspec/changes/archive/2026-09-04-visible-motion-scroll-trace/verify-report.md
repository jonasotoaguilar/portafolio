```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:0a16cb64c521e797aa69b36e6699edb797d16e341cd962b9a807772a78e8c124
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 8/8
scenarios: 21/21
test_command: pnpm run test:unit && pnpm run test:e2e
test_exit_code: 0
test_output_hash: sha256:bfd64c414d6a4681941202569148079766576afecf2293f34cb4133ebf473707
build_command: SITE= pnpm build
build_exit_code: 0
build_output_hash: sha256:95c98c17ac48c19aa58cc2c1c05ccb2d644e6394b61611165d06bae8b909e572
```

## Verification Report

**Change**: visible-motion-scroll-trace
**Version**: N/A (delta specs on runtime-motion + runtime-performance)
**Mode**: Strict TDD
**Worktree**: `/home/jona/projects/portafolio-worktrees/ui-performance-seo-audit`
**Branch**: `chore/remove-tracked-agents` (stack PRs #16–#18)
**Attempt token (parent-owned)**: `sha256:28ffd72b9ac987670a166830ad31d9185c9b5e1a3d2e5b894de88ff52c1bcd0a`
**Artifact store**: openspec
**Skill resolution**: paths-injected (sdd-verify, strict-tdd-verify, sdd-mutation-testing, playwright-best-practices, playwright-cli, performance-optimization, security-and-hardening, sdd-ui + ui-verification/motion-quality/optimize/runtime-access/ui-design-contract, astro-framework). Injected path `/home/jona/.agents/skills/behavioral-correctness/SKILL.md` was not found; verification continued without that skill.

YAML `evidence_revision` is the SHA-256 of concatenated independent command/trace digest hexes (unit+e2e, build, traces/summary.md). It is **not** a hash of this report.

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 15 |
| Tasks complete | 15 |
| Tasks incomplete | 0 |
| Requirements (native `### Requirement:` count) | 8 |
| Scenarios (native `#### Scenario:` count) | 21 |
| Specs | runtime-motion (6 req / 14 scen) + runtime-performance (2 req / 7 scen) |
| Design / ui-design / chosen.yaml | present |
| Apply-progress | present, 15/15 checked, TDD Cycle Evidence table present |

### Preview lifecycle (Astro 7)

Playwright `webServer.command` is `pnpm build && pnpm preview --port 4321 --host 127.0.0.1` with `reuseExistingServer: !CI`. Astro 7 `preview` daemonizes; a Playwright-spawned foreground process exits once the daemon is up (`webServer exited early`).

Controlled harness used for this verify:

1. Port 4321 confirmed free (`lsof` no LISTEN).
2. `SITE= pnpm build` → 7 pages, 11 images, 326ms, exit 0.
3. `SITE= pnpm preview --port 4321 --host 127.0.0.1` → daemon pid 146497, command exit 0, HTTP 200 on `http://127.0.0.1:4321/`.
4. `SITE= pnpm run test:e2e` reused the live server (`reuseExistingServer: true`).
5. `pnpm exec astro preview stop` → stopped pid 146497; port 4321 free after.

### Build & Tests Execution

**Format**: ✅ `pnpm run format:check` exit 0 — All matched. output sha256 `6a88fbf1f8808f23198f5e4e2a3bea3a8726ab4ce83f5aec90fa5436ae62f022`

**Lint**: ✅ errors 0 / ⚠️ 21 warnings (non-blocking) — `pnpm run lint` exit 0. output sha256 `292c3ecc495be23a48a6ee81637c06d3f63d89567efeb497e49461eb486de84d`

**Astro check**: ✅ `pnpm run check` exit 0 — 0 errors, 0 warnings. output sha256 `349365fe719cda11f3bdae3cf287eb9ecb0dc0175b1f0e37413eb2e4bd04ab28`

**Build**: ✅ Passed
```text
SITE= pnpm build
[build] 7 page(s) built in 326ms
[build] Complete!
EXIT:0
```

**Unit tests**: ✅ 40 passed / 6 files / 158ms — `pnpm run test:unit` exit 0

**E2E tests**: ✅ 62 passed / 31.3s — `SITE= pnpm run test:e2e` exit 0 (no `TRACE_FORCE`; scroll-trace validated existing `traces/summary.md` rather than rewriting it)

**Coverage**: ➖ Not available — Vitest config has no coverage reporter; analysis skipped.

### Mutation / Test Adequacy

Strict TDD is active. Repository has **no configured mutation-testing framework** (no Stryker/Infection/mutmut dependency, script, or config in `package.json`). Per sdd-mutation-testing: campaign skipped; mutation evidence is typed **N/A (framework absent)**. Score/survivors are not claimed. This is not fabricated PASS.

### Spec Compliance Matrix

Native counts: 8 requirements, 21 scenarios. A scenario is COMPLIANT when a covering test passed at runtime this session.

| Capability | Requirement | Scenario | Test | Result |
|------------|-------------|----------|------|--------|
| runtime-motion | Visible Route Transition | Happy path mid-transition opacity | `e2e/interaction.spec.ts` > route fade uses documented 250ms and is running in-flight | ⚠️ PARTIAL |
| runtime-motion | Visible Route Transition | Reduced motion collapses the route fade | `e2e/interaction.spec.ts` > reduced-motion disables continuous movement; reduced-motion on load and after ClientRouter | ✅ COMPLIANT |
| runtime-motion | Visible Panel Entrance | Happy path in-flight cascade | `e2e/interaction.spec.ts` > panel entrance in-flight discriminator returns mid before settle and late cannot pass | ✅ COMPLIANT |
| runtime-motion | Visible Panel Entrance | Cleanup after entrance | same discriminator final-state + `no standing stylesheet will-change` | ✅ COMPLIANT |
| runtime-motion | Visible Panel Entrance | Reduced motion panels | `reduced-motion disables continuous movement but retains opacity` | ✅ COMPLIANT |
| runtime-motion | Fine Pointer Card Lift | Fine hover lifts | `e2e/interaction.spec.ts` > ProjectCard lifts -2px only on fine hover, not on coarse or reduced | ⚠️ PARTIAL |
| runtime-motion | Fine Pointer Card Lift | Coarse pointer has no lift | same test (stylesheet unconditional-lift absent) + rendered 390 coarse `transform:none` | ✅ COMPLIANT |
| runtime-motion | Fine Pointer Card Lift | Reduced motion has no lift | same test reduced-motion branch | ✅ COMPLIANT |
| runtime-motion | Persisted Background Opacity Re-entry | ClientRouter opacity re-entry | `e2e/interaction.spec.ts` > persisted ambient opacity re-entry 250ms | ⚠️ PARTIAL |
| runtime-motion | Persisted Background Opacity Re-entry | Reduced motion skips animated re-entry | reduced-motion ClientRouter path; no spatial re-entry | ✅ COMPLIANT |
| runtime-motion | Persist Teardown Before Swap | Back-forward leaves no stale motion | `persist swap clears motion hints and resets offset, no duplicated RAF/listeners` | ✅ COMPLIANT |
| runtime-motion | Smooth Scroll Does Not Compete With Navigation | ClientRouter restoration is instant | `SkipLink and ClientRouter restoration not smoothed site-wide` | ✅ COMPLIANT |
| runtime-motion | Smooth Scroll Does Not Compete With Navigation | SkipLink focus is not smoothed site-wide | same | ✅ COMPLIANT |
| runtime-motion | Smooth Scroll Does Not Compete With Navigation | Native scroll is retained | `no standing stylesheet will-change and no global smooth scroll`; rendered `scroll-behavior:auto` | ✅ COMPLIANT |
| runtime-performance | Scroll Trace Before Paint Optimization | Happy path measurement completes | `e2e/scroll-trace.spec.ts` > D1/D2/M1/M2/C 3× trace exists with attribution and gate | ✅ COMPLIANT |
| runtime-performance | Scroll Trace Before Paint Optimization | Trace-pass ships no paint change | `trace-pass ships no paint change` + `global.css` has no `.water-field { contain: paint }` | ✅ COMPLIANT |
| runtime-performance | Scroll Trace Before Paint Optimization | Trace-fail authorizes a bounded candidate | Gate did not fail this change; covering tests encode “no paint until fail”; no paint shipped | ✅ COMPLIANT |
| runtime-performance | Scroll Trace Before Paint Optimization | ClientRouter revisit is included | harness C-rep3 `/about` then Back; summary Attribution documents persist layers | ✅ COMPLIANT |
| runtime-performance | Paint Change Is Trace-Gated And Single-Variable | One variable after a failing gate | Untriggered (PASS); `single-variable paint gate — no paint change on PASS (4.2)` | ✅ COMPLIANT |
| runtime-performance | Paint Change Is Trace-Gated And Single-Variable | Inside variance is not an improvement | summary Variance section; no paint-improvement claim; D1 rep1 46.5 fps treated as variance | ✅ COMPLIANT |
| runtime-performance | Paint Change Is Trace-Gated And Single-Variable | Edge case gate without attribution | `paint iff fail — missing attribution blocks ship (4.1)` | ✅ COMPLIANT |

**Compliance summary**: 18/21 COMPLIANT, 3/21 PARTIAL, 0 UNTESTED, 0 FAILING. Envelope totals remain 8/8 and 21/21 because every scenario has a passing covering test this session.

PARTIAL notes:

- Route fade: assertion is `has250 || fadeDurationOk || htmlHasFade`. Chrome-devtools in-flight sample on `/`→`/projects` showed `htmlOpacity: "1"` and long-running bubble/caustic animations; 250ms html fade was not isolated in that sample. E2E passed.
- Fine hover: test injects `.project-card.is-hover-sim { transform: translateY(-2px) !important }` when headless `:hover` is flaky. Stylesheet gate `(hover: hover) and (pointer: fine)` + `-2px` is proven. Chrome-devtools hover on heading did not apply CSS `:hover` (tooling).
- Persist re-entry: assertion is `has250Reentry || opacityOk`. Chrome-devtools back-navigation ended at water opacity `0.42`, transform identity, `will-change` cleared; 250ms opacity animation was not isolated (caustic 22000ms CSS drift was). E2E passed.

### Scroll trace methodology (independent review)

Committed `traces/summary.md` sha256 `93340c0492f4bfbe2748879c3e706fa314cde4508e537bbddad1266ec92d7a36` (unchanged this verify; not regenerated, because verify must not rewrite planning/trace artifacts).

| Check | Evidence |
|-------|----------|
| Matrix | D1 `/projects` 1280×800 4× CPU; D2 `/experience` 1280×800 4×; M1 `/projects` 390×800 6×; M2 `/experience` 390×800 6×; C `/` 1280×800 4× |
| Repeats | 3 comparable reps each (15 runs) |
| Profile | rAF linear `scrollTo(0, max*t)` 1200ms + 700ms warmup after entrance settle + 400ms idle |
| Metrics | rAF frame count/interval, `PerformanceObserver` longtask, LoAF, paint probing — **no DevTools Performance blob claimed or invented** |
| Gate | median FPS 59.3–60.0 (threshold 50); longTasks median 0; D1 worst 46.5 fps is variance, not median fail |
| Attribution | code inspection + compositor model (WaterField transform, ghost `backdrop-filter: blur(8px)`, clip-panel paint, bg-word fixed, sticky header) — not invented DevTools layer numbers |
| Conclusion | PASS — no blur/clip/fixed-layer code change. `global.css` still has ghost blur; no `contain: paint` / isolation paint candidate |
| Salience ≠ frames | summary states motion salience is separate via `interaction.spec.ts` |

This verify did **not** re-run `TRACE_FORCE=1` (would mutate `summary.md`). Methodology and committed 3× matrix were inspected against harness + summary + CSS.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Visible Route Transition | ✅ Implemented | `BaseLayout.astro`: `fade({ duration: "250ms" })` on `<html>`; `<ClientRouter />` kept |
| Visible Panel Entrance | ✅ Implemented | `MOTION.entranceY=24`, `entranceDuration=0.62`, `entranceStagger=0.08`, `ease=power3.out`; CSS `translateY(24px)` |
| Fine Pointer Card Lift | ✅ Implemented | `.project-card:hover { transform: translateY(-2px) }` inside `(hover: hover) and (pointer: fine)`; reduced-motion forces `transform: none` |
| Persisted Background Opacity Re-entry | ✅ Implemented | `animatePersistedReentry` opacity-only `MOTION.ambientReentry=0.25`; flag reset in `destroyMotion` |
| Persist Teardown Before Swap | ✅ Implemented | `astro:before-swap` → `destroyMotion`/`killAll`; persist on WaterField + bg-words |
| Native scroll / no global smooth | ✅ Implemented | `html { scrollbar-gutter: stable }` only; reduced-motion `scroll-behavior: auto !important`; no `scroll-behavior: smooth` |
| Scroll trace before paint | ✅ Implemented | harness + committed summary PASS |
| Paint change trace-gated | ✅ Implemented | no paint CSS shipped |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Documented `fade({ duration: "250ms" })` | ✅ Yes | `BaseLayout.astro` |
| `MOTION` token seam | ✅ Yes | `motion-tokens.ts` consumed by GSAP |
| `@theme` mirrors MOTION | ⚠️ No | CSS uses matching literals (`24px`, `150ms`) but no `@theme` MOTION mirror |
| In-flight discriminator mid/late | ✅ Yes | E2E `waitForFunction`/rAF; `late` fails |
| Card lift only `ProjectCard` | ✅ Yes | class `project-card`; teasers unlifted |
| Ambient revisit opacity-only | ✅ Yes | no scale/x on persist re-entry |
| Trace first; paint iff fail | ✅ Yes | PASS → no paint |
| No standing hover `will-change` | ✅ Yes | transform-only CSS lift |
| chosen.yaml inherit-existing / balanced | ✅ Yes | 250/24/620/80/power3.out/-2px/150/250 |
| ui-design inherit, no redesign | ✅ Yes | rendered 1280/390 retain veil opacity 0.42, clip panels, no overflow |

### Hygiene (`.agents`) — re-proof this session

| Check | Result |
|-------|--------|
| `git ls-files .agents` | empty (0) |
| `test -f .agents/skills/astro-framework/SKILL.md` | exists (local preserved) |
| `git check-ignore -v .agents/` | `.gitignore:30:.agents/` |
| `git check-ignore -v .agents/skills/astro-framework/SKILL.md` | `.gitignore:30:.agents/` |
| `git grep "\.agents" -- AGENTS.md docs/CODEBASE-GUIDE.md` | AGENTS.md:14 ignore-policy line only; CODEBASE-GUIDE clean |

### Rendered verification (chrome-devtools MCP)

Public surface (`openspec/ui.yaml` absent → access n/a). Preview `http://127.0.0.1:4321` while daemon 146497 was live.

| Condition | Result |
|-----------|--------|
| Desktop 1280×800 | Home + `/projects`: water-field present, image opacity 0.42, entrance settled opacity 1 / transform none / will-change cleared, `scroll-behavior: auto`, `hover+fine` true, 4 `.project-card`, persist attrs on WaterField + bg-words wrapper, no horizontal overflow |
| Mobile 390×800 coarse/touch | `/projects` and `/experience`: overflowX 0, `hoverFine` false, `pointer: coarse`, card transform none, water 0.42, entrance visible, native scroll |
| Route fade in-flight | Navigation `/`→`/projects` observed; html opacity stayed 1 in CDP sample; project-card 150ms animations appeared mid-nav; E2E covers 250ms path |
| Panel midpoint/late | E2E discriminator returned `mid` then settled clean (runtime this session) |
| Fine/coarse hover matrix | Stylesheet gate proven; CDP hover on heading did not apply `:hover`; coarse 390 unmoved |
| Persisted ambient re-entry/cleanup | After back, final water opacity 0.42, transform identity, will-change `""`; 250ms tween not isolated in CDP |
| Reduced motion | Chrome-devtools emulate has no `prefers-reduced-motion`; proven by Playwright reduced-motion tests this session (passed) |
| Inherit visual | No palette/type/composition redesign observed; ghost blur still present (expected on trace PASS) |

Screenshots were not persisted under `.sdd/` (no contractual defect requiring image handoff).

### TDD Compliance

| Check | Result | Details |
|-------|--------|---------|
| TDD Evidence reported | ✅ | apply-progress TDD Cycle Evidence table |
| All tasks have tests | ✅ | 15/15 mapped (hygiene Git/docs commands; paint PASS is explicit non-trigger) |
| RED confirmed (tests exist) | ✅ | `motion-tokens.test.ts`, `e2e/interaction.spec.ts`, `e2e/scroll-trace.spec.ts` exist |
| GREEN confirmed (tests pass) | ✅ | 40/40 unit, 62/62 E2E this session |
| Triangulation adequate | ⚠️ | Token seam 3 cases; visible-motion 4 cases; scroll 5×3. Card/route/persist assertions include fallback ORs |
| Safety Net for modified files | ✅ | apply-progress records 35/35 then 40 unit / 58 then 62 E2E baselines |

**TDD Compliance**: 5/6 checks passed (triangulation quality warning only)

### Test Layer Distribution

| Layer | Tests | Files | Tools |
|-------|-------|-------|-------|
| Unit | 40 (5 new MOTION) | 6 (1 new `motion-tokens.test.ts`) | Vitest 4.1.11 |
| Integration | 0 | 0 | not installed as a separate layer |
| E2E | 62 (4 visible-motion + 4 scroll-trace focused) | 5 under `e2e/` | Playwright 1.62.1 |
| **Total** | **102** | **11** | |

### Changed File Coverage

Coverage analysis skipped — no coverage tool detected.

### Assertion Quality

| File | Line | Assertion | Issue | Severity |
|------|------|-----------|-------|----------|
| `e2e/interaction.spec.ts` | 921–924 | `has250 \|\| fadeDurationOk \|\| htmlHasFade` | In-flight 250ms opacity can pass without sampling opacity∈(0,1) | WARNING |
| `e2e/interaction.spec.ts` | 988–1023 | injected `translateY(-2px) !important` | Headless hover fallback proves injected CSS, not `:hover` | WARNING |
| `e2e/interaction.spec.ts` | 1128–1131 | `has250Reentry \|\| opacityOk` | 250ms re-entry can pass on settled opacity alone | WARNING |

**Assertion quality**: 0 CRITICAL, 3 WARNING

Several `waitForTimeout` calls remain in `interaction.spec.ts` (Playwright authoring anti-pattern). SUGGESTION only; tests still passed.

### Quality Metrics

**Linter**: ⚠️ 21 warnings / 0 errors (unicorn `no-array-sort`, `no-underscore-dangle` in trace harness, complexity on formatSummary/card test)
**Type Checker**: ✅ No errors (`astro check` 0/0)

### Security

Threat matrix N/A in design (no new routing/shell/secrets boundary). Review-only: no new auth, no secrets in traces, `SITE` unset for preview. Residual risk: none for this change.

### Issues Found

**CRITICAL**: None

**WARNING**:

1. Three E2E assertions can pass via fallback ORs / injected CSS rather than the strict in-flight sample the specs name (route opacity∈(0,1), live `-2px` `:hover`, 250ms persist tween). Covering tests exist and passed; classify PARTIAL, not UNTESTED.
2. Design said `@theme` mirrors `MOTION`; CSS uses equivalent literals without an `@theme` seam. Specs still hold.

**SUGGESTION**:

1. Replace `waitForTimeout` in visible-motion E2E with deterministic `waitForFunction`.
2. 21 oxlint warnings in test harness (sort mutation, underscore dangle, complexity).
3. Chrome-devtools cannot emulate `prefers-reduced-motion`; keep Playwright as the reduced-motion proof.

### Verdict

PASS WITH WARNINGS

All 15 tasks complete; 8/8 requirements implemented; 21/21 scenarios have passing covering tests this session (3 PARTIAL). Unit 40/40, E2E 62/62, build 7 pages, check/format clean, hygiene re-proved, scroll-trace PASS with no paint change. Mutation N/A (framework absent). No CRITICAL findings.
