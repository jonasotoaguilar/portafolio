# Tasks: UI Performance and SEO Audit

## Review Workload Forecast

Estimated changed lines: 600–750 (A ~350–420, B ~250–330). Session 800-line budget: no extra burden-approval stop.

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal                         | Likely PR          | Focused test command                                                                                 | Runtime harness                                                                                               | Rollback boundary                                                                                            |
| ---- | ---------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1    | CTA, LinkedIn, copy, privacy | PR 1 (base = main) | `pnpm run test:unit -- src/lib/copy-deny.test.ts && pnpm run test:e2e -- e2e/content.spec.ts`        | `pnpm build`; About→Contact; href/rel/sameAs; no-phone; deny-list                                             | site/skills, pages, Footer, Head, `copy-deny*`, `e2e/content.spec.ts`                                        |
| 2    | Motion, SITE SEO, LCP        | PR 2 (base = PR 1) | `pnpm run test:unit -- src/lib/site-helpers.test.ts && pnpm run test:e2e -- e2e/interaction.spec.ts` | Lighthouse 3×7 SITE-unset; `SITE=https://example.test` build; ClientRouter/reduced-motion/pointer/will-change | `motion.ts`, `global.css`, robots, `og.png`, helpers, Head, WaterField, LCP pages, `e2e/interaction.spec.ts` |

## Phase 1: Slice A

- [x] 1.1 RED `src/lib/copy-deny.test.ts` deny tokens (`\bCV\b`, provenance, `tel:`, `8894`, `2050`, `+56`). `pnpm run test:unit -- src/lib/copy-deny.test.ts`
- [x] 1.2 GREEN create `src/lib/copy-deny.ts` (test-only; pages must not import).
- [x] 1.3 RED `e2e/content.spec.ts`: exact `https://www.linkedin.com/in/jonathan-soto-dev` + `rel` me/noopener/noreferrer on `/`, `/contact`, Footer; unique linkedin.com; sameAs; invert zero-link. No phone tokens.
- [x] 1.4 RED `e2e/interaction.spec.ts`: About CTA → `/contact` (not `/experience`) on load and ClientRouter back-forward; LinkedIn href persists; `/contact` phone-free; deny-list after persist.
- [x] 1.5 GREEN `src/data/site.ts` `linkedinUrl`; LinkedIn `<a>` in `src/components/Footer.astro`, `src/pages/contact.astro`, `src/pages/index.astro`; `src/components/Head.astro` `sameAs`; no phone; `src/pages/about.astro` CTA `/contact`.
- [x] 1.6 GREEN finished-product rewrite `src/pages/{contact,about,experience,projects,index}.astro`, `src/data/skills.ts`; drop public `CV`. `pnpm build`; scan `dist/` (read-only) deny-list+phone; `pnpm exec astro check`.

## Phase 2: Slice B — motion + SEO

- [ ] 2.1 RED `e2e/interaction.spec.ts`: reduced-motion load+ClientRouter; coarse/no-hover skips parallax; fine+hover enables; `will-change` cleared on complete/kill/swap; persist unoffset; SkipLink/restoration not smoothed.
- [ ] 2.2 GREEN `src/styles/global.css` drop global smooth scroll and standing `will-change`. `src/scripts/motion.ts` gate parallax hover+fine && !reduce; transient will-change; `killAll` on `astro:before-swap`.
- [ ] 2.3 RED `src/lib/site-helpers.test.ts` unset SITE → undefined. `pnpm run test:unit -- src/lib/site-helpers.test.ts`
- [ ] 2.4 GREEN `src/lib/site-helpers.ts` + Head helpers; og 1200×630; never invent origin. `astro.config.mjs` (read-only). Create `src/pages/robots.txt.ts` Allow `/`; `Sitemap:` only if site set. Create `public/og.png` from `src/assets/visuals/jona-hero.png` (read-only).
- [ ] 2.5 GREEN SITE-unset `pnpm build`: no fabricated origin; sameAs LinkedIn stays. Second build `SITE=https://example.test`: absolute canonical/og:url/og:image+w/h; robots Sitemap; JSON-LD url absolute. SEO gap ≠ perf fail.

## Phase 3: Slice B — LCP + GSAP

- [ ] 3.1 BASELINE before any perf edit: SITE unset; Chromium 3×7; 1280/375 Slow-4G CPU 4×; median LCP/INP/CLS.
- [ ] 3.2 RED inspect: `/` hero and `/about` profile lack `priority`; `src/components/WaterField.astro` eager — must not be LCP. `pnpm build`
- [ ] 3.3 GREEN `src/pages/index.astro` hero `priority`; `src/pages/about.astro` profile `priority`; WaterField not eager/high. Remeasure one variable vs 3.1.
- [ ] 3.4 After LCP, GSAP→CSS one variable; remeasure; keep GSAP if in-band (\|ΔLCP\|<100ms, \|ΔINP\|<20ms, \|ΔCLS\|<0.02 or median in baseline min–max), worse, or 2.1 fails. No new perf dependency.
- [ ] 3.5 `pnpm exec astro check && pnpm run test:unit && pnpm run test:e2e && pnpm build`. Inherit vs `.sdd/changes/ui-performance-seo-audit/design/chosen.yaml` (read-only).
