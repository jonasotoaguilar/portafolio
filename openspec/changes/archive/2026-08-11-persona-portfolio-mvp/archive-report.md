# Archive Report: Persona Portfolio MVP

**Change**: `persona-portfolio-mvp`
**Archived on**: 2026-08-11
**Archived to**: `openspec/changes/archive/2026-08-11-persona-portfolio-mvp/`
**Artifact store**: Hybrid (OpenSpec filesystem + Engram)
**Archive phase**: `sdd-archive`; native status consumed — `nextRecommended: archive`, `blockedReasons: []`, proposal/specs/design/tasks/apply/verify `all_done`.

## Final State (authoritative, at close)

This report describes the change at CLOSE. Facts below are ranked per the Final-State Authority hierarchy; earlier snapshots are retained only as history.

- **Verdict**: PASS WITH WARNINGS (terminal `verify-report`, evidence revision `sha256:e6f561320b20f51c3bcb88b9c444024f1d7e728ae19d57c31e32d2387c000522`; no CRITICAL findings).
- **Product scope**: exactly four projects — ServiceFlow, EventCommerce, Fintual Sensor, WealthQuest. OpenCode Workflows was removed by Jona's explicit decision (Engram #5891); stale five-project language in earlier snapshots is superseded.
- **Completeness**: 18/18 requirements compliant, 40/40 scenarios compliant, 23/23 tasks checked complete (persisted `tasks.md`; 0 unchecked).
- **Final gates**:
  - Tests: 89 total — 64 Vitest (9 files) + 25 Playwright E2E (Chromium), exit 0 (`sha256:cb8309b0265e9b76501c01039dd4122d2708670757c1e4918f7a4f3e88708d8e`).
  - Coverage: 64/64; statements 96.12%, branches 86.27%, functions 100%, lines 98.27%; thresholds passed (`sha256:3293e65ab1c80935097d482323ad889dcd640308ba8c25178422cbd702f0dd62`).
  - `astro check`: 44 files; 0 errors, 0 warnings, 0 hints (`sha256:818a6601154ed282cd8d20425e77a3c93af04392dce74c4eb16f9202709188f5`).
  - `pnpm build`: 2 pages + sitemap generated; 8 unresolved-asset warning groups (`sha256:537fad15266c5fb73a648b7fa2074aea8c5a7a9f58f32805e774283c8142bd2a`).
  - Biome: 0 errors, 37 known Astro-template warnings (`sha256:a4141a8079f557ff056fcb3f4beb73e1bdf49e709507f48e7a3b20d5115fc47d`).
  - First-load JS: 7,121 bytes gzipped (3 index chunks), below the 100 KiB budget.
  - Mutation (bounded, `src/lib/content/projects.ts`): 33 total — 25 killed, 5 timeout, 3 survived, 0 no-coverage/errors; 90.91% (`sha256:6d0c8b8eb682d0e8aeb25cd5d70d29485f5630a10a35817d815aea9662f20f78`). Survivors are warning-level test-strength gaps (two actionable `http:` cases, one equivalent), not spec failures; no survivor proves a specification failure.
  - Trailmark preanalysis: 134 nodes, 60 functions, 103 call edges, 0 entrypoints (`sha256:2ba33947532be9c25f0046f2a684f52bb90096e388cb0fea9ff9bd0c626984b0`).
  - Necessist: 51 candidates; 12 removable statements/calls (assertion-strength warnings, not product failures) (`sha256:5e5c20032a81f0efe3a4ed9af10acdacde465cf24d6080b33feba2994bfa6aa1`).
  - Independent evidence: static readback `sha256:dcd6a92e6121179068cc8f1bfce714945841cd8ccced71f7161f557d6809bae2` (four ordered projects, fallback `none`, 8/8 safe off-site anchors, matching persist keys, SEO/sitemap, 7,121-byte gzipped JS); browser harness 6/6 `sha256:72b2fdee2efd09904196d89b4df107a49fac8855d51754ed22619334489bd701`; link availability HTTP 200 for four project URLs + GitHub profile `sha256:31cb6f0f6800dab24fa8721e57979a7ea6115f9dda184becff3ee4ae761410e9`.
- **TDD compliance**: 5/6 checks pass (active, RED confirmed, GREEN confirmed, triangulation, safety net); only apply-evidence table normalization to 23 rows remains a warning.

## History (not current state — retained for audit)

