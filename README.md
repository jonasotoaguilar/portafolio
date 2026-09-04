# Portafolio — Persona 3 Reload-Inspired Game-Menu Portfolio

Static Astro portfolio for Jonathan Soto (`jonasotoaguilar`) — Backend Engineer, Santiago Chile, open to remote. Six routes as menu scenes over a water/bubble field.

## What It Does

Presents verifiable backend credibility — four shipped projects, skills, and experience — through a static, facts-only site. Content comes from public GitHub and an owner-authorized CV summary. Contact is static links only (`mailto:`, GitHub), no form or backend. Output is `dist/` after `astro build` (seven entries: `/`, `/projects`, `/skills`, `/experience`, `/about`, `/contact`, `404`).

## Quick Start

Prerequisites: Node `>=22.13.0` and pnpm `11.25.0` (pinned via `packageManager` in `package.json`).

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open the URL printed by `astro dev`. Expected result: local dev server with all six routes navigable.

Essential verification:

```bash
pnpm run check
pnpm run lint
pnpm run format:check
pnpm run test:unit
pnpm run build
pnpm run test:e2e  # first run: npx playwright install --with-deps chromium
```

Build emits `dist/` with hashed `_astro/*.webp` images. See `docs/CODEBASE-GUIDE.md` for the full verification matrix.

## Core Workflow

1. Edit content in `src/data/` (site, navigation, projects, skills, experience) — single source of truth.
2. Adjust presentation in `src/pages/*.astro` or shared `src/layouts/BaseLayout.astro` and `src/components/*`.
3. Tune tokens or motion in `src/styles/global.css` and `src/scripts/motion.ts`.
4. Verify with `pnpm run check && pnpm run lint && pnpm run test:unit && pnpm run build`.

`SITE` is optional. Set `SITE=https://your-domain` at build time to enable canonical, `og:url`/`og:image`, and sitemap. Without it those artifacts are intentionally absent.

## Key Features You Should Know About

- **Six routes + 404** as standalone Astro pages sharing `BaseLayout`, `Head`, `SiteNav`, `WaterField`, and `Footer`.
- **Water/bubble world** via `astro:assets` (`src/assets/visuals/*` → `_astro/*.webp`) plus GSAP entrance and `prefers-reduced-motion` guard.
- **Keyboard-first navigation** with `aria-current="page"`, roving focus, and `SkipLink`.
- **Lint/format** with `oxlint@1.81.0` and `oxfmt@0.66.0`; type safety via `astro check`.
- **Tests** — Vitest unit and Playwright + axe-core on all routes + 404.
- **CI/release** — `verify` + `e2e` on `main`; stable `v*` tag releases publish `dist-*.tar.gz` + `.sha256` and the immutable container image `ghcr.io/jonasotoaguilar/portafolio:<tag>@sha256:<digest>` (production `SITE` baked, digest recorded in the release notes). Dokploy deploys that exact digest; no `latest` tag is published.

## Documentation

| Your task                                             | Start here                                         |
| ----------------------------------------------------- | -------------------------------------------------- |
| Understand product intent, scope, and privacy         | [`PRODUCT.md`](PRODUCT.md)                         |
| See palette, panel grammar, and motion direction      | [`DESIGN.md`](DESIGN.md)                           |
| Check requirements R1–R20 and acceptance criteria     | [`PRD.md`](PRD.md)                                 |
| Navigate architecture, data ownership, and change map | [`docs/CODEBASE-GUIDE.md`](docs/CODEBASE-GUIDE.md) |
| Learn agent skill conventions                         | [`AGENTS.md`](AGENTS.md)                           |

## Next Steps

- Read `docs/CODEBASE-GUIDE.md` before changing routes, data, or tokens.
- Use `pnpm exec lefthook validate` and staged checks during development.
- For releases, set `SITE` via `vars.SITE` and push a stable `v*` tag — see `scripts/release-preflight` and `.github/workflows/release.yml`.
