# Design: UI Performance and SEO Audit

## Technical Approach

Two slices on the Astro 7 static layout. A: contact identity and finished copy. B: motion, SITE-gated SEO, measured LCP. Specs: `public-contact-channels`, `finished-product-copy`, `seo-discoverability`, `runtime-motion`, `runtime-performance`. Visual inherit: `.sdd/changes/ui-performance-seo-audit/design/chosen.yaml`. No new palette, type, or composition.

## Architecture Decisions

| Decision      | Options                              | Tradeoff                  | Choice                                           |
| ------------- | ------------------------------------ | ------------------------- | ------------------------------------------------ |
| LinkedIn SoT  | helper vs `site` constant            | helper unused             | `site.linkedinUrl` exact URL                     |
| SEO origin    | fallback host vs gate                | fallback fabricates       | Gate on `Astro.site`/`SITE`                      |
| robots        | static file vs endpoint              | static needs a host       | `robots.txt.ts`; `Sitemap:` only if `site`       |
| Head URLs     | inline vs `site-helpers`             | drift                     | Head calls helpers                               |
| Smooth scroll | `:target` vs remove                  | `:target` delays SkipLink | Remove `html { scroll-behavior }`                |
| will-change   | CSS vs JS                            | MDN memory                | JS only; clear on complete/kill/swap             |
| Parallax      | always vs hover+fine                 | touch waste               | `(hover: hover) and (pointer: fine)` and !reduce |
| LCP           | preload+priority vs Image `priority` | double-fetch              | `priority` on true LCP only                      |
| GSAP vs CSS   | assume CSS vs measure                | unknown bytes             | Keep unless isolated run beats variance          |
| OG file       | hashed asset vs `public/og.png`      | hash unstable             | 1200×630 from existing hero                      |

## Data Flow

```
SITE → Astro.site → Head canonical/og (omit if unset); sitemap (gated); robots Sitemap line if set
site.linkedinUrl → /, /contact, Footer (rel me noopener noreferrer) and Person sameAs [github, linkedinUrl]
ClientRouter: before-swap killAll; persist WaterField+bg-words; page-load initMotion
```

`killAll` reverts GSAP, removes `mousemove`, cancels RAF, clears `will-change`, resets persisted `transform`/`x`/`y`.

## File Changes

| File                                                        | Action | Description                                                     |
| ----------------------------------------------------------- | ------ | --------------------------------------------------------------- |
| `src/data/site.ts`                                          | Modify | `linkedinUrl`; constructed, not 999-verified                    |
| `src/lib/site-helpers.ts`                                   | Modify | Canonical/OG seam; no invented host                             |
| `src/lib/copy-deny.ts`                                      | Create | Test-only deny patterns; pages must not import                  |
| `src/components/Head.astro`                                 | Modify | Helpers; LinkedIn sameAs; OG w/h; no phone                      |
| `src/pages/robots.txt.ts`                                   | Create | Allow `/`; Sitemap only when `site` set                         |
| `public/og.png`                                             | Create | 1200×630 from existing hero                                     |
| `src/pages/{contact,index,about,experience,projects}.astro` | Modify | Links, CTA `/contact`, finished copy, LCP `priority`            |
| `src/data/skills.ts`                                        | Modify | Remove public `CV`                                              |
| `src/components/Footer.astro`                               | Modify | LinkedIn `<a>`                                                  |
| `src/components/WaterField.astro`                           | Modify | Not LCP: no eager/high priority                                 |
| `src/scripts/motion.ts`                                     | Modify | Pointer gate; transient will-change; persist reset              |
| `src/styles/global.css`                                     | Modify | Drop global smooth scroll and standing will-change              |
| `e2e/{content,interaction}.spec.ts`                         | Modify | href/sameAs/copy/phone; persist/SkipLink/pointer/reduced-motion |
| `src/lib/site-helpers.test.ts`                              | Modify | Unset SITE → undefined                                          |
| `src/lib/copy-deny.test.ts`                                 | Create | Pattern units                                                   |

Do not add a fallback `site` in `astro.config.mjs`.

## Interfaces / Contracts

```ts
linkedinUrl: "https://www.linkedin.com/in/jonathan-soto-dev";
sameAs: [site.github, site.linkedinUrl]; // always; independent of SITE
canonicalUrl(site, path); // undefined if !site
ogImageUrl(site); // `${origin}/og.png` or undefined
```

LCP: `/` hero `priority`; `/about` profile `priority`; WaterField never high-priority.

Copy lives in page `.astro`, rendered `src/data/*`, and meta title/description. `site.ts` comments may record constructed status. GitHub is a channel, never proof. Deny-list (test-only; scan `dist/` + visible text; exclude `copy-deny.ts`): `\bCV\b`, `view source`, `owner-authorized`, `privacy by omission`, `JSON-LD`, `fabricated`, `text-only until`, `no form provider`, `facts-only from`, `as verified from`, `from CV`, `As stated in CV`, `tel:`, `telephone`, `8894`, `2050`, `+56`. Rewrite as product voice.

Missing `SITE` is a deploy/SEO gap. Performance runs SITE-unset and must not fail on absent canonical/sitemap/OG.

## Testing Strategy

| Layer      | What                                                                            | Approach                      |
| ---------- | ------------------------------------------------------------------------------- | ----------------------------- |
| Unit       | helpers, deny-list, phone tokens                                                | Vitest                        |
| Structural | dist grep phone/`CV`/deny-list; unique LinkedIn href                            | `astro build`                 |
| E2E        | About→`/contact`; href+rel; ClientRouter; copy                                  | Playwright                    |
| Motion     | reduced-motion; no standing will-change; SkipLink instant                       | Playwright styles             |
| Privacy    | no phone in DOM/HTML/JSON-LD                                                    | E2E + dist                    |
| SEO        | unset: no fabricated origin. `SITE=https://example.test` fixture: absolute tags | second build, not default e2e |
| Perf/trace | LCP hints; WaterField not high-priority; GSAP band                              | attributes + procedure        |

## GSAP keep/revert

Chromium preview, SITE unset, 3×7 routes (`/`, `/projects`, `/skills`, `/experience`, `/about`, `/contact`, `404`), desktop 1280 and mobile 375 Slow-4G CPU 4×. Median LCP/INP/CLS. One variable per experiment. In-band if after-median inside baseline min–max, or \|ΔLCP\|<100ms, \|ΔINP\|<20ms, \|ΔCLS\|<0.02 → revert. 2.5s/200ms/0.1 classify only. GSAP→CSS after LCP hints; keep GSAP if in-band, worse, or motion contracts fail. No new perf dependency.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR, executable-file, or process-integration boundary.

## Migration / Rollout

No migration required. Slice A then B; revert independently.

## Open Questions

None