| Stage | Evidence revision | Outcome |
|---|---|---|
| Initial independent verification | `sha256:5eb63ea114fea4358b1a8e34dab11d211256b2ae1e7c6341dd5752b28a732a10` | FAIL: ST-1 client-side fallback; PN-3 safe attributes missing on some off-site links. Corrected in later apply. |
| First re-verification | `sha256:ef79231a92ea34912696c0ebc739f65412f6dc58ccbd39f11d55653e0df49b55` | FAIL: CHECK-1 TS2790 and missing PC-1 `external` field. Corrected in later apply. |
| Corrective apply evidence | `sha256:534a612e2727b55a9ef64330c795d48d7d346c694c351e820fdd3dfd0afbe559` | Type-safe optional cast; `external` schema/default/content restored; URL-origin logic remains authoritative for link safety. |
| Terminal verification | `sha256:e6f561320b20f51c3bcb88b9c444024f1d7e728ae19d57c31e32d2387c000522` | PASS WITH WARNINGS (final state). |

Earlier snapshots (Engram #5879 proposal, #5880 spec, #5882 design, #5886 tasks, #5888/#5902 apply progress) predate the four-project decision (#5891) or final apply; their five-project/`assertExactlyFive`/unchecked-box language is stale history and does not reflect the terminal state. The persisted `tasks.md` (all 23 checked) and terminal `verify-report` are the completion authorities.

## Warning Residuals (open, non-blocking)

1. Lighthouse performance/accessibility and LCP/CLS/INP unmeasured; no target score or Web Vital claimed.
2. Firefox/WebKit not configured (Playwright Chromium-only); cross-browser behavior unmeasured.
3. Mutation: two actionable `http:` survivors + one equivalent survivor; Necessist 12 removable statements/calls.
4. Coverage passes globally; browser entry scripts lack per-file V8 values; several changed files have branch coverage below 80%.
5. Build succeeds with 8 unresolved-asset warning groups (generated Tailwind source discovery).
6. Biome exits 0 with 37 known Astro-template unused import/variable warnings.
7. Strict-TDD apply evidence append-complete but not normalized to one formal row per each of 23 tasks.

Suggestions carried from verify: add an absolute `http://` off-site `isExternalLink` test; narrow Tailwind source discovery.

## Review State

Receipt-driven review (`reviewGate`) is structurally ABSENT: the kill switch is disabled clone-locally, so zero review code ran and no receipt exists. Archive proceeded under ordinary repository policy. Do not claim a review receipt or approval; the post-verify review offer was declined by proceeding.

## Delivery State (PENDING — future work)

- No commits, pushes, or PRs exist. Repository files remain untracked relative to the LICENSE-only initial commit (`9ee42f3`).
- Delivery must follow ordinary repository policy (branch + PR; never direct on main).
- The E2E work unit exceeded the 400-line review budget and must be split during future chained delivery. Cached delivery strategy: `auto-chain`; chain strategy: `stacked-to-main` (Engram #5887).
- Canonical verification evidence preimage (1,252 UTF-8 bytes) is retained unchanged in `verify-report.md` for orchestrator settlement.

## Archive Mechanics (byte-identity evidence)

- Six full capability specs (new domains; `openspec/specs/` was empty) copied mechanically into `openspec/specs/{living-background,persona-navigation,portfolio-content,portfolio-page,seo-metadata,site-transitions}/spec.md` via `cp` → `diff -r` (empty) → `mv`. Cross-tree `diff -r openspec/changes/persona-portfolio-mvp/specs openspec/specs` = no differences.
- Change folder moved to `openspec/changes/archive/2026-08-11-persona-portfolio-mvp/` via plain `mv` (files untracked; `git mv` not applicable), verified against a pre-move recursive snapshot with `diff -r` = no differences. This report is additive and excluded from the comparison.
- Active `openspec/changes/` no longer contains the change.
- `rules.archive` from `openspec/config.yaml` ("warn before merging destructive deltas") — no destructive deltas; all six domains were new.
- Requirement inventory after sync: portfolio-content 2, portfolio-page 4, persona-navigation 3, living-background 3, site-transitions 3, seo-metadata 3 = 18 requirements (40 scenarios).

## Engram Traceability

Engram observations read in full during this phase: #5879 (`sdd/persona-portfolio-mvp/proposal`), #5880 (`…/spec`), #5882 (`…/design`), #5886 (`…/tasks`), #5888/#5902 (`…/apply-progress`, PR 1 and PR 2A units), #5925 (`…/verify-report`), #5939 (remediation #2). This report persists as `sdd/persona-portfolio-mvp/archive-report` (type `architecture`, `capture_prompt: false`).
