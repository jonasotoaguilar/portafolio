# Proposal: UI Performance and SEO Audit

## Intent

Public routes ship provenance copy, a backward About CTA, and a non-clickable LinkedIn handle. SEO is mixed with runtime performance, with no comparable measurements. Fix contact identity and finished-product copy; harden motion and SEO separately.

## Scope

### In Scope

- About CTA advances to `/contact`. LinkedIn `jonathan-soto-dev` becomes https://www.linkedin.com/in/jonathan-soto-dev on contact, home, Footer (`rel="me noopener noreferrer"`); JSON-LD `sameAs`; constructed-from-handle, not 999-verified.
- Phone omitted from DOM, built HTML, metadata, JSON-LD. Rewrite public development/provenance/source-verification copy as finished-product copy; no public `CV`; CV/GitHub internal inputs only.
- SEO when `site`/`SITE` set: canonical, sitemap, robots hint, absolute OG URL/image dimensions; never fabricate `site`.
- Motion: scope/remove global smooth scroll; short-lived `will-change`; gate parallax; persist teardown; keep reduced-motion.
- Runtime performance: LCP hints on true LCP images; GSAP vs CSS only as measured tradeoff.

### Out of Scope

Live LinkedIn fetch; fabricating `SITE`; Approach 3 re-voice; phone/forms/trackers; unmeasured performance claims.

## Capabilities

### New Capabilities

- `public-contact-channels`: About→Contact; constructed LinkedIn link; phone omitted
- `finished-product-copy`: finished-product public voice; CV/GitHub internal only
- `seo-discoverability`: canonical, sitemap, robots, OG, sameAs when site set; independent of runtime performance
- `runtime-motion`: persist teardown, short-lived will-change, scoped smooth scroll, gated parallax, reduced-motion
- `runtime-performance`: LCP/bundle work; no claim without before/after evidence

### Modified Capabilities

None

## Approach

Approach 2, two slices.

Slice A — correctness/content/privacy: About CTA; `linkedinUrl` in `src/data/site.ts`; clickable LinkedIn + `sameAs`; rewrite provenance; grep `dist/` for phone, `CV`, provenance.

Slice B — motion/SEO/performance with measurement: baseline Lighthouse on seven routes; one change at a time. SEO only with `site`. LCP hints on hero `/` and profile `/about`; WaterField is not LCP. Spec SEO separately from runtime performance.

## Affected Areas

Pages `about`, `contact`, `experience`, `index`, `projects`; `Footer.astro`; `Head.astro`; `site.ts`; `BaseLayout.astro`; `motion.ts`; `global.css`; `WaterField.astro`; `astro.config.mjs`; `e2e/content.spec.ts`.

## Risks

Constructed LinkedIn treated as verified (Med): `site.ts` comment, `rel="me"`, no verification claim. Stale GSAP after persist (Med): Playwright + kill on `astro:before-swap`. Performance claimed in noise (High): comparable runs; revert if within variance. E2E allows any `linkedin.com` (Med): carve-out this handle.

## Rollback Plan

Revert each slice independently. Restore prior copy, text-only LinkedIn, About→Experience CTA, and previous motion/SEO files.

## Dependencies

Preproposal revision 1 (`proposal_ready: true`); research.md revision 1 (`outcome: done`); `SITE` not fabricated; Playwright/Vitest/axe; Lighthouse.

## Success Criteria

- [ ] About CTA → Contact; LinkedIn constructed URL on contact, home, Footer; sameAs includes it; phone absent from DOM, built HTML, metadata, JSON-LD
- [ ] No public provenance/dev/source-verification or CV in dist; SEO absolute URLs only when site set; SEO failure is not a performance failure
- [ ] Reduced-motion honored; no persistent stylesheet will-change; parallax gated; performance claims cite comparable LCP/INP/CLS or are omitted
