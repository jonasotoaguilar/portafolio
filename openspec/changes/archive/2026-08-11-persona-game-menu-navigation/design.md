# Design: Persona Game-Menu Navigation

## Technical Approach

Six static routes (ADR-0003): shell `/` + five views, plain HTML. `data-game-ready` applies the 100dvh no-scroll screen only with JS (portfolio-page). Vanilla TS reuses `reduceMenuKey` + new reducers (persona-navigation); LIST+panel views, `#slug` preselect. Canvas persists; `::view-transition` overlays cover shell ↔ views ↔ 404 (site-transitions). Typed `resume` + two-layer no-phone gate (resume-content). Per-view title/canonical/JSON-LD; sitemap six URLs (seo-metadata). No new deps, no React; Gamepad API MUST NOT be used — hints decorative only.

## Architecture Decisions

| # | Decision | Alternatives | Rationale |
|---|---|---|---|
| D1 | Six static routes, shell at `/` | Client state; sub-routes | ADR-0003: URLs/SEO/zero-JS; native Back |
| D2 | Extend `keys.ts`: `reduceMenuKey` + `reduceListKey`/`escapeHierarchy` | Router lib | Pure reducers, unit-tested, scoped |
| D3 | Overlay: 300ms + ≤25ms×4 = 400ms; reduced 200ms opacity | — | site-transitions; test `300+4×25=400` |
| D4 | `::view-transition`, `html[data-route]` keyed | JS `motion` script | Zero JS; native fallback |
| D5 | `data-game-ready` gate | Unconditional hidden | No-scroll enhancement-only |
| D6 | Two-layer no-phone gate | CI secret | Ephemeral value; typed unavailable when missing |
| D7 | Escape ⇒ direct `/` route; Back = native history | `history.back()`; pushState | PRD/spec; ARCHITECTURE wording → S1 sync |

## Data Flow

```
Menu ─Enter→ /projects ─#slug→ preselect
   ▲                  │ Esc: panel → close, focus item
   └── Esc: no panel ─┘ → <a href="/">.click() (swap); Back = native history
site.config.yaml → ABOUT, CONTACT · skills.yaml → SKILLS · projects/*.md → PROJECTS
resume.yaml → RESUME LIST+Detail → no-phone scans
```

## File Changes

| Action | Paths |
|--------|-------|
| Create | `src/pages/{about,resume,projects,skills,contact}.astro`; `src/components/game/{GameMenu,GameViewShell,ViewHeader,KeyHints,GameList,GameListItem,DetailPanel}.astro`; `src/scripts/{shell,view,screen}.ts`; `src/content/resume.yaml`; `scripts/verify-no-phone.mjs`; `tests/e2e/views.spec.ts`; `tests/unit/resume.test.ts` |
| Modify | `index.astro` → `GameMenu`; `BaseLayout.astro` (`data-route`, title/canonical, JsonLd, 404 excepted); `keys.ts` (+reducers, stagger ≤25ms); `schemas.ts`/`content.config.ts` (+resume); `global.css`/`person.ts` (VT keyframes +404, gate lock, <768px stack, title map); `tests/unit/{layout,seo,content,menu-keys}`; `tests/e2e/{links,budget,reduced-motion}` re-scoped only; `package.json` (`gate:privacy`) |
| Delete | `CompactNav`/`MenuOverlay`/`Section`/`ProjectCard`, `sections/*` (5), `scripts/menu.ts`, `tests/unit/{nav,pages,sections}.test.ts`, `tests/e2e/{menu,portfolio}.spec.ts` — ProjectCard deliberate; `menu`/`portfolio` specs → `views.spec.ts` |

## Interfaces / Contracts

```ts
const item = (shape: z.ZodTypeAny) => z.array(shape).min(1);
export const resumeSchema = z.object({
  education: item(z.object({ institution: z.string(), title: z.string(), period: z.string() })),
  experience: item(z.object({ company: z.string(), role: z.string(), period: z.string(), details: z.array(z.string()) })),
  projects: item(z.object({ name: z.string(), published: z.string().optional(), description: z.string() })),
  skills: item(z.string()),
  languages: item(z.object({ name: z.string(), proficiency: z.string() })),
}); // no phone/rank/level/metric keys; proficiency, never level
export type ListKeyResult = { kind: "move"; activeIndex: number } | { kind: "open" } | { kind: "none" };
export function reduceListKey(state: { activeIndex: number }, key: string, length: number): ListKeyResult;
export function escapeHierarchy(panelOpen: boolean): "close-panel" | "to-menu";
```

- `html[data-route]` `::view-transition-old(root)` ≤300ms; reduced 200ms opacity; 404 included.
- **No-phone gate L1** (CI, no value): no `phone|telephone|mobile|cell` keys; no `tel:`/9+ digit runs in HTML — heuristic, no exact-value claim. **L2** (`gate:privacy`, author/verifier): exact scan of `dist/`/content/tests; value only in ephemeral run env, never persisted/printed; missing ⇒ typed `unavailable`, never silent pass.
- UI per DESIGN.md: h1/main, 44px, focus-visible, touch-hidden hints, decorative gamepad.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | Reducers, escape hierarchy, overlay math, resume schema (no `level`), titles/canonical, four-boundary | Vitest: extend `menu-keys`/`seo`/`content`; `resume.test.ts` (persona-navigation, resume-content, seo-metadata, portfolio-content) |
| Component | Shell links; h1/main; 44px/focus; no phone patterns | `AstroContainer`; replaces `nav`/`pages`/`sections` (portfolio-page, portfolio-content) |
| E2E | Routes + 404, zero-JS, keys/Esc, Tab-in-shell, `#serviceflow`, mobile stack, SEO/sitemap, overlay ≤400/≤200ms incl. 404, fallback, JS<100KB, links | Playwright; `views.spec.ts` replaces `menu`/`portfolio`; re-scope only `links`/`budget`/`reduced-motion` |
| Mutation | Changed TS libs via `stryker run` (vitest-runner, `mutate: ["src/**/*.ts"]`) | Bounded campaign on changed targets (sdd-verify) |

## Threat Matrix

| Boundary | Applicability | Design response | Planned RED tests |
|---|---|---|---|
| Privacy gate invocation (`verify-no-phone.mjs`/`gate:privacy`) | **Applicable** — executable script, env-sourced value | Safe: fixed path, `fs` only, no shell/child process; env-only value, never argv/logs/output; missing ⇒ typed `unavailable` + nonzero exit; match ⇒ nonzero | RED: match ⇒ exit≠0; env absent ⇒ `unavailable` + exit≠0; value never in stdout/stderr/argv |
| Doc-like paths, git selection, commit/push state, PR commands | N/A — plain-text reads never executed; no git/PR | — | — |

## Migration / Rollout

Six chained slices, stacked to main, <400 lines:

| Slice | Scope | Rollback |
|-------|-------|----------|
| S1 | Spec deltas + docs sync (ARCHITECTURE Escape wording) | Revert docs |
| S2 | Shell, `data-game-ready`, `GameMenu`, five stubs | Revert; landing live |
| S3 | ABOUT/SKILLS/CONTACT + SEO | Delete views |
| S4 | PROJECTS LIST/detail + `#slug`; delete Featured/ProjectCard | Restore sections |
| S5 | `resume` + RESUME view + gate | Delete collection |
| S6 | Test migration + per-route budget/sitemap/links + build | Revert chain |

## Open Questions

None.
