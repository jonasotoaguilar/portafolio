# portafolio Codebase Guide

A concise navigational index for maintainers, contributors, and reviewers.
NOT an API reference, NOT a README replacement, NOT an architecture doc.
Every link below points to a file that exists in this repository.

## Audience

| Role | What this guide gives them |
|------|---------------------------|
| **New contributor** | Where to start and which files to read first |
| **Maintainer** | Where each concern lives and the boundary rules |
| **Reviewer** | What belongs where and how to verify intent |

## Mental Model

portafolio is a fully static Persona-3 game-menu portfolio for Jonathan Soto (jonasotoaguilar): Astro 7.2.0 generates plain HTML at build time from Content Collections, with a root game-menu shell at `/` and five view routes (`/about`, `/resume`, `/projects`, `/skills`, `/contact`), while a fixed three-layer background (CSS radial glow, CSS CRT scanlines, Canvas 2D particles) and native View Transitions provide the Persona-3 feel in the browser. There is no backend, database, or runtime state; the output is served by any static host.

- `docs/codebase/mental-model.md` — the foundational detail page: how the site fits together, data flow, the canvas game-loop pattern, and the reduced-motion contract.

## Golden Rule

Static-first and content-driven: everything a visitor sees is generated at build time from Markdown content, and every interactive surface (motion, canvas, transitions) is progressive enhancement on top of static HTML. Content lives in Content Collections, presentation in components and Tailwind utilities, and behavior in isolated client scripts. A change that reaches into more than one of those layers is a sign to reconsider the design.

## Guide Pages

| Page | What it covers | Key files |
|------|---------------|-----------|
| `docs/codebase/mental-model.md` | Mental model of the site: shell + views, content collections, three-layer background, view transitions | `src/pages/index.astro`, `src/styles/global.css`, `astro.config.mjs` |

## Stack

| Tool | Version | Role |
|------|---------|------|
| Astro (SSG) | 7.2.0 | Static site generation, routing, View Transitions |
| `@astrojs/sitemap` | 3.7.3 | Build-time sitemap generation |
| Tailwind CSS | 4.3.3 | Styling via `@tailwindcss/vite` plugin |
| TypeScript | ^6.0.3 | Types for Astro files and client scripts (strict) |
| motion | 13.0.0 | Vanilla API animation in client scripts |
| Vitest | 4.1.10 | Unit tests (`tests/unit`), V8 coverage |
| Playwright | 1.62.1 | E2E tests (`tests/e2e`) |
| Biome | 2.5.7 | Lint and format |
| Lefthook | 2.1.10 | Git hooks (pre-commit lint + changed-unit-tests) |
| Stryker | 9.6.1 | Mutation testing (configured; no TS targets yet) |
| pnpm | 11.1.1 | Package manager (Node >= 24) |

## Directory Map

```
.
├── .agents/skills/          # project-local agent skills
│   ├── astro-framework/     #   Astro references, rules, and SKILL.md
│   └── tailwind-4-docs/     #   Tailwind 4 docs, engineering playbook, sync script
├── .github/workflows/       # ci.yml, pr-check.yml, release.yml
├── docs/
│   ├── adr/                 # ADR-0001 (static over SPA), ADR-0002 (canvas background), ADR-0003 (static view routes)
│   ├── CODEBASE-GUIDE.md    # this guide
│   └── codebase/            # detail pages (mental-model.md)
├── public/                  # static assets: favicon.ico, favicon.svg
├── scripts/                 # release hooks: release-preflight, release-publish, release-verify
├── src/
│   ├── components/          # game/ shell+view components; preserved: Background, JsonLd, Watermark
│   ├── content/             # content collections: projects/*.md, skills.yaml, site.config.yaml, resume.yaml (+ content.config.ts)
│   ├── layouts/             # BaseLayout.astro (head, transitions)
│   ├── lib/                 # canvas/particles.ts, content/schemas.ts + projects.ts, menu/keys.ts, motion/, seo/
│   ├── pages/               # index.astro (game shell), 404.astro, and the five view routes
│   ├── scripts/             # shell.ts, view.ts, entrances.ts, living-background.ts
│   └── styles/              # global.css (Tailwind entry point)
├── tests/                   # unit/ (Vitest: content, canvas, seo, pages, menu-keys, layout, entrances, resume, privacy-gate), e2e/ (Playwright: views, links, budget, reduced-motion)
├── astro.config.mjs         # site URL, sitemap, Tailwind v4 plugin
├── biome.json               # lint/format configuration
├── lefthook.yml             # pre-commit: biome + vitest --changed
├── playwright.config.ts     # E2E runner (webServer: pnpm dev on :4321)
├── stryker.config.json      # mutation testing config (mutate: src/**/*.ts)
├── tsconfig.json            # TypeScript config for Astro
└── vitest.config.ts         # unit tests + coverage thresholds (80/70/80/80)
```

## Key Workflows

| Workflow | Command | Notes |
|----------|---------|-------|
| Dev server | `pnpm dev` | http://localhost:4321; use `astro dev --background` for background mode |
| Unit tests | `pnpm test` / `pnpm test:unit` | Vitest; runs `tests/unit/**/*.test.ts` |
| E2E tests | `pnpm test:e2e` | Playwright; boots the dev server automatically |
| Coverage | `pnpm coverage` | V8; thresholds 80% statements / 70% branches / 80% functions / 80% lines |
| Lint | `pnpm lint` / `pnpm lint:fix` | Biome (`biome check .`) |
| Type check | `pnpm check` | `astro check` |
| Build | `pnpm build` | Static output to `dist/` |
| Pre-commit | auto (Lefthook) | Biome on staged files + changed-file unit tests |
| Release | tag `vX.Y.Z` | `release.yml`: preflight -> publish -> verify; GitHub Release with `dist/` tarball |

CI (`ci.yml`) runs on every PR and push to `main`: type check, lint, unit tests, coverage, Playwright E2E, and build. `pr-check.yml` enforces the PR review budget.

## Documentation

- `[README.md](../README.md)` — quick start, configuration table, and links to deep docs.
- `[PRD.md](../PRD.md)` — product intent: audience, user stories, acceptance criteria, phased rollout.
- `[ARCHITECTURE.md](../ARCHITECTURE.md)` — system architecture: build pipeline, component details, testing strategy, NFRs.
- `[DESIGN.md](../DESIGN.md)` — visual design system: Persona-3 aesthetic, tokens, layout, motion, accessibility contract.
- `[docs/adr/0001-astro-static-over-react-spa.md](adr/0001-astro-static-over-react-spa.md)` — why Astro static over a React SPA.
- `[docs/adr/0002-canvas-2d-background-over-video-assets.md](adr/0002-canvas-2d-background-over-video-assets.md)` — why a Canvas 2D game loop over video assets.
- `[docs/codebase/mental-model.md](codebase/mental-model.md)` — foundational mental-model detail page (start here after this guide).
- `[AGENTS.md](../AGENTS.md)` — agent operating rules for this repository.
- `.github/` — community docs (CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md, CODEOWNERS, issue/PR templates).

## Recommended Reading Path

1. `README.md` — what the project is and how to run it.
2. `docs/codebase/mental-model.md` — how the site fits together and what is implemented vs. planned.
3. `PRD.md` and `DESIGN.md` — product intent and the Persona-3 visual system.
4. `ARCHITECTURE.md` and `docs/adr/` — technical architecture and the three key decisions.

## Next Step

Read the mental model, then explore `src/pages/index.astro` and `src/styles/global.css` (the game shell and its motion contracts). Changes land through a branch and PR, never directly on `main`.
