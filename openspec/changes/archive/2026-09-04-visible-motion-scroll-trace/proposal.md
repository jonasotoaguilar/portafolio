# Proposal: Visible Motion Scroll Trace

## Intent

Make existing route, panel, and desktop-card motion visibly legible. Capture a scroll frame trace before any paint change. Salience and performance are separate proofs.

## Scope

### In Scope

- Route fade 250ms; panel 24px/620ms/stagger 80ms/`power3.out`; token-wired GSAP; in-flight tests
- Fine+hover `ProjectCard` lift `-2px`; persisted ambient opacity re-entry 250ms
- Trace D1/D2/M1/M2/C on `/projects` and `/experience` (1280, 390) before blur/layer work; paint fix only if gate fails
- Blanket `.agents/` ignore; `git rm -r --cached .agents` (keep local files)
- Remove `AGENTS.md` `.agents` skill row; update stale `.agents` repo docs

### Out of Scope

Redesign, new deps/choreography, SEO/contact/copy, teaser lift, global smooth scroll, unmeasured claims, unproven blur/layer changes, deleting local `.agents` files, promising the skill on fresh clones.

## Capabilities

> Hygiene is Git/docs only — no new or modified capability or spec.

### New Capabilities

None

### Modified Capabilities

- `runtime-motion`: 250ms fade, 24px/620ms/80ms cascade, `-2px` fine+hover lift, 250ms persisted opacity re-entry. Keep reduced-motion, fine+hover gating, transient `will-change`, persist teardown, no site-wide smooth scroll.
- `runtime-performance`: scroll-trace only. Paint/blur/fixed-layer iff median FPS <50 or >2 long tasks on ghost/clip/fixed layers in 2/3 runs.

## Approach

Calibrate GSAP + `ClientRouter` to the balanced package. Motion may ship without paint change; paint may not without a failing gate. Apply: replace `.gitignore` whitelist (30–34) with `.agents/` ignore, `--cached` untrack, strip `.agents` from `AGENTS.md` and `docs/CODEBASE-GUIDE.md`.

## Affected Areas

- `src/layouts/BaseLayout.astro`, `src/scripts/motion.ts`, `src/styles/global.css`, `src/components/ProjectCard.astro`, `src/components/WaterField.astro`, `e2e/interaction.spec.ts` — Modified — balanced motion
- `openspec/specs/runtime-motion`, `runtime-performance` — Modified — deltas
- `.gitignore` — Modified — blanket `.agents/` ignore; drop whitelist
- Git index `.agents/` — Removed — `git rm -r --cached .agents`; files stay
- `AGENTS.md`, `docs/CODEBASE-GUIDE.md` — Modified — remove `.agents` skill row/claims

## Risks

- Reduced-motion translates (Med): instant opacity; teardown e2e
- Stale persist / FPS regression (Med): opacity-only; compare median; revert if worse
- Flaky screenshots (High): in-flight + token seams
- Unproven paint fix (Med): no PR until `traces/summary.md`

## Rollback Plan

Revert product files. Keep archived invariants. Drop traces and unproven paint. Hygiene: restore `.gitignore` whitelist, tracked `.agents/` from git, `AGENTS.md`, and `docs/CODEBASE-GUIDE.md`.

## Dependencies

Preproposal r1; inherit-existing/balanced. Reused 38-source research. Playwright + chrome-devtools. `.agents/` never versioned.

## Success Criteria

- [ ] 250ms fade mid-opacity in (0,1); panels 24px/620ms/80ms/`power3.out`
- [ ] Reduced-motion: instant opacity, no transform; transient `will-change`; native scroll
- [ ] Fine+hover lift `-2px`; coarse none; ambient opacity re-entry 250ms, no drift
- [ ] `traces/summary.md` `/projects` + `/experience` desktop+mobile before blur/layer work
- [ ] Paint fix only if gate fails; no unmeasured/SEO/contact/copy change
- [ ] `.agents/` ignored and untracked; local files remain; `AGENTS.md` and repo docs have no `.agents` skill claims
