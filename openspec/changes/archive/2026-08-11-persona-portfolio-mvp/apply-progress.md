# Apply Progress: Persona Portfolio MVP — PR 1 (Foundations & Content)

- **Work unit**: `pr1-foundations-content` (tasks 1.1–1.5 + partial 1.7)
- **Mode**: Strict TDD (`openspec/config.yaml` → `tdd: true`, runner `pnpm run test:unit`)
- **Branch**: `feat/persona-portfolio-mvp` (no commits made in this work unit)
- **Date**: 2026-08-10
- **Changed lines**: ~340 (new files: 337; supporting config: +3 in `biome.json`) — under the 400 review budget

## Status

| Task | State |
|------|-------|
| 1.1 RED test | ✅ complete |
| 1.2 GREEN lib modules | ✅ complete |
| 1.3 content.config.ts | ✅ complete |
| 1.4 global.css | ✅ complete |
| 1.5 BaseLayout.astro | ✅ complete |
| 1.6 user content (5 md + 2 yaml) | 🔒 BLOCKED — Jona's verified content; NOT fabricated |
| 1.7 verify | 🟡 partial — unit + `astro check` green; `pnpm build` PENDING on 1.6 |

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.1 | `tests/unit/content.test.ts` | Unit | ✅ 0/0 baseline (no pre-existing tests) | ✅ Written, executed FAIL | ✅ 14/14 pass | ✅ 14 cases across schema/count/order/config | ✅ zod v4 validators (`z.url()`, `z.email()`) remove 4 deprecation hints |
| 1.2 | `tests/unit/content.test.ts` | Unit | N/A (new) | ✅ RED proven by 1.1 | ✅ 14/14 pass | ✅ (same suite) | ➖ None needed (minimal) |
| 1.3 | n/a — structural config | — | N/A (new) | ➖ No new behavior (config wiring; behavior tested in 1.1) | ✅ `astro check` 0 errors | ➖ Triangulation skipped: purely structural config | ✅ import ordering fixed by Biome |
| 1.4 | n/a — CSS tokens/layers | — | N/A (new) | ➖ No logic; verified via `astro check` parse + Biome | ✅ `astro check` 0 errors | ➖ Triangulation skipped: static declarations | ✅ Biome format applied |
| 1.5 | n/a — layout shell | — | N/A (new) | ➖ No logic | ✅ `astro check` 0 errors | ➖ Triangulation skipped: single shell | ✅ removed unused frontmatter var (Biome) |

### Test Summary
- **Total tests written**: 14 — **passing**: 14 — **layers**: Unit (14)
- **Approval tests**: None — no refactoring of existing behavior (index.astro untouched)
- **Pure functions created**: `assertExactlyFive`, `sortByOrder` (both deterministic, side-effect-free)

## Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused test command and exact result | `pnpm run test:unit` → `Test Files 1 passed (1)`, `Tests 14 passed (14)`, exit 0 (also `pnpm exec vitest run tests/unit/content.test.ts` 14/14, exit 0) |
| Runtime harness command and exact result | `pnpm exec astro check` → `Result (10 files): 0 errors, 0 warnings, 0 hints`, exit 0. Loader diagnostics logged for blocked content only: `[ERROR] [file-loader] File not found: src/content/skills.yaml`, `[ERROR] [file-loader] File not found: src/content/site.config.yaml`, `[WARN] [glob-loader] The base directory ".../src/content/projects/" does not exist.` — check still passes; these are the 1.6 artifacts |
| Rollback boundary | Revert PR 1 alone: delete the 6 new source/test files + `biome.json` css-parser option; no other files touched (index.astro, astro.config.mjs untouched) |

## RED → GREEN Evidence
**RED (1.1)** — `pnpm exec vitest run tests/unit/content.test.ts` after writing only the test:
```
FAIL  tests/unit/content.test.ts [ tests/unit/content.test.ts ]
Error: Cannot find module '../../src/lib/content/schemas' imported from .../tests/unit/content.test.ts
Test Files  1 failed (1)   Tests  no tests
```

**GREEN (1.2)** — after `src/lib/content/{schemas,projects}.ts`:
```
Test Files  1 passed (1)   Tests  14 passed (14)
```

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `tests/unit/content.test.ts` | Created | 14 behavior tests: project schema fields + defaults (external false, featured default true), featured:false preserved, empty stack rejected, missing link rejected; `assertExactlyFive` throws on 4 and 6, returns 5; `sortByOrder` order sort + non-mutation; skills groups (plain names only — numbers rejected, empty rejected); site config email surface + missing-email rejection |
| `src/lib/content/schemas.ts` | Created | `projectSchema` (title, description, stack min 1, link `z.url()`, external default false, order int, featured default true), `skillsSchema` (record group → string[] min 1), `siteConfigSchema` (name, role, tagline, focusAreas min 1, email, socials github+wealthquest URLs, pageTitle); exports `Project`/`SiteConfig`/`Skills` types |
| `src/lib/content/projects.ts` | Created | `assertExactlyFive` (throws unless length === 5), `sortByOrder` (non-mutating, by `order`) |
| `src/content.config.ts` | Created | `projects` glob loader (`./src/content/projects`, `**/*.md`), `skills` + `siteConfig` file loaders; re-exports lib schemas (design D7) |
| `src/styles/global.css` | Modified | Fontsource Anton + Bebas Neue imports; `@theme` tokens (11 colors, 2 font families) mapping DESIGN.md; `@layer base` (dark color-scheme, bg-base on html, transparent body); `.glow-layer` fixed radial glow with 8s `glow-breathe` alternate keyframes (opacity 0.75→1, scale 1→1.02, strong ease-in-out), z-index -3; `.scanlines-layer` fixed repeating-linear-gradient ~15% black, z-index -2; both `pointer-events-none`; reduced-motion holds glow (animation: none, opacity 1) |
| `src/layouts/BaseLayout.astro` | Created | Head shell (charset, viewport, favicon svg+ico, generator, title prop defaulting to the exact SEO title "Jonathan Soto · Backend & Full-Stack Engineer"), glow + scanlines background layers (`aria-hidden`), `<slot />` |
| `biome.json` | Modified | Added `css.parser.tailwindDirectives: true` (Biome otherwise rejects Tailwind 4 `@theme` — required to keep the mandated token design lintable) |
## Deviations from Design

