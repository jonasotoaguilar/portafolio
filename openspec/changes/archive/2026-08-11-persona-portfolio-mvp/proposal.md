# Proposal: Persona Portfolio MVP

## Intent

Recruiters abandon slow, hard-to-crawl pages; the React SPA reference pays that cost for the Persona-3 look. Rebuild: fast, static, memorable one-pager — instant role, real work links, one-step contact, stack depth.

## Scope

### In Scope
- One page (Hero, Featured Work, Projects, Skills, Contact, 404)
- Collections: 4 projects, grouped skills, site config
- Hybrid nav: anchors (zero-JS) + overlay
- Canvas background; View Transitions; reduced motion
- SEO (title, JSON-LD, sitemap); JS < 100KB gz

### Out of Scope
- Blog/CMS, backend, i18n, analytics, light theme, extra pages, React island, video, emoji, shadows
- Deploy host (release artifact suffices)

## Capabilities

### New Capabilities
`openspec/specs/` empty — all new.
- `portfolio-content`: collections/schemas; `featured` flag
- `portfolio-page`: sections, anchors, 404, theme
- `persona-navigation`: nav + overlay, keyboard
- `living-background`: glow/scanlines + canvas, reduced-motion frame
- `site-transitions`: ClientRouter, canvas persist
- `seo-metadata`: title, JSON-LD Person, sitemap

### Modified Capabilities
None

## Approach

Approach 1: static Astro + vanilla `motion`, no framework runtime. Locked: hybrid nav; Featured Work = `featured` flag, default all four; grouped skills; italic Anton (skew fallback); key hints.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/` (index, 404) | Modified | Stub → page; new 404 |
| `src/content.config.ts`, `src/content/*` | New | Schemas + 4 projects |
| `src/components/`, `layouts/`, `scripts/` | New | Sections, canvas, motion |
| `src/styles/`, configs | Modified | Tokens, VT, CI |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Canvas INP | Med | Caps, pause, CI |
| Keydown hijack | Med | Scoped to menu |
| Reduced-motion drift | Med | Static frame; E2E |
| Link rot | Med | E2E link check |
| Content authorship | Med | Boundary below |

## Rollback Plan

- PR-per-slice revert; content data-only; overlay drop-safe (v1.1).
- Canvas removal: glow/scanlines persist.
- Deploy: re-run prior release artifact.

## Dependencies

None beyond declared stack. S2 needs Jona's verified content (only WealthQuest URL + email known).

## Success Criteria

- [ ] Lighthouse perf ≥ 90, a11y ≥ 95
- [ ] LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] Four PRD projects render; links resolve; anchors scroll; 404; CTA email; title/JSON-LD/sitemap
- [ ] Reduced motion: static frame; no backend
- [ ] Playwright + coverage ≥ 80 green

## Review Slices

S1–S7 exceed 400 lines → chained PRs: (1) foundations + content, (2) sections + background, (3) nav + transitions + SEO + verification — all < 400 lines.

## Proposal Question Round

Auto — confirm: (1) Jona's real content; (2) hybrid nav; (3) all four featured.
