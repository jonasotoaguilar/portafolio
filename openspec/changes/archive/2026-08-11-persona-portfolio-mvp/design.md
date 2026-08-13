# Design: Persona Portfolio MVP

## Technical Approach

Static Astro 7.2.0 SSG with progressive enhancement (proposal Approach 1; exploration recommendation). Content Collections feed one index page + 404 at build time; Tailwind 4 `@theme` tokens mirror DESIGN.md; vanilla scripts + `motion` 13 handle menu, canvas, entrances; `<ClientRouter/>` drives view transitions. No React, no backend, JS < 100KB gz. Floor: self-hosted fonts (Anton preloaded), single `h1`, 44px targets, `:focus-visible` accent, decorative layers `aria-hidden`/`pointer-events-none`. Proposal-locked: synthesized italic Anton on menu labels with skew-only fallback; subtle keyboard key-hint footers as real affordances. Covers all six specs.

## Architecture Decisions

| # | Choice | Rationale (alternatives rejected) |
|---|--------|----------------------------------|
| D1 | `assertExactlyFour()` in `src/lib/content/projects.ts`, called from index frontmatter | zod alone cannot count entries; throwing fails the build with no output (completeness boundary). Rejected: zod-only |
| D2 | Even 2x2 card grid: `grid-cols-1 md:grid-cols-2` — the four cards fill both rows exactly | Deterministic, zero-JS, no orphan cell. Rejected: JS reorder, nth-child tricks |
| D3 | Native `<dialog>` + `showModal()` overlay | Modal focus-scope, Esc, focus-restore built in; closed dialog renders nothing, zero-JS path untouched. ↑↓/Enter keydown attached only while open (no hijack closed). Rejected: manual trap div |
| D4 | `<canvas transition:persist hidden>`; script unhides only after successful init | Persist needs the element in initial HTML; `hidden` satisfies "no canvas layer" with JS off/unsupported. Rejected: always-rendered canvas, JS-injected canvas |
| D5 | `matchMedia('(prefers-reduced-motion: reduce)')` + `change` listener | Paint one static frame, never start rAF; glow holds; runtime toggles handled. Rejected: CSS-only gate |
| D6 | `<ClientRouter/>` in BaseLayout; canvas persists via `transition:persist` | Auto full-page fallback when unsupported. Rejected: manual router |
| D7 | Zod schemas + helpers in `src/lib/` (vitest-node-safe), re-exported by `src/content.config.ts` | Unit tests import lib only — strict TDD (`tdd: true`), RED first. Rejected: testing through astro runtime |

## Data Flow

```
content/{projects/*.md, skills.yaml, site.config.yaml}
  → content.config.ts (zod; glob/file loaders)
  → index.astro: getCollection + assertExactlyFour()
  → sections/cards → static HTML + JSON-LD Person
Browser: menu.ts / living-background.ts / entrances.ts → motion 13 + rAF; canvas persists
```

## File Changes

**New**: `src/content.config.ts`; `src/lib/content/{schemas,projects}.ts`; `src/content/projects/{serviceflow,wealthquest,eventcommerce,fintual-sensor}.md`; `src/content/{skills,site.config}.yaml`; `src/layouts/BaseLayout.astro`; `src/components/{Background,CompactNav,MenuOverlay,ProjectCard,JsonLd,Watermark}.astro`; `src/components/sections/{Hero,FeaturedWork,Projects,Skills,Contact}.astro`; `src/pages/404.astro`; `src/scripts/{menu,living-background,entrances}.ts`; `src/lib/canvas/particles.ts`; `src/lib/menu/keys.ts`; `tests/unit/{content,canvas,menu-keys}.test.ts`; `tests/e2e/{portfolio,menu,reduced-motion,budget,links}.spec.ts`.

**Modified**: `src/pages/index.astro` (stub → page); `src/styles/global.css` (fontsource imports, `@theme` tokens, glow ~8s keyframes + reduced-motion hold); `astro.config.mjs` (sitemap `filter` excluding `/404`).

## Interfaces / Contracts

```ts
// projects (glob .md): title, description, stack[] (min 1), link, external (default false),
// order (number), featured?: boolean — absent ⇒ featured (default all four)
// assertExactlyFour(entries): throws unless length === 4; render order = sort by `order`
```

Canvas: pure `createParticleField(count,w,h)` / `step` / `render`; rAF clear→update→draw; `PARTICLE_CAP=120`; `cappedDpr=min(devicePixelRatio,2)`; pause on `visibilitychange` hidden, resume visible; cleanup cancels rAF + removes listeners; reduced motion: one frame, no loop.
Menu: pure `reduceMenuKey(state,key,itemCount)`; keydown only while open; Tab cycles dialog focusables; Esc closes; focus restored to opener.
Motion: transform/opacity only; entrances ≤300ms ease-out, stagger 30–50ms; overlay ≤400ms exception; reduced-motion opacity-only ≤200ms; hover gated `(hover:hover) and (pointer:fine)`.
External links: `target="_blank" rel="noopener noreferrer"`.

## Testing Strategy

**Unit** (Vitest, pure lib only, RED first): four-count/order/featured-default; schema fields; particle bounds + DPR cap; menu key reducer. **Integration**: `astro check` + `pnpm build` fail on schema violation / wrong count. **E2E** (Playwright chromium): anchors + zero-JS nav; 4 cards in order; CTA email; 404 direct; menu keyboard scope/trap/focus-restore; reduced-motion static frame (emulated); no visible canvas w/o JS; link checks (itch.io, GitHub); sitemap excludes 404; JSON-LD parses; budget < 100KB gz via `node:zlib` over dev-server assets.

## Threat Matrix

N/A — no routing engine, shell/subprocess, VCS/PR automation, executable-file classification, or process-integration boundary (declarative file routing; static output only).

## Migration / Rollout

No data migration. Three chained PR slices (< 400 lines each, auto-chain): **S1 foundations + content** — tokens, fonts, BaseLayout, background CSS layers, collections + validation + unit tests; **S2 sections + background** — sections, cards, watermarks, 404, canvas lib/script, entrances; **S3 nav + transitions + SEO + verification** — menu + keys, ClientRouter + persist, JSON-LD/sitemap, E2E + budget. Rollback: revert slice PR; canvas removal keeps glow/scanlines; overlay drop-safe; content data-only; redeploy prior release artifact.

## Open Questions

None blocking. Real copy for all four projects verified 2026-08-10 (Engram #5890/#5891): GitHub links for ServiceFlow, EventCommerce, Fintual Sensor; itch.io for WealthQuest.