None in behavior. Supporting decisions (design leaves shapes open):
- `skills.yaml` shape = top-level record `group: [skills]` (one loader entry per group — natural file-loader fit); `site.config.yaml` = single `site:` root key (loader entry id `site`). Schemas in `src/lib/content/schemas.ts` document both.
- zod v4 native validators (`z.url()`, `z.email()`) instead of deprecated `z.string().url()/email()` — same behavior, zero deprecation hints.
- `biome.json` css-parser option added (tooling gap; not a design change).

## Issues Found

- Astro `file()` loader logs `File not found` (no throw) and `glob()` warns on missing base dir; `astro check` still exits 0. Build (`pnpm build`) remains PENDING: real content (1.6) is required for a meaningful build and the `assertExactlyFive` boundary, and missing-file diagnostics would surface there. Not claimed as green.
- `@astrojs/sitemap` integration is active; build-time sitemap work belongs to PR 3 (task 3.6) — untouched here.
## Remaining Tasks

- [ ] 1.6 BLOCKED (user content): 5 `src/content/projects/*.md` + `{skills,site.config}.yaml` — requires Jona's verified descriptions/stacks/links/GitHub URL; MUST NOT be fabricated
- [ ] 1.7 Verify: `pnpm build` after 1.6 (unit + `astro check` halves already evidenced)
- [ ] Phase 2 (PR 2): 2.1–2.8
- [ ] Phase 3 (PR 3): 3.1–3.8

## Workload / PR Boundary

- **Mode**: auto-chain (stacked-to-main), PR 1 slice only — NOT started (orchestrator gates commit/PR)
- **Current work unit**: `pr1-foundations-content` (tasks 1.1–1.5)
- **Boundary**: foundations + content pipeline (schemas, helpers, collections config, tokens/fonts/glow/scanlines, layout shell) + unit/type verification; ends before content files, sections, pages
- **Review budget impact**: ~340 changed lines of ~400 budget; no split needed

---

## Superseding Decision (2026-08-10): Four-Project Content — PR 1 Completed

- **Supersedes**: the five-project content set above (OpenCode Workflows removed). Engram #5891 (decision), #5890 (research), #5888 (prior apply progress — MERGED, not overwritten).
- **Work unit**: `pr1-foundations-content` completed (tasks 1.1–1.7), Strict TDD, branch `feat/persona-portfolio-mvp`, no commits
- **Changed lines (this unit)**: ~341 (new: 99 content lines; modified gross: 197; apply-progress append: ~45) — under the 400 review budget
- **Sources**: Engram #5890 (GitHub API verification), #5891 (Jona's four-project decision), PRD/README facts for WealthQuest; no invented facts

## Status

| Task | State |
|------|-------|
| 1.1 RED test (four-project) | ✅ complete |
| 1.2 GREEN `assertExactlyFour` | ✅ complete |
| 1.3 content.config.ts | ✅ complete (prior unit) |
| 1.4 global.css | ✅ complete (prior unit) |
| 1.5 BaseLayout.astro | ✅ complete (prior unit) |
| 1.6 user content (4 md + 2 yaml) | ✅ complete — verified facts only |
| 1.7 verify | ✅ complete — all gates green |

## RED → GREEN Evidence (this unit)

**RED** — tests revised to `assertExactlyFour` before the lib rename:
```
FAIL  tests/unit/content.test.ts > assertExactlyFour > returns the four entries unchanged
TypeError: assertExactlyFour is not a function
Test Files  1 failed (1)   Tests  3 failed | 11 passed (14)
```

**GREEN** — `src/lib/content/projects.ts` renamed to `assertExactlyFour` (throws unless length === 4):
```
Test Files  1 passed (1)   Tests  14 passed (14)
```

## Content (1.6) — verified facts only

- `src/content/projects/{serviceflow,wealthquest,eventcommerce,fintual-sensor}.md` — titles/descriptions/stacks/links per Engram #5890/#5891: ServiceFlow → https://github.com/jonasotoaguilar/ServiceFlow (Next.js 16/TypeScript/React 19/Tailwind v4/Appwrite/Docker, service-order & ticket management); EventCommerce → https://github.com/jonasotoaguilar/eventcommerce (Python/FastAPI/SQLAlchemy 2 async/Alembic/AMQP outbox/Docker, modular event-driven commerce backend); Fintual Sensor → https://github.com/BlendedGames-bGames/bGames-FintualSensor (JavaScript/Docker Compose, org-owned contribution — external: true, no sole-ownership implication); WealthQuest → https://jonasotoaguilar.itch.io/wealthquest (Unity/C#, thesis game, external: true). Order: ServiceFlow 1, WealthQuest 2, EventCommerce 3, Fintual Sensor 4 (PRD/README order minus OpenCode). All featured: true.
- `src/content/skills.yaml` — `skills:` root key; groups backend/frontend/tooling with plain skill names only (no levels/metrics), drawn from verified stacks and the repo toolchain.
- `src/content/site.config.yaml` — `site:` root key; name/role/tagline/focusAreas (Go, TypeScript, Python, clean architecture, API design), email jonathansoto.dev@gmail.com, socials github https://github.com/jonasotoaguilar + wealthquest https://jonasotoaguilar.itch.io/wealthquest, exact pageTitle.

## Content Decision / Deviation (this unit, with evidence)

