# Exploration: Persona Portfolio MVP

**Change**: `persona-portfolio-mvp` | **Date**: 2026-08-10 | **Author**: sdd-explore

Sources: PRD.md, DESIGN.md, ARCHITECTURE.md (authoritative, read in full), repo scaffold, reference repo `/home/jona/repos/persona3-website` (mapped, not copied), Engram `sdd-init/portafolio` (#3823), `openspec/config.yaml`.

## Current State

The repo is a fresh Astro 7.2.0 SSG scaffold on `feat/persona-portfolio-mvp` (single initial commit): `src/pages/index.astro` is a stub `<h1>`, `src/styles/global.css` is only `@import "tailwindcss"`. Dependencies for the target design are already installed (Tailwind 4.3.3 via `@tailwindcss/vite`, `motion` 13.0.0, `@astrojs/sitemap`, `@fontsource/anton` + `bebas-neue`). No content, no components, no tests committed yet (`tests/` does not exist).

The three product contracts are complete and authoritative and already resolve the architecture: PRD.md (MVP scope, measurable success criteria, acceptance criteria, non-goals), DESIGN.md (full Persona-3 design system with Tailwind-mappable tokens), ARCHITECTURE.md (approved SSG pattern; ADR-0001 static over React SPA; ADR-0002 Canvas 2D over video assets; pinned toolchain). The quality pipeline is provisioned but inert: `ci.yml` (astro check, biome, unit + coverage, Playwright chromium E2E, build), `pr-check.yml` (400-line cognitive budget, `size:exception` label), `release.yml` + `scripts/release-*` (GitHub Release with dist tarball). OpenSpec config exists (`tdd: true`, coverage ≥ 80, test/build commands wired).

Reference repo mapping (`/home/jona/repos/persona3-website`): React 19 + react-router 7 + framer-motion 12 SPA with routes `/`, `/about`, `/resume`, `/socials`. Signature pieces: P3Menu (giant skewed italic Anton labels, clip-path parallelogram highlight/shadow, red side stripes, keyboard ↑↓/Enter navigation, staggered 80ms row entrances), framer overlay page transitions (colored panels/blocks per route, 450-600ms), social-stat bars, Resume "LIST" cards, full-bleed video background on About, Google Fonts CDN, emoji icons, hard offset shadows, fixed 100vh game screens, placeholder copy.

## Target Visitors & Core Journey

- **Recruiter (primary)**: scans in under a minute — needs instant headline/role, working anchors, real linkable work, one-step contact. Abandons slow or hard-to-crawl pages (the problem the PRD exists to fix).
- **Developer (secondary)**: assesses depth via stacks and project descriptions.

Journey: Land `/` → Hero (who/what in first viewport) → Featured Work (evidence) → Projects (depth) → Skills (breadth) → Contact (action, email CTA). Unknown paths → 404 with a single way back. Success per PRD: Lighthouse performance ≥ 90, accessibility ≥ 95, LCP < 2.5s, CLS < 0.1, INP < 200ms; all nav targets scroll to sections; zero runtime backend.

## MVP Scope & Non-Goals

**In scope**: one-page site (Hero, Featured Work, Projects, Skills, Contact) + 404; Canvas 2D living background; View Transitions; Persona-3 nav (form factor is an open decision below); SEO (title, meta, JSON-LD `Person`, sitemap.xml); Content Collections (projects, skills, site config); unit + E2E + CI green; reduced-motion contract; JS budget < 100KB gzipped.

**Non-goals (authoritative, from PRD)**: no blog/CMS/admin, no backend/database/cache/SSR, no i18n, no analytics, no light theme, no pages beyond `/` and `/404`, no React unless the P3 menu requires an island (it does not — the reference menu is plain DOM), no video or heavy image assets.

## Page / Section Architecture

Single scrollable page, stacked sections with generous rhythm: Hero → Featured Work → Projects → Skills → Contact. One `h1` (hero title). Fixed three-layer background behind content, stacking `glow → scanlines → canvas → content`, all decorative layers `pointer-events-none` and `aria-hidden`. Section anchors `#featured-work`, `#projects`, `#skills`, `#contact`. Giant translucent Anton watermarks behind sections (decorative). `/404` reuses the visual identity with one action back to `/`.

## Persona-Inspired Visual Language (legible + original)

DESIGN.md is authoritative and already encodes the identity: near-black navy `#04060f`, breathing radial blue glow, CRT scanline overlay (~15% black), Anton display + Bebas Neue labels, zero soft radii, depth via light layers only (no shadows). Additive borrows from the reference that are safe and original in combination:

- Synthesized italic Anton + skew on nav/menu labels (the P3 signature) — reference-proven, zero assets.
- Clip-path parallelogram highlight sweep on the active nav item (reference `polygon(0 0, w 0.5h, 0 h)` idiom).
- Staggered group entrances (30-80ms) and game-style key-hint footers as real keyboard affordances.
- Social-stat-bar motif adapted into the Skills section *without* fake metrics.

Rejections (copying the reference would violate the contracts): red accent family (→ blue accent `#4666ff`), video backgrounds (ADR-0002), emoji icons (PRD/DESIGN), Google Fonts CDN (self-hosted fontsource), hard offset shadows (DESIGN.md bans shadows), fixed-100vh game screens (must scroll for recruiters), placeholder copy/fake stats.

## Motion & Canvas Boundaries

- **Canvas**: rAF game loop (clear → update → draw), capped particle count, `devicePixelRatio` cap, pause on tab hidden; `prefers-reduced-motion: reduce` → paint one static frame, never start the loop. Content never blocks on canvas.
- **UI motion**: `transform`/`opacity` only, sub-300ms, `motion` 13.0.0 vanilla API in scripts; View Transitions 250-300ms (≤ 400ms documented exception); glow breathing ~8s pure CSS; hover effects gated behind `(hover: hover) and (pointer: fine)`; never animate layout properties.
- **Progressive enhancement**: zero-JS still renders content + glow + scanlines; `<ClientRouter/>` falls back to full-page navigation.

## Accessibility & Reduced-Motion Behavior

Contrast floors per DESIGN.md (`text-secondary` only ≥ 1rem, accent ≥ 4.5:1 for text). Keyboard contract: menu fully operable with ↑↓/Enter, but key handling MUST be scoped to the open menu — global arrow-key hijacking (as in the reference) would break page scroll; `:focus-visible` in the accent family. Decorative layers `aria-hidden` + `pointer-events-none`. Touch targets ≥ 44px. Reduced motion: static canvas frame, glow holds, entrances opacity-only ≤ 200ms — enforced by E2E with emulated media.

## Content Model

- `projects` collection (`glob()` loader, `.md`): `title`, `description`, `stack[]`, `link`, `external` flag, ordering + optional `featured` (open decision).
- `skills` collection or single YAML via `file()` loader: grouped lists (backend / frontend / tooling), no fake level numbers.
- Site config (`file()` loader, one YAML): name, role, tagline, focus areas, email (jonathansoto.dev@gmail.com), socials (GitHub, WealthQuest itch.io), page title.
- Copy: English, first-person, professional, no emojis in UI strings.

## Responsive Behavior

Mobile-first single column below 768px; Featured Work grid 2 columns ≥ 768px (odd count of 5 needs an explicit layout decision). Fluid type via `clamp()` for `menu-label`/`watermark` desktop maxima. Background layers fixed on all viewports; canvas re-sizes with DPR caps. Touch targets ≥ 44px.

## Approaches

1. **Pure static + vanilla enhancement (recommended)** — all content static Astro; canvas + menu + motion in vanilla scripts with `motion` 13; P3 menu as a DOM overlay enhanced by a small script; no React island.
   - Pros: zero framework runtime (JS budget), aligns with ADR-0001 and DESIGN.md; reference proves the DOM-only menu works.
   - Cons: hand-rolled interaction code; menu focus/keyboard scope needs care.
   - Effort: Medium

2. **React island for the P3 menu** (`@astrojs/react`) — port `P3Menu.jsx` nearly verbatim.
   - Pros: fastest port of the reference menu.
   - Cons: adds a framework runtime for one component; PRD reserves React "only if the P3 menu requires it" — it does not.
   - Effort: Low-Medium

3. **Compact P3-styled nav only** — skip the full-screen overlay.
   - Pros: smallest possible MVP.
   - Cons: loses the memorable identity moment; DESIGN.md documents the full-screen menu + keyboard flow.
   - Effort: Low

## Recommendation

Approach 1, with the menu as a hybrid: compact P3-styled anchor nav always visible (works with zero JS) plus the full-screen overlay menu as progressive enhancement (the "wow" first impression). The overlay is drop-safe to v1.1 without rework if budget pressure hits. Build in grow-in-layers order (below); keep strict TDD per slice (`apply.tdd: true`, coverage ≥ 80).

### Likely implementation slices (for sdd-tasks)

- **S1 Foundations**: Tailwind 4 theme from DESIGN.md tokens, fontsource imports, glow/scanline layers, base layout + head shell.
- **S2 Content**: `src/content.config.ts` schemas + 5 project entries + skills + site config; schema unit tests.
- **S3 Sections**: Hero, Featured Work, Projects, Skills, Contact, watermarks, anchors, 404 page.
- **S4 Background**: Canvas particle/fog layer, DPR + count caps, visibility pause, reduced-motion static frame; unit tests for pure logic.
- **S5 Nav/menu**: compact nav + overlay menu, keyboard contract scoped to open menu, entrance/highlight motion; E2E.
- **S6 Transitions**: `<ClientRouter/>` view transitions (index ↔ 404), `transition:persist` canvas, entrance motion.
- **S7 SEO + verification**: JSON-LD `Person`, sitemap, full Playwright suite (anchors, 5 cards, contact CTA, 404, reduced-motion, link checks), coverage gate.

The full change will exceed the 400-line review budget → sdd-tasks MUST plan chained PRs (`delivery_strategy: auto-chain` already set; `pr-check.yml` enforces the budget with `size:exception`).

## Risks

- **Canvas INP** on mid-range devices: capped particles, DPR cap, hidden-tab pause; budget check in E2E/CI.
- **Keyboard hijack**: global keydown listeners (reference pattern) break page scroll — keys MUST only be active while the menu is open.
- **Reduced-motion drift**: canvas must paint a static frame and never start the loop; enforced by E2E with emulated `prefers-reduced-motion`.
- **View Transition + canvas persistence** (404 ↔ home): `transition:persist` wiring; full-page navigation fallback when unsupported.
- **Anton synthesized italic** rendering variance across platforms (`font-synthesis`): minor; fall back to skew-only if inconsistent.
- **Even-count grid** (4 projects in 2 columns): explicit layout decision needed.
- **Link rot** (itch.io, GitHub): E2E link-check assertions guard CI.
- **Content authorship dependency**: the four projects need real, verified content from Jona (descriptions, stacks, links) — proposal should confirm before apply.

## Open Product Decisions (for proposal)

1. **Menu form factor**: full-screen overlay vs compact nav vs hybrid (recommended: hybrid, overlay as enhancement).
2. **Featured Work vs Projects relationship**: same four in different layouts vs curated subset (recommended: `featured` flag, default all four, 2x2 grid handles the even count).
3. **Skills presentation**: stat-bar motif vs grouped lists (recommended: grouped lists, no fake metrics).
4. **Italic Anton adoption** on menu labels: yes (recommended) / no.
5. **Deploy target confirmation**: `release.yml` publishes a GitHub Release with dist tarball — final static host (GitHub Pages / Cloudflare Pages / other) is unstated in contracts; non-blocking for code.
6. **Key-hint footers**: adopt as visible keyboard affordance (recommended: yes, subtle).

## Ready for Proposal

Yes. Proposal should (a) lock the six open decisions — especially menu form factor and Featured Work/Projects relationship, (b) confirm the four project entries with real content, (c) plan chained PR slices given the 400-line budget, (d) carry no new dependencies beyond the declared stack.
