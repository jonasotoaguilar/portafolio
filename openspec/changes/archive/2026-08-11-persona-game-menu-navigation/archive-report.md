# Archive Report: Persona Game-Menu Navigation

**Change**: persona-game-menu-navigation
**Archived**: 2026-08-11 → `openspec/changes/archive/2026-08-11-persona-game-menu-navigation/`
**Status**: SUCCESS — SDD cycle complete (proposal → spec → design → tasks → apply → verify → archive)
**Mode**: hybrid (OpenSpec filesystem + Engram)
**Archive type**: standard (no overrides, no intentional partial archive)

## Final State (authoritative at close)

Final product: Persona-3 game-menu shell at `/` with five real static views `/about`, `/resume`, `/projects`, `/skills`, `/contact`; legacy scrolling landing deleted (CompactNav, MenuOverlay, Section, sections/*, menu.ts, legacy nav/sections tests; Featured Work and ProjectCard removed in S4). 404 preserved.

| Gate | Result |
|---|---|
| Verify verdict | **PASS** (terminal verify-report; prior FAIL at `sha256:8c3d70…91fed` was remediated → second verification PASS at `sha256:47f6f3…dc918`) |
| Requirements | 17/17 compliant |
| Scenarios | 38/38 compliant |
| Tasks | 33/33 complete (persisted tasks artifact and Engram #5962 both show 33/33 checked) |
| Unit tests | 84 passed (final authoritative run) |
| E2E tests | 43/43 passed (final authoritative run; one transient flake passed on rerun) |
| Build-failure harness | 3/3 malformed fixtures fail the build; restored tree builds exit 0 |
| Coverage | statements 95.76% (113/118) / branches 92.42% (61/66) / functions 100% (24/24) / lines 98.13% (105/107), thresholds 80/70/80/80 |
| Astro check | 0 errors, 0 warnings |
| Astro build | 7 pages + sitemap |
| Biome | exit 0, 0 errors (58 known Astro-template warnings) |
| Mutation (Stryker 9.6.1) | 99.39% covered score; 165 mutants (144 killed, 20 timeout, 1 survived, 0 no-coverage); sole survivor triaged **equivalent** (`projects.ts:32` `siteOrigin === undefined` → `false`); no actionable survivor |
| `gate:privacy` (L2) | Typed **`unavailable`** (exit 2): `CV_PHONE` not set by the maintainer. Exact-value phone-absence is NOT claimed. L1 heuristic scan (CI, pattern-only) is green. |

Final-state numbers above are carried from the terminal `verify-report` (filesystem + Engram #5989) and the launch prompt, which outrank intermediate snapshots. Where intermediate snapshots reported different counts (e.g., `apply-progress` S6 recorded 83 unit / 33 e2e at slice time), the later remediation added evidence (+1 unit `isExternalLink` http case, +10 E2E) and the final authoritative run is 84/43 — the intermediate numbers are not current facts.

## Warning Residuals (carried, not blocking)

1. One transient E2E navigation-context flake in `reduced-motion.spec.ts` — passed on focused rerun, full rerun, and final authoritative run.
2. `gate:privacy` L2 typed unavailable (`CV_PHONE` absent) — no exact-value scan ran; no value fabricated or disclosed.
3. Biome 58 Astro-template warnings (0 errors).
4. Lighthouse / field-lab Core Web Vitals / cross-browser Playwright matrix unavailable (no harness in repo).
5. One explicit Playwright timer in `reduced-motion.spec.ts` (verification phase not authorized to edit tests).
6. ADR-0003 implementation action checkboxes stale; source and runtime evidence show decisions implemented.
7. One equivalent mutation survivor; no missing-behavior test exposed.

## Review / Receipt Status

`reviewGate` structurally absent — receipt review disabled for this clone (`clone-locally`). No review lifecycle command was run; **no receipt or approval is claimed**. Archive proceeded under ordinary repository policy.

## Delivery Status

No commits, pushes, or PRs exist; delivery is pending future work. Slices exceed the 400-line budget (S2 ~917, S3 ~850, S5 ~653, S6 ~1033) and MUST be split into chained PRs under the cached delivery strategy `auto-chain`, chain stacked-to-main, before delivery.

## History (remediation record)

First verification FAIL (7 critical runtime-evidence gaps) → authorized remediation (runtime tests + build-failure harness + canvas-persistence product bugfix in `living-background.ts` via `astro:after-swap` resume + Stryker invocation-shape fix + added `http://` unit case) → second verification PASS. All 7 prior critical findings independently reclosed. No dependencies added.

## Spec Sync (delta → canonical)

| Domain | Action | Details |
|--------|--------|---------|
| persona-navigation | Updated (2 MODIFIED) | `Game-menu shell navigation` (replaced `Hybrid navigation`), `Keyboard scope and focus restoration`; preserved `Touch targets, focus visibility, external links` (not in delta) |
| portfolio-page | Updated (3 MODIFIED + 1 ADDED) | `Shell and five view routes` (replaced `Single page with anchored sections`), `View heading hierarchy` (replaced `Hero content and heading hierarchy`), `First-load JavaScript budget`; ADDED `LIST/detail views`; preserved `404 page` (not in delta) |
| portfolio-content | Updated (2 MODIFIED) | `Projects collection rendered once` (replaced `Projects collection with featured flag`), `Skills and site config collections` (CONTACT links verified scenario added) |
| site-transitions | Updated (3 MODIFIED) | `View transitions with fallback` (now shell ↔ five views ↔ 404), `Canvas persistence`, `Motion contract` (≤400ms overlays, reduced ≤200ms) |
| seo-metadata | Updated (3 MODIFIED + 1 ADDED) | `Per-view page titles` (replaced `Page title`), `JSON-LD Person` (every route), `Sitemap generation` (six URLs, no 404); ADDED `Canonical URLs` |
| resume-content | Created (NEW full spec, 2 requirements) | Mechanical `cp` copy (byte-identity verified, empty `diff -r`) — no canonical spec existed |
| living-background | Unchanged | No delta in this change |

No REMOVED requirements existed in any delta — no destructive merge, no config `rules.archive` warning required. Preserved requirements (404 page, touch targets, living-background) were carried verbatim into the merged canonical specs.

## Mechanical Readback Evidence

- `resume-content` copy: `diff -r` source vs. temp destination → **empty (byte-identical)**; moved into `openspec/specs/resume-content/spec.md`.
- Archive move: pre-move recursive snapshot `cp -R` → `git mv` fell back to `mv` (openspec/ untracked) → source dir confirmed gone → `diff -r "$snapshot_root/source" "$archive_dir"` → **empty (byte-identical)**. Verbatim outputs appear in the phase result.
- Archived `tasks.md`: 33/33 `[x]`, zero unchecked.

## Engram Observation IDs (read for traceability)

- `sdd/persona-game-menu-navigation/proposal` → #5954
- `sdd/persona-game-menu-navigation/spec` → #5955
- `sdd/persona-game-menu-navigation/design` → #5956
- `sdd/persona-game-menu-navigation/tasks` → #5962 (rebuilt hybrid-parity artifact; mismatch incident #5963, rebuild #5968)
- `sdd/persona-game-menu-navigation/verify-report` → #5989
- Supporting: #5971 (remediation record), #5949 (CV decision), #5982 (session summary)

No `review/{transaction,ledger,receipt,gate-context}` topics read — `reviewGate` structurally absent.
