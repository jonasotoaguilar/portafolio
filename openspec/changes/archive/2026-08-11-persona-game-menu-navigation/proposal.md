# Proposal: Persona Game-Menu Navigation

## Intent

The scrolling one-page landing is the wrong product model (archived MVP decision reversed). Recruiters need instant credibility: a Persona-3 game-menu shell where each menu item swaps the complete view to its own static route — fast and deep-linkable. Reference defects (dead routes, global keys, missing mobile detail, fake ranks) are excluded, never copied.

## Scope

### In Scope
- Root game-menu shell at `/`: five skewed items, keyboard-first (`reduceMenuKey`); gamepad hints only.
- Five static routes `/about`, `/resume`, `/projects`, `/skills`, `/contact`; 404 preserved.
- In-view LIST/detail panels; PROJECTS `#slug` links; Esc closes panel then `/`; native Back.
- RESUME typed from August 2026 CV; phone excluded.
- Delete Featured Work grid, dialog overlay, anchors; preserve canvas, reduced-motion, toolchain, tests.
- Spec deltas (5 rewritten + resume-content); mental-model/CODEBASE-GUIDE sync.
- Six slices S1–S6, <400 lines, stacked-to-main.

### Out of Scope
- Gamepad API; `/projects/:slug`; blog/backend/i18n/theme toggle; React by default; new deps; copied assets.

## Capabilities

### New Capabilities
- `resume-content`: resume collection typed from CV (experience, education, projects, skills, languages); schema excludes phone/ranks/metrics; no-phone gate.

### Modified Capabilities
- `persona-navigation`: overlay → shell menu + scoped per-view keyboard.
- `portfolio-page`: single anchored page → shell + five views.
- `portfolio-content`: Featured Work removed; projects render once.
- `site-transitions`: menu↔views overlays ≤400ms; ≤200ms opacity-only reduced motion.
- `seo-metadata`: per-view titles/h1/JSON-LD; sitemap six URLs.
- `living-background`: unchanged.

## Approach

ADR-0003 (Approach A): real static Astro routes; every view is plain HTML — content renders without JS — no-scroll applied by the enhancement layer only. Scoped vanilla TS keys reuse `reduceMenuKey`; `<ClientRouter/>`; canvas persists via `transition:persist`. User-visible: one URL per view; Esc/Back to menu.

## Affected Areas

| Area | Impact |
|------|--------|
| `src/pages/index.astro` | Replace → menu shell |
| `src/pages/{about,resume,projects,skills,contact}.astro` | New views |
| `src/components/{CompactNav,MenuOverlay,Section}.astro`, `sections/*`, `src/scripts/menu.ts`, `src/lib/menu/keys.ts` | Delete/Replace (scoped keys) |
| `src/layouts/BaseLayout.astro`, `src/lib/seo/*`, `src/content/*` | Adapt + resume collection |
| `tests/*` | Partial: replace anchor/scroll specs |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CV typing drift | Med | S5 gate vs CV |
| Phone leak | Low | Schema + gate; never in history |
| Keyboard hijack | Med | Scoped handlers; E2E |
| Overlay >400ms | Med | Duration caps |
| Mobile panel overflow | Med | Stacked + internal scroll |

## Rollback Plan

Revert chain (delete views, restore landing); content/canvas/tokens/tests preserved.

## Dependencies

None new: Astro 7.2.0, Tailwind 4.3.3, motion 13.0.0, sitemap.

## Success Criteria

- [ ] Five menu items on `/`, each opening its own static page.
- [ ] PROJECTS lists the four verified projects; `#serviceflow` preselects.
- [ ] RESUME shows only verified CV facts; phone absent from content, HTML, tests, history.
- [ ] Esc on any view → `/`; Back follows native history.
- [ ] Per-view title and one h1; sitemap six URLs; JSON-LD valid.
- [ ] No-JS: content in document flow; reduced motion: static canvas.
- [ ] Lighthouse ≥90/≥95; LCP <2.5s, CLS <0.1, INP <200ms; JS <100KB.
- [ ] Suite + build green; six slices <400 lines.