- **YAML shape correction**: the earlier note here ("skills.yaml top-level record group→[skills]") was never exercised against a real file. Astro's `file()` loader maps each top-level YAML key to an ENTRY and validates the VALUE (source: `node_modules/astro/dist/content/loaders/file.js` — `Object.entries(data)` → `parseData({ id, data: rawItem })`). A top-level `backend: [...]` would feed an ARRAY to the record schema and fail. Both files therefore use a single root key (`skills:`, `site:`) so the schema receives the record/object — consistent with the established `site:` root-key decision. `skillsSchema`/`siteConfigSchema` in `src/lib/content/schemas.ts` unchanged; unit tests still green.
- **YAML frontmatter gotcha**: unquoted descriptions containing `: ` (e.g. "platform: a full-stack…") are invalid YAML (js-yaml "bad indentation of a mapping entry"); both affected descriptions are quoted.
- **`external` flag semantics**: `external: true` on WealthQuest (third-party platform page) and Fintual Sensor (org-owned contribution, not Jona's own repo); false on Jona's own repos (ServiceFlow, EventCommerce).

## Work Unit Evidence (gates)

| Gate | Command | Result |
|------|---------|--------|
| Unit | `pnpm run test:unit` | Test Files 1 passed (1), Tests 14 passed (14), exit 0 |
| Types | `pnpm exec astro check` | Result (10 files): 0 errors, 0 warnings, 0 hints, exit 0 — content synced cleanly (no more missing-file diagnostics) |
| Build | `pnpm build` | 1 page built in 585ms, sitemap-index.xml created, exit 0 |
| Lint | `pnpm lint` (Biome) | Checked 16 files in 11ms, no fixes applied, exit 0 |

## Files Changed (this unit)

**Created**: `src/content/projects/{serviceflow,wealthquest,eventcommerce,fintual-sensor}.md`, `src/content/skills.yaml`, `src/content/site.config.yaml`
**Modified**: `tests/unit/content.test.ts` (assertExactlyFive → assertExactlyFour: throws on 3 and 5, returns 4; fixture titles now four-project set), `src/lib/content/projects.ts` (rename + error message), `src/lib/content/schemas.ts` (comment), `PRD.md` (6 edits: four projects, external-link list incl. GitHub), `README.md` (four-project list), `ARCHITECTURE.md` (pattern + E2E scope all 4), `docs/adr/0001-astro-static-over-react-spa.md` (four projects), `openspec/changes/persona-portfolio-mvp/{exploration,proposal,design,tasks}.md` + `specs/portfolio-content/spec.md` (five→four; OpenCode Workflows removed; odd-5 grid → even 2x2 `grid-cols-1 md:grid-cols-2`)
**Appended**: this superseding-decision section (history preserved, prior content untouched)
## Rollback Boundary

This unit alone: delete the 6 content files, revert the `assertExactlyFour` rename (tests + projects.ts + schemas comment), revert the five→four doc alignment, drop this append section. Prior PR 1 files are a separate rollback boundary.

## Remaining Tasks

- [ ] Phase 2 (PR 2): 2.1–2.8 — canvas lib/script, sections/cards (2x2 grid per D2), index composition with `assertExactlyFour`, 404, entrances
- [ ] Phase 3 (PR 3): 3.1–3.8 — menu, ClientRouter/persist, JSON-LD/sitemap, E2E (4 cards), coverage ≥ 80, CI gate

---

## Work Unit 2A: Living Background (2026-08-10)

- **Work unit**: `pr2a-living-background` (tasks 2.1–2.4), Strict TDD, branch `feat/persona-portfolio-mvp`, no commits, no new dependencies
- **Changed lines (this unit)**: ~398 (new: 341 code+tests incl. +3 BaseLayout; doc/progress 57) — under the 400 review budget

## Status

| Task | State |
|------|-------|
| 2.1 RED `tests/unit/canvas.test.ts` | ✅ complete |
| 2.2 GREEN `src/lib/canvas/particles.ts` | ✅ complete |
| 2.3 `src/scripts/living-background.ts` | ✅ complete |
| 2.4 `src/components/Background.astro` + BaseLayout | ✅ complete |

## RED → GREEN Evidence

**RED (2.1)** — before the lib existed:
```
FAIL  tests/unit/canvas.test.ts
Error: Cannot find module '../../src/lib/canvas/particles' imported from .../tests/unit/canvas.test.ts
Test Files  1 failed (1)   Tests  no tests
```

**GREEN (2.2)** — after `src/lib/canvas/particles.ts`:
```
Test Files  1 passed (1)   Tests  9 passed (9)
```

## Work Unit Evidence (gates)

| Gate | Command | Result |
|------|---------|--------|
| Unit | `pnpm run test:unit` | Test Files 2 passed (2), Tests 23 passed (23) — 14 content + 9 canvas, exit 0 |
| Types | `pnpm exec astro check` | Result (14 files): 0 errors, 0 warnings, 0 hints, exit 0 |
| Build | `pnpm build` | 1 page built, exit 0 |
| Lint | `pnpm lint` (Biome) | exit 0, 1 warning: `noUnusedImports` on `Background` import in BaseLayout.astro — KNOWN Biome 2.5.7 false positive (cannot resolve Astro component imports used in templates; `astro check` 0 errors + build prove usage). Warnings do not fail CI |
| Runtime smoke | temp `src/pages/bg-preview.astro` (deleted after; Astro ignores `_`-prefixed pages) | Built HTML: `<canvas id="living-background" class="living-background" aria-hidden="true" hidden>` + inlined module script (init → unhide → rAF clear/step/draw; `astro:before-swap` cleanup). Final build back to 1 page |

## Files Changed (this unit)

**Created**: `tests/unit/canvas.test.ts` (9 tests: PARTICLE_CAP=120; cappedDpr ≤2 keeps lower; seededRng determinism; bounds + drift 0.2–0.5 px/frame; clamp + zero; seeded determinism; step purity + move-by-velocity; edge wrap; render purity + one arc per particle), `src/lib/canvas/particles.ts` (`PARTICLE_CAP=120`, `MAX_DPR=2`, `seededRng` mulberry32, `cappedDpr`, `createParticleField(count,w,h,rng?)` clamped, `stepParticles` pure non-mutating wrap, `renderParticles` one dot per particle, accent-300 tint), `src/scripts/living-background.ts` (rAF clear→step→draw; DPR-capped backing store; resize rebuilds field; visibilitychange pause/resume; reduced-motion → one static frame, never rAF, runtime `change` toggles; unhide only after successful init — D4; `astro:before-swap` destroy), `src/components/Background.astro` (`<canvas hidden aria-hidden="true">`, fixed z-index -1 `pointer-events-none`, `[hidden]{display:none}` guard)
**Modified**: `src/layouts/BaseLayout.astro` (+3: import + `<Background />` after scanlines), `tasks.md` (checkboxes 2.1–2.4)
## Deviations from Design

None in behavior. Supporting decisions: optional 4th `rng` param + `seededRng` export make deterministic particle tests possible while keeping the design signature; canvas tint hard-coded `rgb(124, 146, 255)` (accent-300) — Canvas cannot read CSS custom properties without `getComputedStyle`; `astro:before-swap` destroy hook added now (inert until `<ClientRouter/>` in 3.4).

## Rollback Boundary

This unit alone: delete the 4 new files; revert the +3 BaseLayout lines; revert tasks.md checkboxes 2.1–2.4; drop this append section. Prior PR 1 files are a separate rollback boundary.

## Remaining Tasks

- [ ] Phase 2 (PR 2): 2.5–2.8 — sections/cards (2x2 grid per D2), index composition with `assertExactlyFour`, 404, entrances
- [ ] Phase 3 (PR 3): 3.1–3.8 — menu, ClientRouter/persist, JSON-LD/sitemap, E2E (4 cards), coverage ≥ 80, CI gate---

---

---

## Work Unit 2B1: Portfolio Sections (2026-08-10)
- **Work unit**: `pr2b1-sections` (task 2.5), Strict TDD, branch `feat/persona-portfolio-mvp`, no commits, no new deps
- **Seam**: `experimental_AstroContainer` (`astro/container`, built-in Astro 7.2.0), probed with existing `Background.astro` first (probe deleted after); no new deps
- **Changed lines**: ~400 (new 364 code+tests, tasks.md +1, append ~35) — at the 400 review budget
## Status: 2.5 RED ✅ (test first) → GREEN ✅ (7 components)
**RED**: `Cannot find module '../../src/components/sections/Contact.astro'` — Test Files 1 failed, Tests no tests
**GREEN**: Test Files 1 passed (1), Tests 6 passed (6)
## Work Unit Evidence (gates)
| Gate | Command | Result |
|------|---------|--------|
| Unit | `pnpm run test:unit` | 3 files / 29 tests passed, exit 0 |
| Types | `pnpm exec astro check` | 0 errors, 0 warnings, 0 hints (22 files) |
| Build | `pnpm build` | 1 page built, exit 0 |
| Lint | `pnpm lint` (Biome) | exit 0; 17 warnings = KNOWN Biome 2.5.7 Astro-template false positives (same class as the documented `Background` warning in 2A) — warnings do not fail CI |
## Files Changed
**Created**: `tests/unit/sections.test.ts` (6 container behavior tests: Hero single h1 + role + 5 focus areas; FeaturedWork/Projects four verified titles in order + anchors + 2x2 grid; Skills grouped names, no `%`/`x/y` levels; Contact mailto CTA with configured email; ProjectCard external → `target="_blank"` + `rel="noopener noreferrer"`, non-external → no target; Watermark `aria-hidden`), `src/components/{Section,Watermark,ProjectCard}.astro`, `src/components/sections/{Hero,FeaturedWork,Projects,Skills,Contact}.astro` — props-driven, no content hardcoding; Section = watermark + h2 + slot shell
**Modified**: `tasks.md` (checkbox 2.5)

## Deviations from Design

None in behavior. Supporting: `Section.astro` shell (composition over config); Hero omits tagline (not in PRD hero scope); Projects = title rows (no duplication with FeaturedWork cards); watermarks on the four content sections only.
## Rollback Boundary

Delete the 8 component + test files; revert tasks.md checkbox; drop this append. Prior PR 1 / 2A boundaries separate.

## Remaining Tasks

- [ ] Phase 2 (PR 2): 2.6–2.8 — index composition with `assertExactlyFour`, 404, entrances
- [ ] Phase 3 (PR 3): 3.1–3.8 — menu, ClientRouter/persist, JSON-LD/sitemap, E2E, coverage ≥ 80, CI gate

---

## Work Unit 2B2: Index, 404, Entrances (2026-08-10)

- **Work unit**: `pr2b2-pages-entrances` (tasks 2.6–2.8), Strict TDD, branch `feat/persona-portfolio-mvp`, no commits, no new deps
- **Seam**: `experimental_AstroContainer` + `vi.mock("astro:content")` (probed first: `getCollection` returns EMPTY in the container environment — probe deleted after). BaseLayout-with-CSS-import also probed green before use
- **Changed lines**: ~392 (new code+tests 327; index.astro rewrite +17; Hero/Section `data-entrance` +2; tasks.md +1; append ~45) — under the 400 review budget

## Status

| Task | State |
|------|-------|
| 2.6 RED `tests/unit/pages.test.ts` | ✅ complete |
| 2.7 RED `tests/unit/entrances.test.ts` | ✅ complete |
| 2.6 GREEN `src/pages/index.astro` composition | ✅ complete |
| 2.7 GREEN `src/pages/404.astro` + `src/scripts/entrances.ts` + pure helper | ✅ complete |
| 2.8 Verify: unit / check / build / lint / static readback | ✅ complete |

## RED → GREEN Evidence

**RED (2.6/2.7)** — tests written first, run against stub/missing modules:
```
FAIL  tests/unit/pages.test.ts
Error: Cannot find module '/src/pages/404.astro' imported from .../tests/unit/pages.test.ts
FAIL  tests/unit/entrances.test.ts
Error: Cannot find module '../../src/lib/motion/entrances' imported from .../tests/unit/entrances.test.ts
```
Stub-verified index RED (404 import temporarily pointed at a stub): all 5 index/404 assertions fail against the old stub `index.astro` (no sections, no anchors, wrong count passes through).

**GREEN (2.6/2.7)**:
```
Test Files  2 passed (2)   Tests  7 passed (7)   — pages 5/5, entrances 2/2
```

## Work Unit Evidence (gates)

| Gate | Command | Result |
|------|---------|--------|
| Focused | `pnpm exec vitest run tests/unit/pages.test.ts tests/unit/entrances.test.ts` | 2 files / 7 tests passed, exit 0 |
| Unit | `pnpm run test:unit` | 5 files / 36 tests passed, exit 0 (14 content + 9 canvas + 6 sections + 5 pages + 2 entrances) |
| Types | `pnpm exec astro check` | Result (28 files): 0 errors, 0 warnings, 0 hints, exit 0 |
| Build | `pnpm build` | 2 page(s) built (index.html + 404.html) in 853ms, sitemap created, exit 0 |
| Lint | `pnpm lint` (Biome) | exit 0; 28 warnings, ALL the documented Biome 2.5.7 Astro-template false-positive class (`.astro` `noUnusedImports`/`noUnusedVariables`); zero errors; no new warning classes (5 format/organize errors auto-fixed; `noNonNullAssertion` avoided by narrowing guards) |
| Static readback | node script over `dist/` (bounded, output summarized) | index: section order monotonic (Hero→Featured Work→Projects→Skills→Contact), 1 h1, all 4 anchors, `grid-cols-1`+`md:grid-cols-2`, 4 `<article>` cards (2x2, no odd-card span), 4 titles, mailto CTA, NO inline `opacity:0` (zero-JS fully rendered), 5 `data-entrance` attrs; 404: identity name+role, exactly ONE anchor `href="/"`, 1 h1 |

## Files Changed

**Created**: `tests/unit/pages.test.ts` (5 container tests: section order via `assertOrdered`; exactly one h1 + 4 anchors + 2x2 grid; four titles + mailto; `assertExactlyFour` build boundary — 3 and 5 entries both reject with `/Expected exactly 4 projects/`; 404 identity + single `href="/"` anchor + one h1), `tests/unit/entrances.test.ts` (2 pure tests: default y=8 transform+opacity ≤300ms; reduced opacity-only y=0 ≤200ms), `src/lib/motion/entrances.ts` (`ENTRANCE_EASE` [0.23,1,0.32,1]; `entranceOptions(reduced)` pure config: {y:8, 300ms} vs {y:0, 200ms, opacity-only}), `src/scripts/entrances.ts` (`motion` vanilla `animate` + `inView`, stagger 40ms per element index, `amount: 0.2`, one-shot unobserve; `astro:page-load` teardown+setup, `astro:before-swap` teardown — navigation-safe; keyframes opacity [0,1] ± y [8,0], never pre-hides markup), `src/pages/404.astro` (BaseLayout + h1 404 + identity name/role + single "Back to home" `href="/"`; one-siteConfig completeness guard)
**Modified**: `src/pages/index.astro` (stub → composition: `assertExactlyFour` + `sortByOrder` over projects, exactly-one siteConfig/skills guard, Hero → FeaturedWork → Projects → Skills → Contact in `<main>` under BaseLayout), `src/components/sections/Hero.astro` (+`data-entrance`), `src/components/Section.astro` (+`data-entrance`), `tasks.md` (checkboxes 2.6–2.8)

## Deviations from Design

None in behavior. Supporting decisions:
- `getCollection` returns empty inside `AstroContainer` (probed) → page tests mock `astro:content` with `vi.mock` + fixtures, keeping the real page frontmatter (including the `assertExactlyFour` boundary) under test; the container seam still verifies the real composition, not a reimplementation.
- Entrances mount via `data-entrance` on the Hero + the 4 Section shells; 40ms stagger (within the design 30–50ms band) applied only when an element actually animates (inView-triggered, so below-fold sections animate on scroll-in — no wasted off-screen work).
- 2.8's `pnpm dev` anchors/404 runtime harness covered by the bounded static readback instead (section order + `dist/404.html` + single-anchor check); dev-server smoke deferred to Phase 3 E2E.

## Rollback Boundary

This unit alone: delete the 5 new files; revert index.astro to the stub, drop the 2 `data-entrance` lines; revert tasks.md checkboxes 2.6–2.8; drop this append. Prior PR 1 / 2A / 2B1 boundaries separate.

## Remaining Tasks

- [ ] Phase 3 (PR 3): 3.1–3.8 — menu keys/lib/overlay, ClientRouter + canvas `transition:persist`, JSON-LD, sitemap filter excluding /404, E2E suite (anchors/zero-JS, 4 cards, CTA, 404, keyboard, reduced-motion, budget, links), coverage ≥ 80, CI gate

---
## Work Unit 3A: Compact Nav + Persona Overlay (2026-08-11)
- **Work unit**: `pr3a-nav-overlay` (tasks 3.1–3.3), Strict TDD, branch `feat/persona-portfolio-mvp`, no commits, no new deps. **Changed lines**: 400 (383 new files; +4 index.astro, +1 pages.test.ts, +1 tasks.md; +11 this append) — at the review budget
- **Status**: 3.1 RED ✅ · 3.2 GREEN ✅ · 3.3 CompactNav + MenuOverlay + menu.ts ✅
- **RED**: `Cannot find module '../../src/lib/menu/keys'` and `'../../src/components/CompactNav.astro'` — Test Files 1 failed each, no tests
- **GREEN**: menu-keys 6/6, nav 4/4 → full unit 46/46 (7 files, exit 0); `astro check` 0/0/0; build 2 pages; lint 0 errors (32 warnings, all the documented Biome 2.5.7 Astro-template false-positive class)
- **Static readback (dist/)**: 4 nav anchors; dialog closed by default; labelled trigger/close; kbd footer; skew/italic Anton + `@supports` skew-only fallback; 44px + focus-visible compiled; 8 external links only in project sections (nav none); JS gz 22.4KB (< 100KB)
- **Files**: created `tests/unit/{menu-keys,nav}.test.ts`, `src/lib/menu/keys.ts`, `src/components/{CompactNav,MenuOverlay}.astro`, `src/scripts/menu.ts`; modified `src/pages/index.astro` (+4: nav+overlay), `tests/unit/pages.test.ts` (+1: order assertion scoped to `<main>`), `tasks.md` (3.1–3.3 ✅)
- **Deviations**: none in behavior. Supporting: 400ms overlay exception realized via item stagger math (300 + 3×30 = 390ms) with no separate panel fade (solid panel, per reference); Tab trap left to native `showModal()` per design D3; keys.ts `menuOverlayOptions` uses 30ms stagger (band 30–50) to stay within the exception
- **Rollback**: delete the 6 new files; revert index/pages-test/tasks edits; drop this append. Prior PR 1/2 boundaries separate
- **Remaining**: 3.4–3.8 — ClientRouter + canvas persist, JSON-LD, sitemap filter, E2E suite, coverage ≥ 80, CI gate

---
## Work Unit 3B: ClientRouter + Persist, JSON-LD, Sitemap (2026-08-11)
- **Work unit**: `pr3b-transitions-seo` (tasks 3.4–3.6), Strict TDD, branch `feat/persona-portfolio-mvp`, no commits, no new deps
- **Changed lines**: ~247 (new 195; modified deltas +52: BaseLayout +3, Background +1, index +2, config +6, living-background +16, pages.test +24; docs ~15) — under the 400 review budget
- **Status**: 3.4 RED ✅ → GREEN ✅ · 3.5 RED ✅ → GREEN ✅ · 3.6 RED ✅ → GREEN ✅
- **RED**: layout.test.ts (ClientRouter markers missing; canvas lacks `data-astro-transition-persist`), seo.test.ts (`Cannot find module` for JsonLd.astro/person/sitemap libs), pages.test.ts (no `application/ld+json` on index) — 3 failed | 7 passed (10), then module-load failure for seo
- **GREEN**: 58/58 (9 files, exit 0): layout 3/3, seo 7/7, pages +2; prior 46 preserved
- **Gates**: `astro check` 0/0/0 (39 files); `pnpm build` 2 pages, sitemap-index.xml; `pnpm lint` 0 errors / 36 warnings — ALL the documented Biome 2.5.7 Astro-template false-positive class (JsonLd/BaseLayout/index warnings are the same class; no new classes)
- **Static readback (dist/)**: JSON-LD `Person` on index only with exact name/jobTitle/email + sameAs [github, wealthquest], parsed via JSON.parse; 404 has no ld+json; canvas `data-astro-transition-persist="astro-essv6x2d-1"` on BOTH pages with IDENTICAL key (swap-match proof) while `hidden` until init; ClientRouter meta on index; sitemap-0.xml lists only `https://jonasotoaguilar.dev/`
- **Files**: created `tests/unit/{layout,seo}.test.ts`, `src/lib/seo/{person,sitemap}.ts`, `src/components/JsonLd.astro`; modified `src/layouts/BaseLayout.astro` (ClientRouter + `<slot name="head" />`), `src/components/Background.astro` (`transition:persist`), `src/pages/index.astro` (`<JsonLd slot="head">`), `astro.config.mjs` (`sitemap({ filter: isSitemapEligible })`), `src/scripts/living-background.ts` (field stash/adopt on the persisted element), `tests/unit/pages.test.ts` (+2), `tasks.md` (3.4–3.6 ✅)
- **Probes (deleted)**: ClientRouter container output (meta `astro-view-transitions-enabled`/`-fallback` + module script), persist-key determinism across renders (`astro-essv6x2d-1` stable)
- **Deviations**: none in behavior. Supporting: bare `transition:persist` renders `data-astro-transition-persist=<generated-key>` (swap matches by exact key; verified identical across both built pages); `@astrojs/sitemap` 3.7.3 excludes `/404` by default (STATUS_CODE_PAGES) — the explicit `filter` makes the exclusion durable per design D File-Changes and is unit-proven; `serializeJsonLd` escapes `<` for script safety; canvas field stashed on the persisted element in `astro:before-swap` destroy and re-adopted in init so the animation continues without restart
- **Risks**: field-adopt continuity is bundle-verified but not runtime-tested (needs a browser; the reduced-motion/static-frame E2E and navigation E2E belong to 3.7–3.8, intentionally not started); Biome false positives documented; 404 sitemap exclusion double-covered (integration default + explicit filter)
- **Rollback boundary**: this unit alone: delete the 5 new files; revert the 7 modified-file deltas; revert tasks.md checkboxes 3.4–3.6; drop this append. Prior PR 1/2/3A boundaries separate
- **Remaining**: 3.7–3.8 — E2E suite (anchors/zero-JS, 4 cards, CTA, 404, keyboard, reduced-motion, budget, links), coverage ≥ 80, CI gate

---
## Work Unit 3C: E2E Suite + Full Verification (2026-08-11)
- **Work unit**: `pr3c-e2e-verify` (tasks 3.7–3.8), Strict TDD (behavior-first), branch `feat/persona-portfolio-mvp`, no commits, no new deps
- **Changed lines**: ~536 (specs 461; menu.ts +24; index.astro +4; tasks.md 2; this append ~45) — OVER the 400 budget; see Budget Note below. No commits made.
- **Status**: 3.7 RED (10 failed) → fixes → GREEN ✅ · 3.8 all gates green ✅

## RED → GREEN Evidence
**RED (3.7, first run, 14 passed / 10 failed)** — five new specs against the existing implementation; failures captured:
1. Astro dev-toolbar injects its own `Menu` button (`data-app-id="astro:home"`) → `getByRole('button', {name:'Menu'})` strict-mode collision in dev (6 menu tests + 44px test). TEST-side: scope to `getByRole('banner')`.
2. `getByRole('listitem')` inside Featured Work counts nested stack `<li>`s (20 ≠ 4). TEST-side: count direct children `ul > li`.
3. Hero focus-area texts duplicate in Skills (`Go`, `TypeScript`, `Python`). TEST-side: scope to hero section.
4. Closed-menu ArrowDown scroll: Chromium applies arrow-key scroll on a later frame; immediate `scrollY` read = 0. TEST-side: `expect.poll`.
5. Entrances: `document.getAnimations()` is EMPTY under reduced motion — motion 13 runs a custom rAF driver (no WAAPI animations; `element.animate` monkeypatch probe also empty). TEST-side: rAF sampler via `addInitScript` with a 15s poll.
6. **PRODUCT DEFECT #1 (real)**: `src/scripts/entrances.ts` was NEVER imported by any page/component — dead code; entrances never ran. Sampler deterministically exposed it (0 transitions). FIX: `src/pages/index.astro` `<script> import "../scripts/entrances"; </script>` (+4).
7. **PRODUCT DEFECT #2 (real)**: Tab from the last menu item leaks focus to `<body>` (Chromium modal wrap quirk; native trap alone insufficient) — violates "Tab focus MUST be constrained within the menu". FIX: `wrapTabFocus` in `src/scripts/menu.ts` (+24): intercept Tab at the cycle boundary (`data-menu-close`/`data-menu-item` list), wrap first↔last.
**GREEN**: 24/24, then 23/23 (hidden-tab scenario dropped — not in task 3.7's list; lib layer unit-covered) stable across 4 consecutive full runs.

## Work Unit Evidence (gates, all green)
| Gate | Command | Result |
|------|---------|--------|
| E2E | `pnpm exec playwright test tests/e2e/` (managed `astro dev --background`, then `astro dev stop`) | 23/23, exit 0, 4 consecutive stable runs (4.0–4.2s) |
| Unit | `pnpm run test:unit` | 9 files / 58 tests passed, exit 0 |
| Coverage | `pnpm run coverage` | Stmts 95.86 / Branch 88.88 / Funcs 100 / Lines 98.14 — thresholds 80/70/80/80 exceeded |
| Types | `pnpm exec astro check` | 0 errors / 0 warnings / 0 hints (47 files) — after `rm -rf coverage/` (generated V8 report JS pollutes tsserver include `**/*`) |
| Build | `pnpm build` | 2 pages + sitemap-index.xml, exit 0 |
| Lint | `pnpm lint` | 0 errors / 36 warnings — ALL the documented Biome 2.5.7 `.astro` noUnusedVariables/Imports false-positive class; exit 0 |
| Static readback | node script over `dist/` (bounded) | section order monotonic, 1 h1, 4 anchors, 4 card titles, mailto, JSON-LD Person (name/jobTitle/email/sameAs exact, parses), 404 single `href="/"` action + h1, persist key identical on both pages, sitemap has index + no 404, JS gz 7,094 bytes (<100KB) |
| Link availability | curl HEAD probe (separate, NON-gating) | 200 ×5: ServiceFlow, EventCommerce, FintualSensor (GitHub), WealthQuest (itch.io), GitHub profile |

## Files Changed
**Created**: `tests/e2e/{portfolio,menu,reduced-motion,budget,links}.spec.ts` (23 tests, accessibility-first locators, one behavior per test; budget/sitemap specs read `dist/` deterministically; external links validated as href contracts only — no network in the suite)
**Modified**: `src/scripts/menu.ts` (+24: `wrapTabFocus` Tab boundary trap), `src/pages/index.astro` (+4: entrances script wiring), `tasks.md` (3.7–3.8 ✅)
**Appended**: this section
## Deviations from Design
None in behavior. Supporting: motion 13's vanilla `animate()` uses a custom rAF driver — `document.getAnimations()`/`element.animate` are blind; entrance timing measured with an rAF sampler (opacity-only, span ≤240ms incl. frame quantization, transform constant). Dev-toolbar interference scoped away with banner-role locators. `astro check` needs `coverage/` removed after the coverage gate (generated artifacts land in tsserver scope). Entrances defect (never wired) and Tab-trap leak (Chromium modal wrap) were the two real current-scope defects; both fixed minimally per spec.
## Budget Note
~536 changed lines vs the 400 ceiling. The suite covers every behavior task 3.7 lists (23 tests); per-test density is ~20 lines under Biome 80-col formatting. No scope added, no deps added. If the ceiling is strict, slice into chained PRs (e.g., menu+portfolio / reduced-motion+budget+links) via the chained-pr skill — no commit was made, so slicing is free.
## Rollback Boundary
This unit alone: delete the 5 spec files; revert menu.ts wrapTabFocus + Tab branch; drop index.astro script block; revert tasks.md checkboxes; drop this append. Prior PR 1/2/3A/3B boundaries separate.
## Remaining
None — tasks 1.1–3.8 complete. Mutation campaigns (Stryker) remain a later hardening step per ARCHITECTURE.md; commit/PR/CI merge is gated by the orchestrator.

---
## Remediation: ST-1 fallback + PN-3 safe links (2026-08-11)

- **Evidence revision remediated**: `sha256:5eb63ea114fea4358b1a8e34dab11d211256b2ae1e7c6341dd5752b28a732a10` (verify-report fail: ST-1, PN-3)
- **Mode**: Strict TDD, one writer, no delegation. **Status**: `remediation pending re-verification` — no PASS declared.
- **Changed lines (this unit)**: ~61 code/tests/docs — under the 80-line remediation budget
- **RED (tests first, all failing against current behavior)**:
  - `tests/unit/layout.test.ts` — asserts fallback meta `content="none"`; current rendered `content="animate"` → FAIL
  - `tests/unit/content.test.ts` — `isExternalLink` cases; `TypeError: isExternalLink is not a function` → 3 FAIL
  - `tests/unit/sections.test.ts` — ProjectCard: every off-site link must carry `target="_blank"` + `rel="noopener noreferrer"` → FAIL
  - `tests/e2e/links.spec.ts` — all four project links must carry safe attrs → FAIL
  - `tests/e2e/portfolio.spec.ts` — full-page fallback test (startViewTransition deleted, sentinel must not survive) → FAIL, sentinel `"alive"` preserved (client-side fallback proven)
  - RED evidence: unit `5 failed | 22 passed (27)`; E2E `2 failed, 10 passed`
- **GREEN (minimal fixes)**:
  - `src/layouts/BaseLayout.astro:20` → `<ClientRouter fallback="none" />` (Astro 7.2.0: only `none` yields full-page navigation when `document.startViewTransition` is absent; `animate`/`swap` simulate client-side fallback)
  - `src/lib/content/projects.ts` → `isExternalLink(href, siteOrigin?)` pure helper: absolute http(s) URL whose origin differs from the site origin is external; relative links are internal
  - `src/components/{ProjectCard,sections/Projects}.astro` → safe attrs derived from URL semantics via `Astro.site?.origin`, not the content flag
  - `src/lib/content/schemas.ts` + 4 content files → removed obsolete `external` flag (root-cause fix per verify-report causality; its ownership semantics contradicted the off-site-link contract)
  - GREEN evidence: unit `62 passed (62)`; E2E `25 passed`; `astro check` 0/0/0; build 2 pages; Biome 0 errors / 37 warnings (documented Biome 2.5.7 `.astro` false-positive class)
- **Static readback (dist/index.html)**: fallback meta `content="none"`; all 8 off-site anchors (4 links × 2 sections) carry `target="_blank" rel="noopener noreferrer"`; internal anchors keep no target
- **Rollback boundary**: revert BaseLayout fallback prop, drop `isExternalLink` + URL-derived gating (restore flag gating), restore `external` schema field + content keys, revert the 5 test files; drop this append
- **Remaining**: re-verification run (orchestrator-owned); mutation survivors/warnings explicitly out of scope for this transaction

---
## Remediation: CHECK-1 TS2790 + PC-1 external schema field (2026-08-11)

- **Evidence revision remediated**: `sha256:ef79231a92ea34912696c0ebc739f65412f6dc58ccbd39f11d55653e0df49b55` (verify-report fail: CHECK-1, PC-1)
- **NEW evidence revision**: `sha256:534a612e2727b55a9ef64330c795d48d7d346c694c351e820fdd3dfd0afbe559` — remediates the above; preimage retained at `openspec/changes/persona-portfolio-mvp/` context and session memory
- **Mode**: Strict TDD, one writer, no delegation. **Status**: `remediation pending final re-verification` — no PASS declared
- **Changed lines (code/tests/content)**: net +19 (portfolio.spec.ts −3, schemas.ts +2, 4 content files +4, content.test.ts +11, sections.test.ts +1, pages.test.ts +4); apply-progress/verify-report appends ~+20 docs — under the 50-line remediation budget
- **RED (focused, tests first)**:
  - `tests/unit/content.test.ts` — three new/updated assertions: `external` defaults false, explicit `external: true` preserved, non-boolean `external` rejected → `3 failed | 16 passed (19)` (schema field absent)
  - `pnpm exec astro check` — TS2790 at `tests/e2e/portfolio.spec.ts:110` (1 error, 0 warnings) — CHECK-1 red, reproduced fresh
- **GREEN (minimal fixes)**:
  - `src/lib/content/schemas.ts` → `external: z.boolean().default(false)` restored (spec PC-1; design default false). URL-derived `isExternalLink` remains the single source of safe-link output — unchanged
  - 4 project frontmatters → `external: true` (all links off-site: GitHub ×3, itch.io ×1)
  - `tests/e2e/portfolio.spec.ts:109-111` → sound optional cast `Document.prototype as { startViewTransition?: unknown }` (property optional in the cast type ⇒ `delete` legal); same runtime fallback assertion, no weakening
  - Typed fixtures updated for the required output field: `sections.test.ts` +1, `pages.test.ts` +4 (`external: true`)
  - GREEN evidence: focused unit `19 passed (19)`; full unit `64 passed (64)`; E2E `25 passed` (incl. full-page fallback); `astro check` 0/0/0; build 2 pages; Biome 0 errors / 37 warnings (documented false-positive class)
- **Spec untouched**: `specs/portfolio-content/spec.md` unchanged — the defect was implementation, not spec
- **Rollback boundary**: remove the 3 new `content.test.ts` cases, drop the schema field + 4 content keys + fixture lines, revert the cast to the intersection form (or the delete block); drop this append
- **Residual risks (out of scope)**: mutation `http:` survivors and 11 Necessist statements remain WARNING-level; no PASS claim; re-verification is orchestrator-owned
