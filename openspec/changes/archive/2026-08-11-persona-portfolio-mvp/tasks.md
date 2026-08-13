# Tasks: Persona Portfolio MVP

## Review Workload Forecast

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High
Estimated changed lines: ~1,100–1,300 (PR 1 ~350–420; PR 2 ~380–450; PR 3 ~330–400)
Delivery strategy: auto-chain

Chain strategy is a required human decision before apply: stacked-to-main or feature-branch-chain (PR 1 → tracker; PR 2 → PR 1 branch; PR 3 → PR 2 branch). Slice >400 → split further. Commit per work unit.

### User-Content Prerequisite (blocks PR 1)

Content verified 2026-08-10 (Engram #5890/#5891): four projects — ServiceFlow, EventCommerce, Fintual Sensor, WealthQuest — with GitHub links for the first three and itch.io for WealthQuest; GitHub profile https://github.com/jonasotoaguilar. Never fabricate. Blocks 1.6 + `assertExactlyFour` gate; PR 2 rendering, PR 3 link E2E.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Tokens, fonts, BaseLayout, glow/scanlines, content pipeline, unit tests | PR 1 | `pnpm run test:unit` | `astro check`; build post-content | Revert PR 1 alone |
| 2 | Sections, cards, watermarks, index+404, canvas, entrances | PR 2 | `pnpm run test:unit` | `pnpm build`; `pnpm dev` anchors/404 | Revert PR 2 alone |
| 3 | Nav+overlay, ClientRouter+persist, JSON-LD/sitemap, E2E suite | PR 3 | `pnpm run test:e2e` | `test:e2e`; build (budget) | Revert PR 3 alone |

## Phase 1: Foundations & Content (PR 1)

- [x] 1.1 RED `tests/unit/content.test.ts`: schema fields, featured-default, `assertExactlyFour` throws ≠4, order sort, invalid config (portfolio-content)
- [x] 1.2 GREEN `src/lib/content/schemas.ts` + `projects.ts` — assertExactlyFour, order sort
- [x] 1.3 `src/content.config.ts` — glob/file loaders re-exporting lib schemas
- [x] 1.4 `src/styles/global.css` — fontsource imports, `@theme` tokens, glow ~8s, reduced-motion hold, scanlines
- [x] 1.5 `src/layouts/BaseLayout.astro` — head shell, background layers, slots
- [x] 1.6 user content: 4 `src/content/projects/*.md` + `{skills,site.config}.yaml`
- [x] 1.7 Verify: test:unit + `astro check` green; build after 1.6

## Phase 2: Sections & Background (PR 2)

- [x] 2.1 RED `tests/unit/canvas.test.ts`: particle bounds, PARTICLE_CAP=120, cappedDpr≤2, step/render purity (living-background)
- [x] 2.2 GREEN `src/lib/canvas/particles.ts` — createParticleField/step/render
- [x] 2.3 `src/scripts/living-background.ts` — rAF, visibility pause/resume, reduced-motion single frame, unhide after init
- [x] 2.4 `src/components/Background.astro` — `<canvas hidden>`, aria-hidden, pointer-events-none
- [x] 2.5 `sections/{Hero,FeaturedWork,Projects,Skills,Contact}.astro` + `ProjectCard` + `Watermark` — single h1, role/focus areas, grouped skills, email CTA
- [x] 2.6 `src/pages/index.astro` — compose sections, `assertExactlyFour`, 2x2 grid `grid-cols-1 md:grid-cols-2`
- [x] 2.7 `src/pages/404.astro` + `src/scripts/entrances.ts` (≤300ms; reduced ≤200ms opacity-only)
- [x] 2.8 Verify: test:unit, `astro check`, build; `pnpm dev` anchors/404

## Phase 3: Nav, Transitions, SEO, Verification (PR 3)

- [x] 3.1 RED `tests/unit/menu-keys.test.ts`: ↑↓/Enter move+activate, closed no-op (persona-navigation)
- [x] 3.2 GREEN `src/lib/menu/keys.ts` — `reduceMenuKey(state,key,itemCount)`
- [x] 3.3 `{CompactNav,MenuOverlay}.astro` + `src/scripts/menu.ts` — `<dialog>`, focus trap/restore, 44px, `:focus-visible`, `noopener noreferrer`
- [x] 3.4 `BaseLayout` — `<ClientRouter/>`; canvas `transition:persist` (site-transitions)
- [x] 3.5 `src/components/JsonLd.astro` — Person JSON-LD name/jobTitle/email/sameAs
- [x] 3.6 `astro.config.mjs` — sitemap `filter` excluding /404
- [x] 3.7 RED→GREEN `tests/e2e/{portfolio,menu,reduced-motion,budget,links}.spec.ts` — anchors/zero-JS, 4 cards, CTA email, 404, keyboard scope/trap/restore, static frame, <100KB gz, links/SEO
- [x] 3.8 Verify: test:e2e, coverage ≥80, build, CI gate
