# Tasks: Persona Game-Menu Navigation

## Review Workload Forecast

Six slices, each <400 lines.

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Work Units

S1 docs: `pnpm check`, diff, revert docs
S2 shell/stubs: `pnpm test:unit`, `test:e2e`+`build`, revert #2
S3 views+SEO: `pnpm test:unit`, `test:e2e`, revert #3
S4 projects: `pnpm test:unit`, `test:e2e`, revert #4
S5 resume+gate: `pnpm test:unit`, `test:e2e`+`gate:privacy`, revert #5
S6 migration: `pnpm test:unit`, `test:e2e`+`build`+coverage, revert #6

## Slice 1: Docs Sync

- [x] S1.1 ARCHITECTURE.md: Escape direct `/`; Back native history (fix `history.back()`, D7)
- [x] S1.2 PRD/DESIGN/ADR-0003: no ProjectCard/Featured pattern; fix if stale
- [x] S1.3 mental-model.md + CODEBASE-GUIDE.md: landing → shell+views
- [x] S1.4 OpenSpec: align six delta specs

## Slice 2: Shell+Stubs

- [x] S2.1 RED menu-keys.test.ts: shell ↑↓ wrap/Enter, no-op on views, overlay 300+4×25=400, reduced 200
- [x] S2.2 GREEN keys.ts: shell `reduceMenuKey`, overlay (D3)
- [x] S2.3 RED layout.test.ts: `data-route`; no-scroll gated on `data-game-ready`
- [x] S2.4 GREEN BaseLayout.astro: `data-route`, gate, `<ClientRouter/>`, canvas persist
- [x] S2.5 Create game/{GameMenu,GameViewShell,ViewHeader,KeyHints}.astro + shell.ts: five links, 44px, focus-visible, hints only, no Gamepad API
- [x] S2.6 index.astro → GameMenu; stubs about/resume/projects/skills/contact
- [x] S2.7 views.spec.ts: routes, zero-JS, Tab trap, no-hijack, native Back, 404; delete menu/portfolio

## Slice 3: Views+SEO

- [x] S3.1 RED menu-keys.test.ts: `reduceListKey` (move/open/none), `escapeHierarchy` (close-panel/`/`)
- [x] S3.2 GREEN keys.ts: `reduceListKey`, `escapeHierarchy` interface
- [x] S3.3 RED seo.test.ts: six exact titles, per-route canonical + JSON-LD Person
- [x] S3.4 GREEN person.ts + BaseLayout titles/canonical/JsonLd; sitemap six, no 404
- [x] S3.5 about.astro/skills.astro/contact.astro (role+focus, LIST+detail no metrics, email/GitHub/WealthQuest) + view.ts
- [x] S3.6 content.test.ts + E2E: skills plain names, config, ABOUT role, CONTACT links

## Slice 4: PROJECTS

- [x] S4.1 RED content.test.ts: no `featured`, missing `link` fails, four-boundary
- [x] S4.2 GREEN schemas.ts: drop `featured`
- [x] S4.3 RED E2E: `/projects#serviceflow` preselects; four once, declared order
- [x] S4.4 GREEN projects.astro + GameList/GameListItem/DetailPanel: LIST, `#slug` preselect, focus into panel, Esc close→`/`

## Slice 5: RESUME+Gate

- [x] S5.1 RED resume.test.ts: required fields, `level`/`rank`/metrics rejected, `proficiency`, plain skills
- [x] S5.2 GREEN resumeSchema + file() + resume.yaml from Aug 2026 CV: exact facts, no phone
- [x] S5.3 RED privacy-gate.test.ts: match exit≠0; env missing typed `unavailable` exit≠0; never stdout/stderr/argv
- [x] S5.4 GREEN verify-no-phone.mjs: fixed path, fs-only, env-only; `gate:privacy` script
- [x] S5.5 CI L1 heuristic: pattern-only (phone|telephone|mobile|cell, `tel:`, 9+ digits), no exact value
- [x] S5.6 resume.astro: LIST (education/experience/projects/skills/languages) + detail; <768px stack, internal scroll
- [x] S5.7 E2E: CV facts render, no phone in HTML, mobile stack

## Slice 6: Migration+Verify

- [x] S6.1 Delete CompactNav/MenuOverlay/Section/ProjectCard.astro, sections/*, scripts/menu.ts, tests/unit/{nav,pages,sections}.test.ts
- [x] S6.2 Re-scope links/budget/reduced-motion specs (six routes+CONTACT, <100KB gz, ≤200ms)
- [x] S6.3 global.css: `html[data-route]` VT overlays ≤400ms (300+4×25), reduced ≤200ms opacity, incl. 404
- [x] S6.4 E2E: overlays ≤400/≤200ms incl. 404, fallback, sitemap six URLs, no 404
- [x] S6.5 Verify: unit+e2e, `gate:privacy`, coverage ≥80, check, build, biome, stryker `src/**/*.ts`
