# Apply Progress — Reference-Driven View Redesign (Phase 1 / Unit A + Phase 2 / Units B1+B2+B3 + Phase 3 / Unit C1)

**Change**: `reference-driven-view-redesign` | **Unit A**: Keyboard cursor coherence (#6186) | **Unit B (original)**: Asset provenance + pipeline — FAILED/HISTORICAL, split by maintainer | **Unit B1**: Provenance register + fs-only gate — LANDING | **Unit B2**: Optimizer + derivatives — LANDING (2026-08-13) | **Unit B3**: One-way rename `assets/icon`→`assets/sprites` — LANDING (2026-08-13) | **Unit C1**: Pure ocean modules + unit tests — LANDING (2026-08-13)
**Batch A**: Phase 1 tasks 1.1–1.5 | **Batch B**: Phase 2 tasks 2.1–2.6 | **Date**: 2026-08-13 | **Author**: sdd-apply
**Store**: OpenSpec (+ Engram mirror `sdd/reference-driven-view-redesign/apply-progress`)
**Mode**: Strict TDD (openspec `rules.apply.tdd: true`, Playwright E2E + Vitest unit)
**Status**: Unit A complete. Oversized Unit B returned `blocked: workload-decision-required` (~640 authored lines > 400 budget) → **maintainer split authorized (2026-08-13)**: B1 landed (provenance register + fs-only gate, 385 authored changed lines ≤ 400 after maintainer budget trim); B2 landed 2026-08-13 (optimizer + derivatives); B3 landed 2026-08-13 (one-way sprite rename correction, 153 changed text lines + 14 binary renames); C1 landed 2026-08-13 (split remediation slice 1 of 2 — pure ocean primitives, 292 authored lines ≤ 400; C2 still pending). Cumulative state below.

## Cumulative State

| Unit | Status | Evidence |
|---|---|---|
| A (1.1–1.5) | ✅ complete | Section "Unit A" below (retained) |
| B (2.1–2.6, original oversized) | ❌ failed/historical | ~640 authored lines > 400 budget → `blocked: workload-decision-required`; maintainer split; see "Unit B (original) — HISTORICAL" |
| B1 (2.1, 2.3, 2.4, 2.5a, 2.6a) | ✅ landing (this remediation) | Section "Unit B1" below: 4/4 focused tests, gate OK, 385-line boundary (trimmed) |
| B2 (2.2, 2.5b, 2.6b, 2.7) | ✅ landing (2026-08-13) | See "Unit B2 — LANDING" section below: 5/5 focused, 60 derivatives, determinism 61/61, gate OK |
| B3 (2.8–2.12) | ✅ landing (2026-08-13) | See "Unit B3 — LANDING" section below: 13/13 focused, gate OK 25/25, determinism 61/61, `assets/icon` absent (index + worktree), 153 changed text lines + 14 binary renames |
| C1 (3.1–3.3) | ✅ landing (2026-08-13) | See "Unit C1 — LANDING" section below: 15/15 focused canvas unit, 117/117 full unit, biome clean, astro check 0, 292 authored lines ≤ 400, `particles.ts` unchanged |

---

# Unit B (original, 2.1–2.6) — HISTORICAL / FAILED: oversized, split by maintainer

**Status**: ❌ FAILED as a single work unit — authored text lines ≈ 640 exceeded the 400-line budget; returned `blocked: workload-decision-required`. Maintainer decision (2026-08-13): split into **B1 (landing now)** and **B2 (pending)**. This section is the historical record of what was implemented; the split preserved ALL of it across B1 + B2 (no completed implementation deleted; working tree kept safe).

## Summary (historical record)

Unit B implements the provenance register, the fs-only validation gate, and the bounded derivative pipeline:

- `assets/PROVENANCE.yaml` (schema v1): 25 entries — one per production source under `assets/persona` (11) and `assets/icon` (14). Owner-created metadata per entry (creator `Jonathan Soto`, `commercial-use: permitted`, `modification: permitted`, `license: owner-created (all rights reserved)`, role classification). 12 selected (`persona_1/2/6/8/9/11` principals + `asset_12_clock, asset_09_badge_dev, asset_10_computer, asset_14_fire, asset_04_mariposa_neon, asset_05_card` icon accents per the locked design matrix) carry the source→derivative mapping (`widths`: portraits `480,768,960`, landscape `480,768,1280`, icons `96,160`; formats fixed by design: AVIF primary + WebP fallback). 13 deferred (`persona_3/4/5/7/10` + 8 icons) marked `selected: false` (not-shipped).
- `scripts/verify-provenance.mjs` — the gate: fs-only (no child_process), deterministic, exit 1 on violation. Checks: schema-version; per-entry required fields by origin-class; owner fields exact; license vocabulary (owner-created | CC0 | MIT — unknown rejected); usage-role vocabulary; derivative widths locked matrix; register⇄disk coverage both directions (unregistered asset fails, missing file fails); dist scan rejects `mockup`/`asset_sheet`/`example` paths (file or dir segment), original bytes (sha256 match), and audio (`.mp3/.ogg/.wav/.m4a/.flac` — soundtrack rejection). Exports `loadRegister/validateRegister/scanDist/assetPath/requireFromStore` for tests and the optimizer.
- `scripts/optimize-assets.mjs` — bounded derivative generator: AVIF (q55) + WebP (q80) at the register's locked widths via transitive sharp (pnpm-store resolution, NO new dependency), `withoutEnlargement` (never upscales), alpha preserved. Outputs `<stem>-<width>.<format>` into gitignored `dist-assets/`; deterministic (regenerable byte-for-byte).
- Wiring: `gate:provenance` npm script; `.github/workflows/ci.yml` runs it after Build; `vitest.config.ts` excludes `scripts/**` from coverage (CLI entrypoints are exercised by the CI gate step, not unit tests); `.gitignore` adds `dist-assets/`.
- Originals staged byte-identical (sha256 captured before/after pipeline, build, and staging — all 25 unchanged). Deleted `docs/assets/example/*.jpg` NOT re-added. `docs/assets/mockup` + `docs/assets/asset_sheet` staged as reference-only (never in dist — gate-enforced).

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 2.1 | `tests/unit/provenance-gate.test.ts` | Unit | ✅ 98/98 (pre-existing suite) | ✅ Module-not-found (scripts absent) | ✅ 7/7 (consolidated: coverage, owner fields, licenses, widths matrix, dist exclusion) | ✅ 10 malformed-entry cases + external CC0/MIT/proprietary + missing source-url | ✅ Compacted 685→~640 lines (two passes); tests stayed green through every step |
| 2.2 | `tests/unit/provenance-gate.test.ts` | Unit | ✅ (above) | ✅ (same file, pipeline describe) | ✅ 2/2 (byte-identity + regenerability + alpha + dimensions) | ✅ second-run byte-equality + deferred-produces-nothing | ✅ (above) |
| 2.3 | `assets/PROVENANCE.yaml` | — | — | — | ✅ 25 entries; gate-validated | — | ✅ formats field dropped (fixed by design; gate validates only when declared) |
| 2.4 | `scripts/verify-provenance.mjs` + `package.json` | — | — | — | ✅ gate OK on real dist | — | ✅ store-dep merged into gate (one file fewer) |
| 2.5 | `.github/workflows/ci.yml` + `git add` | — | — | — | ✅ staged; byte-identity re-verified | — | — |
| 2.6 | Verify chain | — | — | — | ✅ See Work Unit Evidence | — | — |

**RED proof**: first focused run failed at import (`Cannot find module '../../scripts/verify-provenance.mjs'`) — production code did not exist; no test executed. Subsequent RED→GREEN iterations were fixture/parse fixes (YAML flow quoting, WIDTHS_MATRIX `.png` key lookup, test timeout for sharp native init).

## Work Unit Evidence

| Evidence | Required value |
|---|---|
| Focused test command and exact result | `pnpm vitest run tests/unit/provenance-gate.test.ts` → **7 passed (0 failed)**; RED baseline: module-not-found (scripts absent) |
| Runtime harness command/scenario and exact result | `pnpm run build` → 7 pages built; `pnpm run gate:provenance` → `OK (25 entries, 25 originals)`; `node scripts/optimize-assets.mjs` → **60 derivatives, 3,509,605 bytes**, all `alpha=true`; `node /tmp/opencode/verify-identity.mjs` → all 25 originals byte-identical; full `pnpm vitest run tests/unit` → **105 passed**; `pnpm vitest run --coverage` → 96.52% stmts / 91.34% branch / 100% funcs / 98.47% lines (thresholds 80/70/80/80 met); `pnpm exec astro check` → **0 errors, 0 warnings** (4 pre-existing hints); dist scan post-build: no mockup/asset_sheet/example/audio/original bytes |
| Rollback boundary | Remove `assets/PROVENANCE.yaml`, `scripts/verify-provenance.mjs`, `scripts/optimize-assets.mjs`, `tests/unit/provenance-gate.test.ts`, the `gate:provenance` npm script line, the ci.yml "Provenance gate" step, the `dist-assets/` gitignore entry, and the vitest.config coverage exclude — then `git restore --staged assets/ docs/assets/mockup/ docs/assets/asset_sheet/` (originals/mockups revert to untracked user additions). No other files touched |

## Derivative Payload (bounded set, dist-assets/)

- Principals (AVIF primary / WebP fallback): portraits `persona_1, persona_2` → 480/768/960; landscape `persona_6, persona_8, persona_9, persona_11` → 480/768/1280. Largest single derivative: `persona_11-1280.avif` 137,779 B; per-route budget ≈ 137 KB + ~8 KB icon < ~150 KB target ✓.
- Icons (AVIF/WebP at 96/160): `asset_12_clock, asset_09_badge_dev, asset_10_computer, asset_14_fire, asset_04_mariposa_neon, asset_05_card`. Range 2.4–14.2 KB.
- Total: 60 files / 3,509,605 bytes; every derivative `alpha=true` (all 25 sources are RGBA, verified via sharp metadata); no source mutated; outputs byte-deterministic across runs (regenerable).

## Files Changed (Unit B)

| File | Action | Lines | What Was Done |
|------|--------|-------|---------------|
| `assets/PROVENANCE.yaml` | Create | 35 | Provenance register, schema v1, 25 flow-style entries |
| `scripts/verify-provenance.mjs` | Create | 201 | fs-only gate: register validation + locked widths matrix + dist scan (forbidden paths / original bytes / audio) + store-dep resolution for js-yaml |
| `scripts/optimize-assets.mjs` | Create | 68 | Bounded AVIF+WebP derivative generator via transitive sharp |
| `tests/unit/provenance-gate.test.ts` | Create | 325 | 7 tests: register validation (10 malformed cases), external entries, dist exclusion, pipeline integrity (byte-identity, matrix, alpha, regenerability, deferred-nothing) |
| `package.json` | Modify | +2 | `gate:provenance` script |
| `.github/workflows/ci.yml` | Modify | +4 | "Provenance gate" step after Build |
| `vitest.config.ts` | Modify | +3 | coverage exclude `scripts/**` |
| `.gitignore` | Modify | +2 | `dist-assets/` |
| `assets/persona/*` (11 PNGs), `assets/icon/*` (14 PNGs) | Stage | binary | Byte-identical originals (25 files, ~44.5 MB) |
| `docs/assets/mockup/*` (6 PNGs), `docs/assets/asset_sheet/*` (4 PNGs) | Stage | binary | Reference-only (~21.6 MB), never in dist |

## Deviations from Design

- **Interpretation (reported, not a deviation)**: design's production derivative path is astro:assets at build (`dist/_astro`, wired in Unit D). Unit B's optimizer prepares the bounded locked-matrix set into the gitignored `dist-assets/` staging dir as pipeline proof + payload evidence; derivatives are regenerable and NOT committed. Formats (AVIF primary + WebP fallback) are fixed by design, so the register records widths only (the source→derivative mapping) with formats documented in the header.
- **Interpretation**: the orchestrator required the gate to reject soundtracks in dist; implemented as a hard audio-extension rejection (no audio exists in the repo today; `public/audio/README.txt` is the only BYO placeholder).
- No spec/task wording conflicts found. Deleted `docs/assets/example/*.jpg` not re-added (design: active reference set is the mockups).

## Issues Found

- **Biome `noExplicitAny` warnings (12) in the new test file** — warnings only (exit 0), from typing untyped `.mjs` module data; the repo's `pnpm run lint` fails on 20+ PRE-EXISTING errors in `src/` (JsonLd.astro, Watermark.astro, game/*, BaseLayout, FigureLayer — all untouched at HEAD commit 26710f2; `git diff` empty). Not fixed: out of Unit B scope and those files are slated for redesign/deletion in Units C–D.
- Coverage run ~40s slower due to sharp native init + AVIF encodes in the pipeline fixture tests (60s timeout per test; acceptable).

## Workload / PR Boundary

- Mode: **chained PR slice** (delivery_strategy `auto-chain`, chain_strategy `feature-branch-chain`); PR #2 for Unit B.
- **Budget conflict — `blocked: workload-decision-required`**: authored text lines ≈ **640** (register 35 + gate 201 + optimizer 68 + tests 325 + configs ~11) vs the **400-line** unit budget, after two honest compression passes (685 → ~640; biome 80-col formatting resists further compaction; every required assertion/outcome retained). Binary payloads (~66 MB staged) don't count toward the authored budget but are reported above. Options for the parent: (1) accept `size:exception` for Unit B (dense, mechanical code — gate + register + tests are review-friendly), (2) re-budget Unit B to ~700 lines, or (3) split Unit B into B1 (register+gate+tests+CI ≈ 560) and B2 (optimizer+pipeline ≈ 80) — note B1 alone still exceeds 400. Implementation is complete, verified, and staged; any of these decisions needs zero rework.
- Boundary: starts with RED `provenance-gate.test.ts`; ends with green focused unit + full regression + build + gate + coverage + astro check. No commits made, no PR opened (branch `feat/reference-driven-view-redesign` left as-is per contract).

## Skill Resolution

`paths-injected` — 8 skills: sdd-apply, sdd-apply/strict-tdd.md (file), image-generation, astro-framework, npm-secure-config, ci-cd-and-automation, chained-pr, work-unit-commits.

---

# Unit B1 — Provenance Register + fs-only Validation Gate (LANDING, split remediation 2026-08-13)

## Summary

Maintainer-authorized split remediation of oversized Unit B. B1 lands the provenance contract as an independently reviewable slice: `assets/PROVENANCE.yaml` as source register (25 owner-created entries: creator Jonathan Soto, commercial/modification permitted, role classification; 12 selected with declared expected derivative widths, 13 deferred not-shipped), `scripts/verify-provenance.mjs` as the fs-only gate (schema-version; required fields by origin; owner metadata exact; license vocabulary owner-created|CC0|MIT; usage-role vocabulary; register⇄disk coverage both directions; dist scan rejects mockup/asset_sheet/example paths, original bytes, audio), `gate:provenance` npm script, ci.yml gate step, vitest coverage exclude. **The derivative width-mapping validation (WIDTHS_MATRIX) moved to B2** — B1's register declares the expected contract; B2 enforces it (optimizer + re-added matrix validation). No source assets or derivative binaries are in B1's review scope; their bytes were NOT modified (25 originals + reference material re-verified present, unstaged).

## Files Changed (B1 boundary — exact numstat vs HEAD)

| File | Action | Numstat | What Was Done |
|------|--------|---------|---------------|
| `assets/PROVENANCE.yaml` | Create | +35 | Source register, schema v1, 25 entries (owner metadata, roles, selection, declared widths) |
| `scripts/verify-provenance.mjs` | Create | +170 | fs-only gate: register validation + dist scan (forbidden paths / original bytes / audio) + store-dep resolution for js-yaml; width-matrix validation deferred to B2; compact formatting (budget trim −6) |
| `tests/unit/provenance-gate.test.ts` | Create | +171 | 4 focused fs-only tests: real register (25 entries, owner fields, roles/selection matrix), malformed entries (8 cases: unregistered, missing-on-disk, missing modification, wrong creator, commercial/modification restricted, unknown license, schema-version), external CC0/MIT + proprietary/missing-source-url failures, dist scan (mockup/asset_sheet/example + original bytes + audio rejected; clean dist + missing dir pass); dedup fixture loops (budget trim −6) |
| `package.json` | Modify | +2/−1 | `gate:provenance` script |
| `.github/workflows/ci.yml` | Modify | +3 | "Provenance gate" step after Build |
| `vitest.config.ts` | Modify | +3 | coverage exclude `scripts/**` |
| **Total** | | **+384/−1 = 385 changed lines ≤ 400** | B1 boundary (trimmed from 397) |

Unrelated/pre-existing staged work is NOT included above (see Staging State): Unit A files (`src/scripts/view.ts`, `shell.ts`, `tests/e2e/keyboard.spec.ts`), docs (`ARCHITECTURE.md`, `DESIGN.md`, `docs/adr/0004`), B2 files (`scripts/optimize-assets.mjs`, `tests/unit/provenance-pipeline.test.ts`), `.gitignore` (dist-assets), and all binary assets (persona/icon originals, mockups, asset sheets, example deletions) remain unstaged/untracked in the working tree, bytes untouched.

## Unit B1 — Budget Trim (maintainer-authorized remediation, 2026-08-13)

Structural budget correction only: the native line accounting (401) exceeded the 400 cap, so the maintainer authorized trimming the B1 candidate below 400 (target ≤395). No behavior, scope, evidence quality, owner metadata, gate semantics, or B2 bytes changed. No new RED was fabricated — this is a deduplication/compaction pass over already-green code.

**Native bindings**:
- Attempt token: `sha256:1dd61f12dcd386db0ccfe33664db8985d1208cc1fdbab538dd4173108357e3e7` (native attempt; no acquire/settle — parent settles)
- Failed budget evidence (historical): `sha256:529ac5d6b92d03b76b09416c9ab8994b7e0ea58f9dac6bd8ca9d2df310d070cc`
- New candidate evidence revision: `sha256:8a28eef8e27aea83390143972e8cc661cb88058591e3fe5a92481ef65e7410ac`
- `remediates` NOT emitted (status produced no settle obligation; nothing invented)

```json
{
  "gentle-ai.remediation-result/v1": {
    "lineage_id": "reference-driven-view-redesign",
    "generation": 1,
    "fix_batch": "b1-budget-trim",
    "failed_evidence_revision": "sha256:529ac5d6b92d03b76b09416c9ab8994b7e0ea58f9dac6bd8ca9d2df310d070cc",
    "attempt_token": "sha256:1dd61f12dcd386db0ccfe33664db8985d1208cc1fdbab538dd4173108357e3e7",
    "new_evidence_revision": "sha256:8a28eef8e27aea83390143972e8cc661cb88058591e3fe5a92481ef65e7410ac",
    "outcome": "structural-budget-correction",
    "scope": "Unit B1 6-file staged candidate only; B2 files byte-untouched"
  },
  "gentle-ai.remediation-evidence/v1": {
    "candidate_line_count": 385,
    "native_estimated_line_count": 389,
    "lines_removed": 12,
    "focus_tests": "4/4 passed (unchanged assertions)",
    "gate_cli": "provenance gate: OK (25 entries, 25 originals)",
    "full_unit": "104/104 (12 files)",
    "config_validation": "biome check . clean (no fixes applied; pre-existing any-warnings only)",
    "astro_check": "0 errors, 0 warnings (4 pre-existing hints)",
    "rollback": "git restore --staged scripts/verify-provenance.mjs tests/unit/provenance-gate.test.ts restores the pre-trim staged bytes; no other files affected"
  }
}
```

**What was trimmed (12 lines, all ≤80-col formatting-stable, verified `biome check`-clean)**:
- `scripts/verify-provenance.mjs` (−6): header comment 3→2 lines; `assetPath` join collapsed via local dir const; schema-version failure message shortened (still names field + actual version; expected constant exported 3 lines below; test fragment assertion `schema-version` unchanged); `origin-class` violation check merged to single-line if.
- `tests/unit/provenance-gate.test.ts` (−6): header comment 3→2 lines; `missing source-url` case reuses the fixture's `undefined`-field filtering instead of `delete` (identical YAML output); dist-scan test dedups the forbidden-path list into one const reused by the write loop and the merged positive-assertion loop (all 5 rejection assertions preserved).

**Before/after behavior evidence (no fabricated RED — same assertions, same gate)**:

| Evidence | Before trim | After trim |
|---|---|---|
| Focused `provenance-gate.test.ts` | 4 passed | 4 passed (identical assertions) |
| `pnpm run gate:provenance` | `OK (25 entries, 25 originals)`, exit 0 | `OK (25 entries, 25 originals)`, exit 0 |
| Full `test:unit` | 104 passed (12 files) | 104 passed (12 files) |
| `astro check` | 0 errors / 0 warnings (4 hints) | 0 errors / 0 warnings (4 hints) |
| `biome check .` | clean | clean |
| Numstat (B1 6 files) | +396/−1 = 397 | +384/−1 = 385 |
| Native-style accounting | 401 | 389 (est.) |



## TDD Cycle Evidence (honest remediation — implementation existed)

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 2.1 | `tests/unit/provenance-gate.test.ts` | Unit | ✅ 105/105 full-suite baseline (pre-split state, prior batch) | ✅ Historical: module-not-found (scripts absent). Remediation RED: real gate code vs incomplete register fixture (missing `modification` + unregistered `fan_asset.png`) → gate names each violation, exit 1 | ✅ 4/4 focused tests pass | ✅ 8 malformed cases + 2 external-fail cases + 5 dist rejections + clean-dist/missing-dir passes | ✅ Restructured for split: fixture YAML via flow sequence + JSON.stringify quoting, compact case harness — tests green after every step |
| 2.3 | `assets/PROVENANCE.yaml` | — | — | — | ✅ gate-validated | — | — |
| 2.4 | `scripts/verify-provenance.mjs` + `package.json` | — | — | — | ✅ gate OK on real dist (25 entries, 25 originals) | — | ✅ width-matrix block moved to B2; store-dep/assetPath exports kept for the optimizer |
| 2.5a | `.github/workflows/ci.yml` + `vitest.config.ts` | — | — | — | ✅ ci.yml parses (14 steps, gate step present); vitest loads | — | — |
| 2.6a | Verify chain | — | — | — | ✅ focused 4/4 + full unit 104/104 + gate OK + config validation + astro check 0 errors | — | — |

**No fabricated product RED**: implementation pre-existed; RED is (a) the historical module-not-found first-run record and (b) a real failure of the real gate against an incomplete B1 contract fixture (`persona_1.png: missing modification`, `modification must be permitted`, `fan_asset.png: unregistered production asset`) — proving the boundary enforces the contract.

## Work Unit Evidence

| Evidence | Required value |
|---|---|
| Focused test command and exact result | `pnpm vitest run tests/unit/provenance-gate.test.ts` → **4 passed (0 failed)** |
| Runtime harness command/scenario and exact result | `pnpm run gate:provenance` → `provenance gate: OK (25 entries, 25 originals)`; ci.yml YAML-valid with "Provenance gate" step; package.json valid with `gate:provenance`; `pnpm exec astro check` → **0 errors, 0 warnings** (4 pre-existing hints); full `pnpm vitest run tests/unit` → **104 passed (12 files)**; preserved B2 tests `provenance-pipeline.test.ts` → **2 passed** (proof the split kept optimizer evidence green) |
| Rollback boundary | Remove `assets/PROVENANCE.yaml`, `scripts/verify-provenance.mjs`, `tests/unit/provenance-gate.test.ts`, the `gate:provenance` npm script line, the ci.yml "Provenance gate" step, the vitest.config coverage exclude — nothing else touched; B2 files and binary assets untouched in the working tree |

## Staging State

- **Staged (B1 only)**: `assets/PROVENANCE.yaml`, `scripts/verify-provenance.mjs`, `tests/unit/provenance-gate.test.ts`, `package.json`, `.github/workflows/ci.yml`, `vitest.config.ts`
- **Unstaged/untracked, preserved (B2 + unrelated)**: `scripts/optimize-assets.mjs`, `tests/unit/provenance-pipeline.test.ts`, `assets/persona/*`, `assets/icon/*`, `docs/assets/mockup/*`, `docs/assets/asset_sheet/*`, `docs/assets/example` deletions, `.gitignore` (dist-assets), Unit A files (`src/scripts/view.ts`, `src/scripts/shell.ts`, `tests/e2e/keyboard.spec.ts`), docs (`ARCHITECTURE.md`, `DESIGN.md`, `docs/adr/0004`, untracked `docs/adr/0005`), `openspec/changes/reference-driven-view-redesign/`. **No user files or Unit A work discarded; binary bytes untouched.**
- Prior staging mixed scopes; unstaged only what B2/unrelated owns (`git restore --staged` — working tree bytes preserved).

# Unit B2 — Optimizer + Responsive Derivatives (HISTORICAL — pre-split preserved state; landed 2026-08-13, see LANDING section below)

Not implemented in this remediation; preserved from the original oversized Unit B so no evidence is lost. Tasks: 2.2 (pipeline RED tests), 2.5b (stage source assets + `.gitignore` dist-assets), 2.7 (optimizer GREEN + re-add derivative-contract width-matrix validation), 2.6b (verify: 60 derivatives, per-route payload ≤ ~150KB, alpha + dimensions, regenerability, dist scan).

| File | State | Lines | What It Is |
|------|-------|-------|------------|
| `scripts/optimize-assets.mjs` | preserved, untracked | 68 | Bounded AVIF(q55)+WebP(q80) derivative generator at the register's locked widths, `withoutEnlargement`, alpha preserved, deterministic output to gitignored `dist-assets/`; imports `assetPath`/`loadRegister`/`requireFromStore` from the B1 gate |
| `tests/unit/provenance-pipeline.test.ts` | preserved, untracked | 150 | B2 test file (self-contained width matrix): originals byte-identical after pipeline; derivatives match matrix with alpha; regenerable; deferred entries generate nothing — **currently 2/2 passing** |
| `assets/persona/*` + `assets/icon/*` | preserved, untracked | binary | 25 source originals (byte-identical; B2 stages them) |
| `.gitignore` `dist-assets/` | preserved, unstaged | +2 | derivative staging dir |

---

# Unit A — Keyboard Cursor Coherence (previous batch, retained)

## Summary

Fixed the four #6186 keyboard-cursor defects with a roving-tabindex single cursor on list views and Tab-focus synchronization in the shell menu:

- `view.ts`: arrows now move DOM focus and the active item together (previously only `data-active` moved); Enter/ArrowRight opens the focused item's panel; entering a view focuses the active list item; the active item is the only tab stop (`tabindex 0`, others `-1`); `closePanel` restores focus to the list item.
- `shell.ts`: a per-item `focus` listener makes the focused item the active item (`activeIndex=i; syncActive(i)`), so Tab/Shift+Tab synchronizes `data-active` + `aria-current` and the existing `document.activeElement === active` Enter guard now activates the Tab-focused item.
- `keys.ts` untouched; `astro:before-swap` teardown bindings preserved and verified at runtime (second view entry after a swap moves the cursor exactly one step per key).

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 1.1 | `tests/e2e/keyboard.spec.ts` | E2E | ✅ 13/13 (keyboard) + 28/28 (views) + 11/11 (menu-keys unit) | ✅ 9 failing (14 passing) | — | ✅ 10 scenarios (spec scenarios + journey + teardown leak) | — |
| 1.2 | `tests/e2e/keyboard.spec.ts` | E2E | ✅ (above) | ✅ Written (entry focus, arrows, roving, open, Escape chain all RED) | ✅ 23/23 keyboard, 28/28 views | ✅ 4 list routes (projects/resume/skills panels + about/contact inert) | ✅ `select`/`focusItem`/`open` split, no `moveFocus` flag |
| 1.3 | `tests/e2e/keyboard.spec.ts` | E2E | ✅ (above) | ✅ Written (Tab→ArrowDown, Tab→Enter, Tab/Shift+Tab wrap sync RED) | ✅ 23/23 keyboard | ✅ 3 shell tests (coherence, Enter activation, wrap) | ➖ None needed (9-line addition) |
| 1.4 | `tests/e2e/keyboard.spec.ts` | E2E | ✅ (above) | — | — | — | ✅ `keys.ts` diff empty; `astro:before-swap` bindings intact; journey test re-enters the view after swap and asserts single-step cursor (leaked handler would double-move) |
| 1.5 | `tests/e2e/keyboard.spec.ts` + full suite | E2E | — | — | — | — | ✅ `pnpm test:e2e keyboard.spec.ts` 23/23; full `pnpm playwright test` 82/82; `pnpm vitest run tests/unit` 98/98; `astro check` 0 errors; Biome clean |

**RED proof (pre-fix run, current code):** 9 failed / 14 passed — exactly the nine new #6186 tests:
Tab-then-ArrowDown coherence, Tab-then-Enter activation, Tab/Shift+Tab wrap sync, view entry focus, arrows move focus, Enter/ArrowRight open chain, roving tabindex, Escape chain entry-focus, keyboard-only journey. All failures were `toBeFocused`/`toHaveAttribute` with `unexpected value "null"` (attribute absent) — genuine RED, no trivial passes.

## Work Unit Evidence

| Evidence | Required value |
|---|---|
| Focused test command and exact result | `pnpm playwright test tests/e2e/keyboard.spec.ts` → **23 passed (0 failed)**; RED baseline: 9 failed / 14 passed |
| Runtime harness command/scenario and exact result | Reused user-owned dev server `localhost:4321` (`astro dev`); real browser keyboard: Tab/Shift+Tab/ArrowDown/ArrowUp/Enter/ArrowRight/Escape on `/`, `/projects`, `/resume`, `/skills`, `/contact`; full suite `pnpm playwright test` → **82 passed (0 failed)** |
| Rollback boundary | Revert `src/scripts/view.ts`, `src/scripts/shell.ts`, and the "keyboard cursor coherence (#6186)" describe block in `tests/e2e/keyboard.spec.ts` — no other files touched |

## Files Changed

| File | Action | Lines | What Was Done |
|------|--------|-------|---------------|
| `tests/e2e/keyboard.spec.ts` | Modified | +250 | New `keyboard cursor coherence (#6186)` describe: 10 tests — Tab→ArrowDown coherence, Tab→Enter activation, Tab/Shift+Tab wrap sync, view entry focus (incl. hash preselect), arrows move focus+active, Enter/ArrowRight open focused panel, roving tabindex single tab stop, Escape hierarchy restore, inactive screens inert, keyboard-only shell→view→shell journey with double-visit teardown-leak check |
| `src/scripts/view.ts` | Modified | +13/−15 | Roving tabindex (`tabIndex` 0/−1 in `select`); arrows `select`+`focusItem` (focus==active); `open()` for Enter/ArrowRight/click (select + focus panel); `setupView` focuses active entry after preselect; `closePanel` restores item focus; `preselectFromHash` uses `select` |
| `src/scripts/shell.ts` | Modified | +9 | Per-item `focus` listener → `state.activeIndex = index; syncActive(index)` in `setupShell` |

`src/lib/menu/keys.ts` — **untouched** (verified: `git diff` empty).

## Deviations from Design

None — implementation matches design.md "Keyboard State Machine (fixes #6186)" and the persona-navigation delta spec.

**Interpretation note (reported, not a deviation):** the spec explicitly requires "While the shell menu is active, Tab focus MUST be constrained within the menu" (scenario "Focus constrained while open"), and the shell at `/` is a full-page menu whose only focusables are its five items. Implemented as spec requires (existing `trapTab` preserved, now cursor-synced). This is the APG menu-widget convention, not a WCAG 2.1.2 trap: the constraint applies only while the shell menu is active on `/`, Escape/Enter/arrows still navigate away, and views keep normal document flow with a single roving tab stop. No spec/task wording conflict found.

## Issues Found

- One pre-existing test (`keyboard.spec.ts:35`) flaked once during the first RED run under full parallel load (passed in isolation and in every subsequent run, including the final full suite). Likely CPU contention on the shared dev server; not caused by the change (pre-existing test, no source edits at that point).
- `astro check` reports 4 pre-existing hints (unchanged by this batch).

## Remaining Tasks

- [x] 2.1/2.3/2.4/2.5a/2.6a Phase 2 **Unit B1**: provenance register + fs-only gate (see Unit B1 section above)
- [x] 2.2/2.5b/2.6b/2.7 Phase 2 **Unit B2**: optimizer + responsive derivatives (landed 2026-08-13 — see Unit B2 LANDING section)
- [ ] 3.1–3.7 Phase 3 (Unit C): ocean background + pattern bounds
- [ ] 4.1–4.7 Phase 4 (Unit D): composition primitives + light tokens
- [ ] 5.1–5.5 Phase 5 (Unit E): Home + About
- [ ] 6.1–6.5 Phase 6 (Unit F): Projects + Skills
- [ ] 7.1–7.5 Phase 7 (Unit G): Contact + Resume editorial
- [ ] 8.1–8.5 Phase 8 (Unit H1): choreographed transitions
- [ ] 9.1–9.4 Phase 9 (Unit H2): section-nav ring
- [ ] 10.1–10.4 Phase 10 (Unit I1): audio error vs no-track
- [ ] 11.1–11.3 Phase 11 (Unit I2): docs + final regression

## Workload / PR Boundary

- Mode: **chained PR slice** (delivery_strategy `auto-chain`, chain_strategy `feature-branch-chain`)
- Current work unit: **Unit A** (tasks 1.1–1.5) — the slice that fixes #6186 first, per migration plan
- Boundary: starts with RED `keyboard.spec.ts` additions; ends with green focused E2E + full-suite regression. PR #1 would target the tracker branch `ref/view-redesign`; base for the next child.
- Review budget impact: **+272/−15 = ~287 changed lines** (within the 400-line budget)
- No commits made, no PR opened (branch `feat/reference-driven-view-redesign` left as-is per contract).

## Skill Resolution

`paths-injected` — 8 skills: sdd-apply, sdd-apply/strict-tdd.md (file), debugging-and-error-recovery, playwright, frontend-ui-engineering, astro-framework, chained-pr, work-unit-commits.

---

# Unit B2 — Optimizer + Responsive Derivatives (LANDING, 2026-08-13)

## Summary

Maintainer-authorized B2 slice of the split Unit B. Lands the derivative pipeline as the B2 ownership boundary, leaving the B1 6-file staged boundary untouched: `scripts/optimize-assets.mjs` (preserved + extended), `tests/unit/provenance-pipeline.test.ts` (preserved historical RED + new contract tests), source originals, reference-only mockups/sheets, and the `dist-assets/` gitignore entry. Task 2.7's "re-add derivative-contract validation (width matrix)" is satisfied INSIDE the optimizer (`WIDTHS_BY_ROLE` + `assertWidthContract`) — the B1 gate file was NOT modified; the optimizer's existing import of `assetPath`/`loadRegister`/`requireFromStore` from the B1 gate is the only cross-boundary contract, accounted in B2 (behavior compatible, gate byte-identical).

## TDD Cycle Evidence (honest — implementation pre-existed)

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 2.2 | `tests/unit/provenance-pipeline.test.ts` | Unit | ✅ 2/2 preserved baseline (41.7s: sharp native init) | ✅ Historical: module-not-found (optimizer absent in oversized attempt) | ✅ 2/2 (byte-identity, matrix+alpha, regenerability, deferred-nothing) — re-verified | ✅ second-run byte-equality + deferred-produces-nothing | ✅ restructured: WIDTHS_MATRIX fixture now built from optimizer's `WIDTHS_BY_ROLE` (single source of truth) |
| 2.7 | `tests/unit/provenance-pipeline.test.ts` + `scripts/optimize-assets.mjs` | Unit | ✅ (above) | ✅ REAL restructure RED: `TypeError: Cannot read properties of undefined (reading 'portrait')` — test imports `WIDTHS_BY_ROLE`/`assertWidthContract` before they existed; 0 tests ran | ✅ 5/5 (2 preserved + 3 contract tests: portrait-vs-landscape rejection, icon non-96,160 rejection, real register accepted) | ✅ 3 contract cases + optimize-level enforcement (rejects before writing) | ✅ manifest folded into test 1 (exists, matches results, byte-identical across runs) |
| 2.5b | staging + `.gitignore` | — | — | — | ✅ 35 binaries staged byte-identical (sha256 captured pre/post staging); `.gitignore` +2 `dist-assets/` | — | — |
| 2.6b | Verify chain | — | — | — | ✅ See Work Unit Evidence | — | — |

## Work Unit Evidence

| Evidence | Required value |
|---|---|
| Focused test command and exact result | `pnpm vitest run tests/unit/provenance-pipeline.test.ts` → **5 passed (0 failed)**; RED baseline: TypeError on missing exports (0 tests ran) |
| Runtime harness command/scenario and exact result | `node scripts/optimize-assets.mjs` → **60 derivatives, 3,509,605 bytes** (30 AVIF + 30 WebP), all `alpha=true`; determinism: 61 files (60 + manifest.json) byte-identical across two runs, 0 mismatches; per-route worst case (largest AVIF principal + icon): Home 138,752 B / About 62,571 / Projects 98,332 / Skills 89,687 / Contact 141,376 / Resume 83,548 — all ≤ ~150 KB; manifest schema `derivative-manifest-v1`, 60 entries with sha256 per derivative; full `pnpm vitest run tests/unit` → **107 passed (12 files)**; fresh `pnpm build` → 7 pages; post-build `pnpm run gate:provenance` → `OK (25 entries, 25 originals)`; fresh dist scan → 0 forbidden paths (no mockup/asset_sheet/example/audio/original bytes); biome check on both B2 files → clean (6 pre-existing `any` warnings) |
| Rollback boundary | `git restore --staged assets/ docs/assets/mockup/ docs/assets/asset_sheet/ scripts/optimize-assets.mjs tests/unit/provenance-pipeline.test.ts .gitignore` (B2 staged set reverts to untracked; bytes preserved), then `rm -rf dist-assets`; B1's 6 staged files and Unit A work are NOT touched by any of it |

## Derivative Inventory (deterministic manifest, dist-assets/, gitignored)

- Principals AVIF+WebP: portrait `persona_1, persona_2` → 480/768/960; landscape `persona_6, persona_8, persona_9, persona_11` → 480/768/1280. Icons AVIF+WebP: `asset_12_clock, asset_09_badge_dev, asset_10_computer, asset_14_fire, asset_04_mariposa_neon, asset_05_card` → 96/160 (icon sources non-square: e.g. `asset_14_fire-160` = 160×96).
- Largest derivative `persona_11-1280.avif` 137,779 B; largest fallback `persona_1-960.webp` 276,564 B (fallback only, AVIF is primary).
- Total 60 files / 3,509,605 B — **identical total to the historical oversized attempt** (cross-attempt determinism). All sources RGBA; every derivative `alpha=true`.

## Files Changed (B2 boundary — exact)

| File | Action | Lines | What Was Done |
|------|--------|-------|---------------|
| `scripts/optimize-assets.mjs` | Modify (preserved + extended) | 120 | `WIDTHS_BY_ROLE` matrix export; `assertWidthContract` (register-declared widths vs locked matrix by role/aspect, enforced at pipeline start); per-derivative sha256; deterministic `manifest.json` (no timestamps) |
| `tests/unit/provenance-pipeline.test.ts` | Modify (preserved + extended) | 204 | Matrix fixture now built from `WIDTHS_BY_ROLE`; +3 width-contract tests; manifest assertions (exists, matches results, byte-identical across runs) |
| `.gitignore` | Modify | +2 | `dist-assets/` (derivative staging; regenerated, not committed) |
| `assets/persona/*` (11 PNGs) | Stage | binary | Byte-identical originals (~20.6 MB) |
| `assets/icon/*` (14 PNGs) | Stage | binary | Byte-identical originals (~2.4 MB) |
| `docs/assets/mockup/*` (6 PNGs) | Stage | binary | Reference-only (active reference set, design-locked), never in dist |
| `docs/assets/asset_sheet/*` (4 PNGs) | Stage | binary | Reference-only (icon source sheets), never in dist |

**B2 authored text lines: 326 ≤ 400** (120 + 204 + 2). Binary payloads (35 PNGs ≈ 45.6 MB) reported, excluded from the authored budget.

## Staging State (B1 intact, B2 separate)

- **B1 staged (untouched, 6 files)**: `.github/workflows/ci.yml`, `assets/PROVENANCE.yaml`, `package.json`, `scripts/verify-provenance.mjs`, `tests/unit/provenance-gate.test.ts`, `vitest.config.ts`
- **B2 staged (new)**: `.gitignore`, `assets/persona/*`, `assets/icon/*`, `docs/assets/mockup/*`, `docs/assets/asset_sheet/*`, `scripts/optimize-assets.mjs`, `tests/unit/provenance-pipeline.test.ts`
- **Unstaged/untracked preserved (not B2)**: Unit A files (`src/scripts/view.ts`, `shell.ts`, `tests/e2e/keyboard.spec.ts`), docs (`ARCHITECTURE.md`, `DESIGN.md`, `docs/adr/0004`, untracked `docs/adr/0005` — I2 scope), `docs/assets/example` worktree deletions, `openspec/changes/reference-driven-view-redesign/`, `dist-assets/` (ignored), `dist/` (ignored)
- No commit/push/PR made.

## Deviations from Design

- **Interpretation (reported, not a deviation)**: design's production derivative path is astro:assets at build (dist/_astro, wired in Unit D). B2's optimizer prepares the locked bounded set into gitignored `dist-assets/` as pipeline proof + payload evidence (task 2.6b contract: 60 derivatives, deterministic, testable). Width-matrix validation placement follows tasks.md "gate or optimizer" — chosen optimizer to keep the B1 boundary untouched.
- Widths match design exactly (portrait 480/768/960, landscape 480/768/1280, icon 96/160); formats AVIF primary + WebP fallback (register header documents formats as fixed by design).
- No spec/task wording conflicts. Mockups/sheets staged reference-only per design's active-reference-set decision; gate enforces their dist exclusion.

## Issues Found

- Icon sources are non-square (e.g. `asset_14_fire` 160×96 aspect) — `withoutEnlargement` still honored; manifest records real dimensions (96×58 for the 96-wide fire icon). Not a defect; honest reporting.
- WebP fallbacks are ~2× AVIF bytes (largest 276,564 B) — expected at q80; AVIF is primary per design, so the ~150 KB/route budget applies to the AVIF primary path.
- Biome reports 6 `any` warnings in the new test file (untyped `.mjs` module data) — warnings only, matching the pre-existing repo pattern; `pnpm run lint` fails on 20+ pre-existing errors in untouched `src/` files (HEAD 26710f2), out of B2 scope.

## Remaining Tasks

- [x] 2.1/2.3/2.4/2.5a/2.6a Phase 2 **Unit B1**: provenance register + fs-only gate (retained)
- [x] 2.2/2.5b/2.6b/2.7 Phase 2 **Unit B2**: optimizer + responsive derivatives (this batch — ALL Phase 2 complete)
- [ ] 3.1–3.7 Phase 3 (Unit C): ocean background + pattern bounds
- [ ] 4.1–4.7 Phase 4 (Unit D): composition primitives + light tokens
- [ ] 5.1–5.5 Phase 5 (Unit E): Home + About
- [ ] 6.1–6.5 Phase 6 (Unit F): Projects + Skills
- [ ] 7.1–7.5 Phase 7 (Unit G): Contact + Resume editorial
- [ ] 8.1–8.5 Phase 8 (Unit H1): choreographed transitions
- [ ] 9.1–9.4 Phase 9 (Unit H2): section-nav ring
- [ ] 10.1–10.4 Phase 10 (Unit I1): audio error vs no-track
- [ ] 11.1–11.3 Phase 11 (Unit I2): docs + final regression

## Workload / PR Boundary

- Mode: **chained PR slice** (delivery_strategy `auto-chain`, chain_strategy `feature-branch-chain`); PR #2b for Unit B2 (B1 = PR #2)
- Current work unit: **Unit B2** (tasks 2.2, 2.5b, 2.7, 2.6b) — the split slice that completes Phase 2
- Boundary: starts with the preserved pipeline RED tests; ends with green focused unit (5/5), determinism (61/61 identical), payload (all routes ≤ ~150 KB), alpha/dimensions, full unit (107/107), fresh build + gate (OK 25/25), dist scan clean. B1 staged boundary untouched.
- Review budget impact: **B2 authored text 326 lines ≤ 400** (B1 385 + B2 326 = 711 total across the split, within the maintainer's split budget)
- No commits made, no PR opened (branch `feat/reference-driven-view-redesign` left as-is per contract).

## Skill Resolution

`paths-injected` — 8 skills: sdd-apply, sdd-apply/strict-tdd.md (file), image-generation, astro-framework, chained-pr, work-unit-commits (this batch); prior batches additionally loaded debugging-and-error-recovery, playwright, frontend-ui-engineering, npm-secure-config, ci-cd-and-automation.

---

# Unit B3 — One-way rename correction `assets/icon`→`assets/sprites` (LANDING, 2026-08-13)

## Summary

B3 is the sole correction to landed B1/B2, mandated by the asset-provenance delta spec ("The former `assets/icon` directory MUST NOT exist… no alias, symlink, fallback, duplicate directory, or compatibility path") and design.md "Sprite rename" row. The 14 byte-identical PNG sources were migrated one-way to `assets/sprites/*.png` and `assets/icon` was removed completely from index AND worktree (deletion proof: `git ls-files assets/icon` = 0 entries; `assets/icon` absent on disk; per-file sha256 before/after identical 14/14; no alias/symlink/fallback/duplicate — the pre-existing `assets/sprites` copies were the migration destination, verified byte-identical before removal). Register, gate, and optimizer now speak the canonical sprite vocabulary (`sprite-accent`, `WIDTHS_BY_ROLE.sprite`, dir loops `["persona","sprites"]`); the gate gained an explicit `assets/icon` absence check covering dir/file/symlink (lstat-based, catches dangling links). No Unit C/D/audio work touched; `.icon-pattern` CSS rename is C2's task. Derivative outputs remain byte-identical: 60 files + manifest.json, 3,509,605 bytes, 61/61 determinism vs the pre-B3 baseline (matrix key rename is naming-only; output stems stay `asset_*`).

## TDD Cycle Evidence (honest — RED captured at each stage)

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 2.8 | `tests/unit/provenance-gate.test.ts` (+3 tests), `tests/unit/provenance-pipeline.test.ts` (+1 test) | Unit | ✅ 107/107 prior full-suite record (B2 landing) | ✅ REAL: 6 failed / 7 passed — role vocab (`unknown usage-role sprite-accent`), canonical assetPath (`assets/icon/...`), missing absence check (empty errors with `icon/` present), external-entry fixture, real-register roles, `WIDTHS_BY_ROLE.sprite` undefined (LSP `Property 'sprite' does not exist` + runtime `undefined`) | ✅ 13/13 focused after impl + migration | ✅ absence check triangulated: dir / file / symlink each fail, absence passes; sprite-accent accepted AND icon-accent rejected; `sprite` key present AND `icon` key absent | ➖ None needed — 4-line gate diff, 3-line optimizer diff, 14 mechanical register renames |
| 2.9 | binary move (no test) | — | — | — | ✅ 14/14 sha256 identity before/after; `git ls-files assets/icon` 0; worktree absent; 14 sprites staged | — | — |
| 2.10 | `assets/PROVENANCE.yaml` | — | — | — | ✅ 14 entries `sprite-accent`; header comment `assets/sprites`; selected/deferred/widths unchanged; no music entry (I1a) | — | — |
| 2.11 | `scripts/verify-provenance.mjs`, `scripts/optimize-assets.mjs` | — | — | — | ✅ gate: ROLES/assetPath/2 dir loops + absence check (lstatSync); optimizer: `WIDTHS_BY_ROLE.sprite` + comment | — | — |
| 2.12 | Verify chain | — | — | — | ✅ See Work Unit Evidence | — | — |

**RED narrative**: stage 1 (tests written, impl untouched) → 6 failed / 7 passed, every failure a real missing B3 behavior. Stage 2 (impl updated, `assets/icon` still on disk) → 1 failed / 12 passed, the sole failure `assets/icon must not exist (migrated to assets/sprites)` — proving the new absence check enforces the contract. Stage 3 (binary migration) → 13/13 green. No fabricated RED, no weakened assertions (all pre-existing assertions retained with canonical values).

## Work Unit Evidence

| Evidence | Required value |
|---|---|
| Focused test command and exact result | `pnpm vitest run tests/unit/provenance-gate.test.ts tests/unit/provenance-pipeline.test.ts` → **13 passed (0 failed)** (gate 7 = 4 preserved + 3 new; pipeline 6 = 5 preserved + 1 new). RED baselines: 6 failed / 7 passed (stage 1), 1 failed / 12 passed (stage 2) |
| Runtime harness command/scenario and exact result | `pnpm run gate:provenance` → `provenance gate: OK (25 entries, 25 originals)` (register⇄disk coverage both directions over persona+sprites; dist scan clean — no mockup/asset_sheet/example/audio/original bytes); `node scripts/optimize-assets.mjs` → **60 derivatives, 3,509,605 bytes**, all `alpha=true`; determinism: 61 files (60 + manifest.json) sha256-identical to the pre-B3 `dist-assets/` baseline, 0 mismatches; full `pnpm vitest run tests/unit` → **117 passed (12 files)**; old-path sweep: `assets/icon`/`icon-accent` remain ONLY in the gate absence check + test rejection fixtures (canonical by design); `git ls-files` icon sweep → only pre-existing `public/favicon.ico` |
| Rollback boundary | Re-add `assets/icon`: copy bytes from `/tmp/opencode/b3-icon-backup/` (14 files, verified identical to baseline `/tmp/opencode/b3-baseline.sha256`) + `git add assets/icon/`; revert the 5 text files from pre-B3 staged blobs at `/tmp/opencode/b3-prestage/` (git-show snapshots) + `git add`; `git restore --staged assets/sprites`. B1/B2/Unit A/C/docs staging untouched by any of it |

## Files Changed (B3 boundary — exact)

| File | Action | Numstat (vs pre-B3 staged) | What Was Done |
|------|--------|---------|---------------|
| `assets/sprites/*` (14 PNGs) | Stage (binary rename `assets/icon`→`assets/sprites`) | binary | Byte-identical sources at the canonical path; `assets/icon` removed from index + worktree (0 ls-files entries, absent on disk) |
| `assets/PROVENANCE.yaml` | Modify | +15/−15 | 14 entries `usage-role: icon-accent` → `sprite-accent`; header comment → `assets/persona and assets/sprites`; selected/deferred/widths byte-identical semantics |
| `scripts/verify-provenance.mjs` | Modify | +8/−4 | `ROLES` → `sprite-accent`; `assetPath` → `sprites`; dir loops `["persona","sprites"]` (coverage + originals); lstat-based `assets/icon` absence check (dir/file/symlink, dangling-link safe); header comment |
| `scripts/optimize-assets.mjs` | Modify | +2/−2 | `WIDTHS_BY_ROLE` key `icon` → `sprite` (+ comment); `assertWidthContract` reads `.sprite` |
| `tests/unit/provenance-gate.test.ts` | Modify | +36/−4 | fixtures → canonical `sprites` dir + `sprite-accent`; real-register asserts 14 `sprite-accent` / zero `icon-accent`; +3 tests (role vocab, canonical `assetPath`, absence dir/file/symlink) |
| `tests/unit/provenance-pipeline.test.ts` | Modify | +10/−8 | `WIDTHS_MATRIX` → `.sprite`; contract case → `sprite-accent`; +1 test (canonical `sprite` key, legacy `icon` key rejected) |
| **Total** | | **+71/−33 = 104 changed lines (impl+tests); +118/−35 = 153 with openspec/tasks accounting** | ≤ 400 budget; binaries reported as renames, not line budget |

## Staging State

- **B3 staged (new/updated)**: `assets/sprites/*` (14), `assets/PROVENANCE.yaml`, `scripts/verify-provenance.mjs`, `scripts/optimize-assets.mjs`, `tests/unit/provenance-gate.test.ts`, `tests/unit/provenance-pipeline.test.ts` — `assets/icon` present nowhere (index empty, worktree absent).
- **Preserved untouched (B1/B2/other staging)**: `.github/workflows/ci.yml`, `.gitignore`, `assets/persona/*` (11), `docs/assets/mockup/*` (6), `docs/assets/asset_sheet/*` (4), `docs/assets/example` deletions (5), `package.json`, `vitest.config.ts`.
- **Unstaged/untracked preserved**: Unit A (`src/scripts/view.ts`, `shell.ts`, `tests/e2e/keyboard.spec.ts`), Unit C (`src/scripts/living-background.ts`, `src/styles/global.css`, `tests/e2e/reduced-motion.spec.ts`, `views.spec.ts`, `tests/unit/canvas.test.ts`, `src/lib/canvas/{waves,bubbles}.ts`), docs (`ARCHITECTURE.md`, `DESIGN.md`, `docs/adr/0004`, untracked ADR-0005/0006 — I2 scope), `assets/music/` (I1a — untouched), `openspec/changes/reference-driven-view-redesign/`.
- No commit/push/PR made; no CSS `.icon-pattern` rename (C2 owns `.sprite-pattern`).

## Deviations from Design

None. Design.md "Sprite rename" row satisfied exactly: `assets/icon`→`assets/sprites`, role `icon`→`sprite`, no alias/symlink/fallback/duplicate. `assets/sprites` pre-existed in the worktree (untracked, byte-identical copies) — verified 14/14 sha256 identity before removal, so the one-way move is provably lossless and no second copy was ever created. Scan paths remain canonical: all scans build paths via `path.join` from ROOT; `assetPath` is the single source-path resolver (now `sprites`); the dist-scan forbidden-path regex already accepts both separators.

## Issues Found

- None blocking. `git diff --cached` totals (44 files / 793 insertions) reflect the cumulative B1+B2+B3 staged candidate vs HEAD — the B3 slice itself is the 153-line delta above.
- 6 biome `any`-warnings in the new test code match the pre-existing pattern for untyped `.mjs` module data; warnings only.

## Remaining Tasks

- [x] 2.8–2.12 Phase 2 **Unit B3**: one-way sprite rename correction (this batch — ALL Phase 2 complete)
- [ ] 3.1–3.3 Phase 3 (Unit C1): pure ocean modules + unit tests (split remediation)
- [ ] 3.4–3.6 Phase 3 (Unit C2): orchestration + static frame + pattern utility + E2E (split remediation)
- [ ] 4.1–4.7 Phase 4 (Unit D): composition primitives + light tokens
- [ ] 5.1–5.5 Phase 5 (Unit E): Home + About
- [ ] 6.1–6.5 Phase 6 (Unit F): Projects + Skills
- [ ] 7.1–7.5 Phase 7 (Unit G): Contact + Resume editorial
- [ ] 8.1–8.5 Phase 8 (Unit H1): choreographed transitions
- [ ] 9.1–9.4 Phase 9 (Unit H2): section-nav ring
- [ ] 10.1–10.5 Phase 10 (Unit I1a): audio pipeline
- [ ] 10.6–10.9 Phase 10 (Unit I1b): audio runtime
- [ ] 11.1–11.3 Phase 11 (Unit I2): docs/ADR sync + final regression

## Workload / PR Boundary

- Mode: **chained PR slice** (delivery_strategy `auto-chain`, chain_strategy `feature-branch-chain`); PR #4 for Unit B3 (base = PR #3/B2 branch).
- Boundary: starts with the B3 RED tests (2.8); ends with green focused 13/13 + gate OK 25/25 + determinism 61/61 + full unit 117/117 + deletion proof (2.12). Staged, uncommitted, no PR opened.
- Review budget impact: **+71/−33 = 104 authored text lines** (impl+tests; +118/−35 = 153 including openspec/tasks accounting) + 14 binary renames (excluded from line budget) ≤ 400.
- Remediation bindings (native status provided; parent settles — no acquire/settle performed): attempt token `sha256:551c372f6e3997fa7c85b263ca5aa2ffe88c177f087c47ba141a937e3bcf3350`; passing settle MUST use `--remediates-evidence-revision sha256:388a884929f9c9b8489a3f9c3cbcc187638bafe7991f86506706100b7f7e6812` and the distinct new evidence revision below.

```json
{
  "gentle-ai.remediation-result/v1": {
    "lineage_id": "reference-driven-view-redesign",
    "generation": 2,
    "fix_batch": "b3-sprite-migration",
    "failed_evidence_revision": "sha256:388a884929f9c9b8489a3f9c3cbcc187638bafe7991f86506706100b7f7e6812",
    "attempt_token": "sha256:551c372f6e3997fa7c85b263ca5aa2ffe88c177f087c47ba141a937e3bcf3350",
    "new_evidence_revision": "sha256:9f048f7321882830dee40840fb72785f404ba43b54903ab2777c69ba8857a591",
    "outcome": "one-way-rename-correction",
    "scope": "Unit B3: assets/icon->assets/sprites + register/gate/optimizer/tests; B1/B2/Unit A/C/docs bytes untouched"
  },
  "gentle-ai.remediation-evidence/v1": {
    "candidate_text_lines": 153,
    "binary_renames": 14,
    "new_evidence_revision_input": "sha256 of the sorted concatenation of the 5 changed files (PROVENANCE.yaml, verify-provenance.mjs, optimize-assets.mjs, provenance-gate.test.ts, provenance-pipeline.test.ts)",
    "focus_tests": "13/13 passed (7 gate + 6 pipeline; RED 6 failed -> 1 failed -> 0)",
    "gate_cli": "provenance gate: OK (25 entries, 25 originals); assets/icon absence enforced",
    "optimizer_determinism": "61/61 files byte-identical vs pre-B3 baseline (60 derivatives, 3,509,605 bytes)",
    "full_unit": "117/117 (12 files)",
    "deletion_proof": "git ls-files assets/icon = 0; assets/icon absent on disk; 14/14 sha256 before/after identical",
    "rollback": "/tmp/opencode/b3-icon-backup/ + /tmp/opencode/b3-prestage/ snapshots"
  }
}
```

## Skill Resolution

`paths-injected` — 7 skills: sdd-apply, sdd-apply/strict-tdd.md (file), deprecation-and-migration, work-unit-commits, chained-pr (this batch); prior batches additionally loaded image-generation, astro-framework, npm-secure-config, ci-cd-and-automation, playwright, frontend-ui-engineering, ui-motion, debugging-and-error-recovery.

---

# Unit C — Ocean background + pattern bounds (Phase 3, tasks 3.1–3.7)

**Batch C**: 2026-08-13 | **Status**: ✅ IMPLEMENTED + VERIFIED — returned `blocked: workload-decision-required` on PR sizing (see Workload/PR Boundary below)
**Mode**: Strict TDD (RED captured before each GREEN)

## What Landed

- `src/lib/canvas/waves.ts` (+93, new): seeded `createWaveField`/`stepWaves`/`renderWaves` per the design-locked interface; `WAVE_BAND_CAP = 3`; deep→near bands (deep blue → accent-300 → cyan), two-harmonic sine strips sampled ~1 pt/8px, one path+fill per band.
- `src/lib/canvas/bubbles.ts` (+74, new): seeded `createBubbles`/`stepBubbles`/`renderBubbles`; `BUBBLE_CAP = 24` rising circles, respawn at bottom when fully above the top edge; accent-cyan tint.
- `src/scripts/living-background.ts` (+53/−13): ocean pipeline `caustic fill → waves → bubbles → particles`; reduced motion paints exactly one static frame at the fixed seeded phase and never starts the loop; ocean state (`waves`+`bubbles`) stashed on the persisted canvas (`livingBackgroundOcean`) and adopted after view-transition swaps, mirroring the existing particle stash; DPR cap, hidden-tab pause, resize handling unchanged.
- `src/styles/global.css` (+21): `.icon-pattern` utility — opacity 0.12 (8–15% bound), ≤160px desktop / ≤96px mobile, pointer-events none; instances additionally carry `aria-hidden="true"` + `data-icon-pattern` (route accent placement is Unit D's composition concern).
- `tests/unit/canvas.test.ts` (+125): waves/bubbles determinism (per-seed + cross-seed), caps (3/24), in-canvas geometry, step immutability + phase advance / rise + top-respawn, render call counts (one path+fill per band, one arc per bubble).
- `tests/e2e/reduced-motion.spec.ts` (+75): static frame includes the procedural wave bands (bottom-half samples must show cyan/light-blue tones b−r ≥ 100 — produced only by the wave bands, never the caustic ≤83 or particles/bubbles <1%); waves load no image/media; hidden tab pauses the loop and it resumes.
- `tests/e2e/views.spec.ts` (+78): `.icon-pattern` utility bounds per viewport (160/96px caps, 8–15% opacity, pointer-events none); repeated accents ≤1 per route, aria-hidden, no text, pointer pass-through (document.elementFromPoint never returns the accent at its own center).

## TDD Cycle Evidence

| Task | RED (test first, run) | GREEN (implementation, run) | Triangulation |
|---|---|---|---|
| 3.1 | `tests/unit/canvas.test.ts` waves/bubbles imports → `Cannot find module 'src/lib/canvas/bubbles'`, 0 tests ran | waves.ts + bubbles.ts → 18/18 (9 pre-existing + 9 new) | 2 seeds determinism + cross-seed diff; step immutability + advance/respawn edge case; render call counts |
| 3.2 | `reduced-motion.spec.ts` wave-band pixel assertion → `waveCoverage 0 > 0.05` FAILED (no waves) | living-background.ts pipeline → 10/10 (wave, hidden-tab, procedural + 7 pre-existing) | static frame + loop-default (pre-existing) + hidden-tab freeze/resume + no-media |
| 3.3 | `views.spec.ts` probe bounds → `maxWidth 0 > 0` FAILED (utility absent; 2 failed, 1 guard passed vacuously) | global.css `.icon-pattern` → 3/3 | desktop 160px + mobile 96px + DOM guard sweep 5 routes |
| 3.4–3.7 | see above | full unit 113/113; full e2e 88/88 (one unrelated external-URL flake re-ran green); astro check 0; biome clean; build 7 pages; gate OK 25/25 | — |

Note: the 3.3 probe test was corrected during implementation (getComputedStyle returns a live object — read values before removing the probe element); assertions unchanged, RED cause verified as the absent utility.

## Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused test command and exact result | `pnpm vitest run tests/unit/canvas.test.ts` → 18/18; `pnpm exec playwright test reduced-motion.spec.ts` → 10/10; `-g "icon pattern bounds"` views → 3/3 |
| Runtime harness command/scenario and exact result | Dev server (reused, localhost:4321) probe: default-motion wave coverage 23.7% of bottom half, DPR-capped canvas 1280×720, no horizontal overflow; reduced-motion coverage 23.6%, static frame identical across 300ms (no loop). Pixel profile at x=640: deep band y≈264–288 (11,33,87), mid y≈440–472 (81,105,189), near y≈656–696 (31,121,165), caustic gap (7,22,51) — wave bands render at the designed positions/colors. Screenshots: /tmp/opencode/unit-c-probe/{default,reduced}-motion.png |
| Rollback boundary | `git restore --staged src/lib/canvas/waves.ts src/lib/canvas/bubbles.ts src/scripts/living-background.ts src/styles/global.css tests/unit/canvas.test.ts tests/e2e/reduced-motion.spec.ts tests/e2e/views.spec.ts` + `git restore src/lib/canvas/waves.ts src/lib/canvas/bubbles.ts` (new files) — removes Unit C without touching Unit A/B, assets, or openspec artifacts. Pre-existing repair: `assets/icon/` working-tree copies were missing (status `AD`); restored from the index (`git restore assets/icon/`), staging boundary untouched, bytes identical to the B2 record. |

## Workload / PR Boundary — `blocked: workload-decision-required`

Authored lines (B1 convention, additions+deletions): **532** — waves 93 + bubbles 74 + living-background 66 + global.css 21 + canvas.test 125 + reduced-motion 75 + views 78. (Additions-only, B2 convention: 519.) **> 400 budget.** The B1 precedent applies: fully implemented + verified, then returned blocked for the maintainer's decision. Options: (a) maintainer trim target (e.g., drop e2e per-element guard loop −20, bounds loops −10 → ~500; deeper cuts would degrade strict-TDD coverage below minimums); (b) split Unit C into C1 ocean canvas (waves+bubbles+living-background+canvas.test+reduced-motion ≈ 433 — still over, needs C1a modules+tests ≈ 257 / C1b integration+e2e ≈ 141) + C2 pattern bounds (views+global.css ≈ 99); (c) `size:exception` accepting 532 for PR 3. All work is complete, green, and uncommitted — the decision gates only the PR slice boundary, not correctness.

---

# Unit C1 — Pure ocean modules + unit tests (Phase 3, tasks 3.1–3.3) — LANDING (split remediation, 2026-08-13)

## Summary

C1 is slice 1 of 2 of the maintainer-authorized split of the oversized Unit C (532 authored lines > 400 → `blocked: workload-decision-required`; historical record retained above). C1 owns ONLY the pure ocean primitives: `src/lib/canvas/waves.ts` (+93, new), `src/lib/canvas/bubbles.ts` (+74, new), and the wave/bubble focused unit portion of `tests/unit/canvas.test.ts` (+125/−0). The implementation from the failed batch was NOT reimplemented and NO `size:exception` was requested — it was validated, its boundary confirmed, and landed as C1. `src/lib/canvas/particles.ts` is pre-existing tracked code: proven unchanged (`git diff --quiet HEAD -- src/lib/canvas/particles.ts` exit 0, diff empty). C2 scope — `src/scripts/living-background.ts` orchestration, `global.css` sprite-pattern utility, `reduced-motion.spec.ts`/`views.spec.ts` E2E — is untouched and unstaged. Runtime harness N/A: pure seeded modules have no runtime boundary in C1; visual/integration runtime is C2's.

## TDD Cycle Evidence (honest split remediation — implementation pre-existed from failed Unit C)

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 3.1 | `tests/unit/canvas.test.ts` | Unit | ✅ 9 pre-existing tests in HEAD canvas.test.ts untouched; full-unit baseline 117/117 recorded (B2/B3 landings) | ✅ HISTORICAL (failed Unit C record, retained above): waves/bubbles imports → `Cannot find module 'src/lib/canvas/bubbles'`, 0 tests ran — production modules did not exist | ✅ **15/15 focused** (`pnpm vitest run tests/unit/canvas.test.ts`, 135ms); full unit **117/117 (12 files)** | ✅ per-seed + cross-seed determinism (42 vs 7); step immutability + phase advance / rise + top-respawn edge case; render call counts (one path+fill per band, one arc per bubble); particle bounds/clamp/DPR-cap cases pre-existing | ➖ None needed — modules already refactored: constants extracted (`BUBBLE_CAP`, radius/speed ranges, `BAND_SPECS`, `SAMPLE_STEP`), immutable steps, one path+fill per band |
| 3.2 | purity audit | — | — | — | ✅ waves.ts/bubbles.ts import ONLY `seededRng` from `./particles`; zero `document`/`window`/`getContext`/canvas-global references at module scope (grep-verified); vitest `environment: "node"` run passes → module import has no DOM/canvas global dependency; `particles.ts` tracked + unchanged (diff empty) | — | — |
| 3.3 | boundary audit | — | — | — | ✅ C1 = **292 authored lines** (waves 93 + bubbles 74 + canvas.test +125/−0) ≤ 400 (ledger `max_changed_lines: 400`); focused test + rollback recorded below; files staged, no commit/push/PR | — | — |

**RED note**: the historical RED (`Cannot find module 'src/lib/canvas/bubbles'`) is preserved verbatim in the failed Unit C section above and was NOT re-run — re-running would require deleting production code. The historical record claimed `18/18`; the actual RED-validated file contains **15 tests (9 pre-existing + 6 wave/bubble)**. No test was weakened, removed, or added for budget — the landing records the measured count.

## Work Unit Evidence

| Evidence | Required value |
|---|---|
| Focused test command and exact result | `pnpm vitest run tests/unit/canvas.test.ts` → **15 passed (0 failed)** — 1 file, 135ms; covers waves/bubbles seeded determinism (per-seed + cross-seed), band cap 3, bubble cap 24, in-canvas geometry, step immutability + phase advance / rise + top-respawn, render call counts; DPR cap + particle bounds/clamp pre-existing |
| Runtime harness command/scenario and exact result | **N/A** — C1 is pure seeded modules with no runtime boundary (no DOM/canvas orchestration, no loop, no resize/DPR wiring in C1). Module import proven side-effect-free in vitest `environment: node` (no DOM globals present, 15/15 passes). Canvas painting, reduced-motion static frame, hidden-tab pause, resize/DPR wiring are C2's integration/runtime scope |
| Rollback boundary | `git restore --staged src/lib/canvas/waves.ts src/lib/canvas/bubbles.ts tests/unit/canvas.test.ts` + `rm src/lib/canvas/waves.ts src/lib/canvas/bubbles.ts` + `git restore tests/unit/canvas.test.ts` — returns the repo to pre-C1 state; B1/B2/B3 staging, Unit A files, C2 files (`living-background.ts`, `global.css`, 2 E2E specs), docs, ADRs, and assets are untouched by the C1 slice |

## Files Changed (C1 boundary — exact)

| File | Action | Numstat (vs HEAD) | What Was Done |
|------|--------|---------|---------------|
| `src/lib/canvas/waves.ts` | Create (new, 93 lines) | +93/−0 | Seeded `createWaveField(seed,width,height)` / `stepWaves` / `renderWaves` per the design-locked interface; `WAVE_BAND_CAP = 3`; deep→near band specs (baseY/amplitude/wavelength/thickness/color/alpha), two-harmonic sine strips sampled ~1 pt/8px, one path+fill per band; deterministic per seed; no DOM/canvas globals at import |
| `src/lib/canvas/bubbles.ts` | Create (new, 74 lines) | +74/−0 | Seeded `createBubbles(seed,width,height)` / `stepBubbles` / `renderBubbles`; `BUBBLE_CAP = 24`; radius 2–8, rise 0.3–0.9 px/frame, accent-cyan tint; respawn at bottom when fully above the top edge; immutable steps; no DOM/canvas globals at import |
| `tests/unit/canvas.test.ts` | Modify | +125/−0 | Wave/bubble focused portion (6 new `it` cases + `mockCtx` helper): seeded determinism per-seed + cross-seed, band cap 3 / bubble cap 24, in-canvas geometry, step immutability + phase advance / rise + top-respawn, render call counts (one path+fill per band, one arc per bubble); 9 pre-existing particle/DPR tests untouched |
| **Total** | | **+292/−0 = 292 authored lines** | ≤ 400 budget ✓ |

## Staging State

- **C1 staged (new/updated)**: `src/lib/canvas/waves.ts`, `src/lib/canvas/bubbles.ts`, `tests/unit/canvas.test.ts` (3 files). Cumulative staged count vs HEAD: 47 files / +1,085 insertions (B1+B2+B3+C1 together).
- **C2 untouched/unstaged (preserved)**: `src/scripts/living-background.ts`, `src/styles/global.css`, `tests/e2e/reduced-motion.spec.ts`, `tests/e2e/views.spec.ts` — no edits, no staging.
- **B1/B2/B3 staging intact**; Unit A (`src/scripts/view.ts`, `shell.ts`, `tests/e2e/keyboard.spec.ts`) unstaged as before; docs (`ARCHITECTURE.md`, `DESIGN.md`, ADR-0004/0005/0006), `assets/music/`, sprites/persona untouched.
- No commit/push/PR made.

## Deviations from Design

None. Design.md "Interfaces" row satisfied exactly: `waves.ts: createWaveField(seed,w,h)→WaveField; stepWaves; renderWaves; WAVE_BAND_CAP=3`; bubbles mirror it with `BUBBLE_CAP = 24`. `particles.ts` pre-existing and unchanged (proof above). No `.icon-pattern` CSS rename (C2 owns `.sprite-pattern`).

## Issues Found

- Historical failed-batch record claimed `18/18` canvas tests (9 pre-existing + 9 new); the actual RED-validated file contains **15 tests (9 pre-existing + 6 wave/bubble)**. No test was weakened or removed; discrepancy recorded here, landing uses the measured count.
- None blocking. (Prior B3 record's "6 biome any-warnings" note: the 3 C1 files check clean today — `pnpm exec biome check` on them: no fixes applied.)

## Remaining Tasks

- [x] 3.1–3.3 Phase 3 **Unit C1**: pure ocean modules + unit tests (this batch — split remediation slice 1 of 2)
- [ ] 3.4–3.6 Phase 3 **Unit C2**: orchestration + static frame + pattern utility + E2E (split remediation slice 2 of 2)
- [ ] 4.1–4.7 Phase 4 (Unit D): composition primitives + light tokens
- [ ] 5.1–5.5 Phase 5 (Unit E): Home + About
- [ ] 6.1–6.5 Phase 6 (Unit F): Projects + Skills
- [ ] 7.1–7.5 Phase 7 (Unit G): Contact + Resume editorial
- [ ] 8.1–8.5 Phase 8 (Unit H1): choreographed transitions
- [ ] 9.1–9.4 Phase 9 (Unit H2): section-nav ring
- [ ] 10.1–10.5 Phase 10 (Unit I1a): audio pipeline
- [ ] 10.6–10.9 Phase 10 (Unit I1b): audio runtime
- [ ] 11.1–11.3 Phase 11 (Unit I2): docs/ADR sync + final regression

## Workload / PR Boundary

- Mode: **chained PR slice** (delivery_strategy `auto-chain`, chain_strategy `feature-branch-chain`); PR #5 for Unit C1 (base = PR #4/B3 branch). Boundary: C1 = pure ocean primitives + focused unit tests ONLY; C2 (living-background orchestration + `global.css` utility + reduced-motion/views E2E) is the following slice; no `size:exception` requested.
- Boundary: starts at the RED-validated canvas.test.ts wave/bubble portion (written first, historical module-not-found RED) with the pre-existing implementation; ends with focused 15/15 + full unit 117/117 + biome clean + astro check 0. Staged, uncommitted, no PR opened.
- Review budget impact: **+292/−0 = 292 authored lines** ≤ 400 (ledger `max_changed_lines: 400`, `max_attempts: 2`).
- B3 numstat evidence mechanically verified against the native ledger (ordinal 7 `changed_lines: 153` matches the recorded +118/−35 = 153) — label accurate, no correction required.
- Remediation bindings (native ledger authoritative; parent settles — no acquire/settle performed): lineage_id `reference-driven-view-redesign`; generation **8**; fix_batch `unit-c1-ocean-primitives`; failed evidence revision `sha256:388a884929f9c9b8489a3f9c3cbcc187638bafe7991f86506706100b7f7e6812` (ledger ordinal 6, failed Unit C); attempt token `sha256:c20e56c3e3af7ba3856bb7db580642ab6178f5e166ba3176db6ef9297d84bc78` (ledger active revision).

```json
{
  "gentle-ai.remediation-result/v1": {
    "lineage_id": "reference-driven-view-redesign",
    "generation": 8,
    "fix_batch": "unit-c1-ocean-primitives",
    "failed_evidence_revision": "sha256:388a884929f9c9b8489a3f9c3cbcc187638bafe7991f86506706100b7f7e6812",
    "attempt_token": "sha256:c20e56c3e3af7ba3856bb7db580642ab6178f5e166ba3176db6ef9297d84bc78",
    "new_evidence_revision": "sha256:eebf908245ec1bbd2d866d3ba446e5d649dc08b50668c62bcb4bd4e9d27c2500",
    "outcome": "split-remediation-c1-landed",
    "scope": "Unit C1: waves.ts + bubbles.ts + canvas.test.ts wave/bubble portion; particles.ts unchanged; C2/living-background/global.css/E2E, docs, assets untouched"
  },
  "gentle-ai.remediation-evidence/v1": {
    "candidate_text_lines": 292,
    "new_evidence_revision_input": "sha256 (LC_ALL=C) of the byte-sorted concatenation of the 3 C1 files: waves.ts, bubbles.ts, canvas.test.ts",
    "focus_tests": "15/15 passed (canvas.test.ts: 9 pre-existing + 6 wave/bubble); RED historical: module-not-found, 0 tests ran (failed Unit C record retained)",
    "full_unit": "117/117 (12 files)",
    "biome": "clean — 3 C1 files, no fixes applied",
    "astro_check": "0 errors, 0 warnings (4 hints, pre-existing level)",
    "purity_proof": "waves/bubbles import only seededRng from ./particles; no DOM/canvas globals at module scope; vitest environment=node passes; particles.ts diff vs HEAD empty (git diff --quiet exit 0)",
    "runtime_harness": "N/A — pure seeded primitives, no runtime boundary in C1; integration/visual runtime owned by C2",
    "rollback": "git restore --staged the 3 C1 files + rm the 2 new modules + git restore canvas.test.ts; B1/B2/B3 staging, Unit A, C2, docs, assets untouched"
  }
}
```

## Skill Resolution

`paths-injected` — 4 skills: sdd-apply, sdd-apply/strict-tdd.md (file), work-unit-commits, chained-pr (this batch).

---

# Unit C2 — Orchestration + static frame + sprite-pattern utility + E2E (Phase 3, tasks 3.4–3.6) — LANDING (split remediation, 2026-08-13)

## Summary

C2 is slice 2 of 2 of the maintainer-authorized split of the oversized Unit C (532 authored lines > 400 → `blocked: workload-decision-required`; historical record retained above). C2 owns ONLY the runtime/integration boundary: `src/scripts/living-background.ts` ocean orchestration (caustic → waves → bubbles → particles, reduced-motion single static frame, hidden-tab pause/resume, resize, DPR cap), `src/styles/global.css` canonical `.sprite-pattern` utility (renamed from `.icon-pattern`), and the Unit C additions of `tests/e2e/reduced-motion.spec.ts` + `tests/e2e/views.spec.ts`. The implementation pre-existed from the failed batch and was NOT reimplemented; C2 validated it, applied the canonical B3 naming correction (`.sprite-pattern`/`data-sprite-pattern`), and made the pattern E2E non-self-fulfilling. C1 files (waves.ts/bubbles.ts/canvas.test.ts), B staging, Unit A files, docs, and assets are untouched by this slice. Measured totals correct the failed batch's claims: reduced-motion = 9 tests (not 10), canvas unit = 15 (already corrected in C1).

## TDD Cycle Evidence (honest split remediation — implementation pre-existed from failed Unit C)

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 3.4 | `tests/e2e/reduced-motion.spec.ts` | E2E | ✅ 9/9 current-state baseline run before edits (measured; historical claimed 10/10 — inflated like 18/18, corrected to measured) | ✅ HISTORICAL (failed Unit C record, retained): `waveCoverage 0 > 0.05` FAILED — no waves rendered; plus loop/hidden-tab/no-media scenarios RED in the failed batch | ✅ **9/9 focused** (`pnpm exec playwright test tests/e2e/reduced-motion.spec.ts`, 3.8s): wave-band static frame (bottom-half b−r≥100 coverage > 0.05), no-media, hidden-tab freeze/resume, plus 7 pre-existing (static frame, glow hold, opacity-only entrances, loop by default, figure layer) | ✅ 5-sampled frozen window + resume poll + loop-by-default + wave coverage threshold | ✅ hidden-tab negative control converted from Playwright-side `waitForTimeout(250)` to the repo's page-side observation pattern (same as the pre-existing static-frame test) — no Playwright-side sleep, 9/9 re-run green |
| 3.5 | `tests/e2e/views.spec.ts` + `src/styles/global.css` | E2E | ✅ 3/3 current-state baseline (legacy `.icon-pattern` probes vs legacy CSS — measured before any edit) | ✅ REAL, re-run fresh: canonical `sprite-pattern` probes vs still-legacy CSS → **3 failed / 0 passed**, exact historical signature `expect(probe.maxWidth).toBeGreaterThan(0)` → `Expected: > 0, Received: 0` (views.spec.ts:879, :889), opacity `Expected <= 0.15, Received 1`, pointerEvents `auto`, blocked/overflow probe failures — full log `/tmp/opencode/c2-red-views.log` | ✅ 3/3 after `.icon-pattern`→`.sprite-pattern` rename (+ data hook in the utility comment): desktop bounds 8–15%/≤160px, mobile ≤96px, canonical-instance density ceiling + no overflow + pointer pass-through | ✅ desktop 160 + mobile 96 + injected canonical probe on all 5 VIEWS routes (over-wide 200vw instance capped by the utility, elementFromPoint never returns it) | ✅ legacy `icon-pattern` removed from src/tests entirely (grep exit 1; only historical evidence in apply-progress.md remains) |
| 3.6 | boundary + runtime | — | — | — | ✅ See Work Unit Evidence: 268 insertions/13 deletions = 281 authored changed lines ≤ 400 (target ≈240; +28 over the pre-existing 240 additions = the vacuous ghost-loop test replaced with real non-self-fulfilling assertions per maintainer instruction); dev-server pixel probe + reduced-motion emulation; screenshots | — | — |

**RED honesty note**: 3.4's RED is the historical failed-batch record (`waveCoverage 0 > 0.05`) retained verbatim — not re-run, because re-running would require deleting the existing waves pipeline. 3.5 produced a FRESH real RED by ordering the rename correctly: canonical test probes were written and executed against the still-legacy `.icon-pattern` CSS (maxWidth 0 — identical signature to the historical 3.3 RED), proving the canonical rename is enforced by the tests, not assumed. No test was weakened; the third views test was STRENGTHENED (the failed batch's per-instance loop ran zero times on all 5 routes — ghost loop — and its aria/pointer checks never executed; the rework injects a canonical probe so every assertion runs on every route).

## Work Unit Evidence

| Evidence | Required value |
|---|---|
| Focused test command and exact result | `pnpm exec playwright test tests/e2e/reduced-motion.spec.ts` → **9 passed (0 failed)**; `pnpm exec playwright test tests/e2e/views.spec.ts -g "sprite pattern"` → **3 passed (0 failed)** (RED baseline: 3 failed / 0 passed, `maxWidth Received: 0` at views.spec.ts:879/:889, opacity `Received: 1`) |
| Runtime harness command/scenario and exact result | Existing dev server localhost:4321, headless Chromium probe (node + @playwright/test, scripts kept out of the repo): **default motion** — canvas animated (two samples 150ms apart differ), backing store **2560×1440 at deviceScaleFactor 3** (capped DPR 2 → 1280×2, cap proven: 3 would be 3840), bottom-half wave coverage **23.6%**; **reduced motion** — canvas 1280×720, static frame identical across 300ms (exactly one deterministic frame, no loop/travel), coverage **23.8%**; band pixel profile at x=640: caustic top (0,0,28), **deep band ≈(16,32,96) y≈259–276, mid band ≈(80,112,192) y≈431–469, near band ≈(32,128,176) y≈489–650** — three bands at the designed colors/positions; screenshots `/tmp/opencode/c2-probe/{default,reduced}-motion.png`; no horizontal overflow (E2E: over-wide 200vw canonical probe capped ≤160px, rectRight ≤ viewport, 5 routes) |
| Regression chain | Full unit **117/117 (12 files)**; full E2E **87/87** (first run 86/87 — `budget.spec.ts:143` flaked once under parallel load, passed in isolation and in the full re-run; unrelated to C2, historical pattern); `pnpm exec astro check` → **0 errors, 0 warnings** (4 pre-existing hints); `pnpm exec biome check` on the 4 C2 files → **clean, no fixes applied**; `pnpm run gate:provenance` → **OK (25 entries, 25 originals)**; `pnpm build` → **7 pages** |
| Rollback boundary | `git restore --staged src/scripts/living-background.ts src/styles/global.css tests/e2e/reduced-motion.spec.ts tests/e2e/views.spec.ts` + `git restore` those 4 files (working tree back to pre-C2 HEAD state) — C1 staging (waves.ts/bubbles.ts/canvas.test.ts), B1/B2/B3 staging, Unit A files, docs, ADRs, assets/music untouched; `.sprite-pattern` CSS rename reverses to `.icon-pattern` (pre-B3 vocabulary) with the same `git restore` |

## Files Changed (C2 boundary — exact)

| File | Action | Numstat (vs HEAD) | What Was Done |
|------|--------|---------|---------------|
| `src/scripts/living-background.ts` | Modify | +53/−13 | Ocean orchestration (pre-existing, validated): `caustic fill → renderWaves → renderBubbles → renderParticles` per frame; `OceanState` (waves+bubbles) stashed on the persisted canvas across view-transition swaps; `OCEAN_SEED = 42` fixed geometry; reduced motion paints exactly one static frame at the fixed seeded phase and never starts the loop; hidden-tab pause/resume (`visibilitychange`), resize re-inits fields, `cappedDpr` backing store, `astro:before-swap` destroy / `astro:after-swap` resume |
| `src/styles/global.css` | Modify | +21/−0 | Canonical `.sprite-pattern` utility (renamed from `.icon-pattern`, comment data hook → `data-sprite-pattern`): opacity 0.12 (8–15% bound), ≤160px desktop / ≤96px mobile (`max-width`+`max-height`), pointer-events none; exclusion-zone comment retained (placement is Unit D's composition concern) |
| `tests/e2e/reduced-motion.spec.ts` | Modify | +88/−0 | Unit C additions: wave-band static-frame pixel test (bottom-half b−r≥100 coverage > 0.05 — produced only by wave bands, never the caustic ≤83); procedural no-media + hidden-tab test (hidden tab freezes the canvas, resume restarts); hidden-tab negative control converted to page-side 5-sample observation window (no Playwright-side sleep) |
| `tests/e2e/views.spec.ts` | Modify | +106/−0 | Canonical `sprite pattern bounds` describe (renamed from `icon pattern bounds`): desktop bounds (8–15% opacity, ≤160px, pointer-events none), mobile ≤96px, and the reworked canonical-instances test — density ceiling ≤1 per route on the `data-sprite-pattern` hook (5 routes) + injected canonical probe (class + data hook + over-wide 200vw geometry) asserting capped width never overflows and pointers never blocked (elementFromPoint at its own center). Per-instance aria-hidden/one-per-route placement documented as Unit D's (tasks 4.1/4.4) — the utility cannot set attributes, so the test does not self-fulfill |
| **Total** | | **+268/−13 = 281 authored changed lines** | ≤ 400 budget ✓ (target ≈240; +28 = ghost-loop test replaced with real assertions, task-mandated) |

## Staging State

- **C2 staged (new/updated)**: `src/scripts/living-background.ts`, `src/styles/global.css`, `tests/e2e/reduced-motion.spec.ts`, `tests/e2e/views.spec.ts` (4 files). Cumulative staged vs HEAD: 51 files / +1,353 insertions (A+B1+B2+B3+C1+C2 together).
- **C1 staging intact**: `src/lib/canvas/waves.ts`, `src/lib/canvas/bubbles.ts`, `tests/unit/canvas.test.ts`.
- **B1/B2/B3 staging intact**; Unit A (`src/scripts/view.ts`, `shell.ts`, `tests/e2e/keyboard.spec.ts`) unstaged as before; docs (`ARCHITECTURE.md`, `DESIGN.md`, ADR-0004/0005/0006), `assets/music/`, sprites/persona untouched. Unit D not implemented (no components/routes/audio — out of scope per maintainer instruction).
- No commit/push/PR made.

## Deviations from Design

None. Design.md route-asset-matrix row satisfied exactly: opacity 8–15%, ≤160px/96px, pointer-events none; canonical `sprite-pattern` vocabulary matches B3's `sprite-accent`/`assets/sprites` one-way rename. `tasks.md` 3.1 stale count fixed mechanically (18/18 → 15/15). No `.icon-pattern` forward references in src/tests (grep exit 1); remaining occurrences are historical evidence in apply-progress.md only.

## Issues Found

- Failed-batch recorded E2E count (10/10) is inflated like its unit count (18/18): measured 9 tests in reduced-motion.spec.ts. Corrected in this landing; no test removed or weakened.
- The failed batch's third pattern test was a ghost loop (per-instance aria/pointer checks never executed — 0 instances on all routes). Reworked to inject a canonical probe; every assertion now runs on every route.
- `budget.spec.ts:143` flaked once under full parallel load (86/87), green in isolation and in the full re-run (87/87) — pre-existing pattern, unrelated to C2 (no budget/gate code touched).
- No blocking issues.

## Remaining Tasks

- [x] 3.4–3.6 Phase 3 **Unit C2**: orchestration + static frame + pattern utility + E2E (this batch — split remediation slice 2 of 2; **Phase 3 COMPLETE**)
- [ ] 4.1–4.7 Phase 4 (Unit D): composition primitives + light tokens
- [ ] 5.1–5.5 Phase 5 (Unit E): Home + About
- [ ] 6.1–6.5 Phase 6 (Unit F): Projects + Skills
- [ ] 7.1–7.5 Phase 7 (Unit G): Contact + Resume editorial
- [ ] 8.1–8.5 Phase 8 (Unit H1): choreographed transitions
- [ ] 9.1–9.4 Phase 9 (Unit H2): section-nav ring
- [ ] 10.1–10.5 Phase 10 (Unit I1a): audio pipeline
- [ ] 10.6–10.9 Phase 10 (Unit I1b): audio runtime
- [ ] 11.1–11.3 Phase 11 (Unit I2): docs/ADR sync + final regression

## Workload / PR Boundary

- Mode: **chained PR slice** (delivery_strategy `auto-chain`, chain_strategy `feature-branch-chain`); **PR #6** for Unit C2 (mechanical correction: C1 landed as PR #5, so C2 follows it; base = PR #5/C1 branch) — Unit D follows as PR #7. Boundary: starts at the historical RED (wave coverage 0 / pattern maxWidth 0) with the pre-existing implementation; ends with focused 9/9 + 3/3 + full unit 117/117 + full E2E 87/87 + biome clean + astro check 0 + gate OK + build 7 pages + pixel probe. Staged, uncommitted, no PR opened.
- Review budget impact: **+268/−13 = 281 authored changed lines** ≤ 400 (ledger `max_changed_lines: 400`, `max_attempts: 2`); target ≈240 — +28 over the pre-existing 240 additions is the ghost-loop→real-assertion rework, mandated by the maintainer instruction "tests should not self-fulfill".
- Remediation bindings (native ledger authoritative; parent settles — no acquire/settle performed): lineage_id `reference-driven-view-redesign`; generation **9**; fix_batch `unit-c2-orchestration-pattern-e2e`; failed evidence revision `sha256:388a884929f9c9b8489a3f9c3cbcc187638bafe7991f86506706100b7f7e6812` (ledger ordinal 6, failed Unit C); attempt token `sha256:5299addd292b742c4ec26b32e53395ffdbba78253d40316a2512c7526a91ad9e` (native token provided).

```json
{
  "gentle-ai.remediation-result/v1": {
    "lineage_id": "reference-driven-view-redesign",
    "generation": 9,
    "fix_batch": "unit-c2-orchestration-pattern-e2e",
    "failed_evidence_revision": "sha256:388a884929f9c9b8489a3f9c3cbcc187638bafe7991f86506706100b7f7e6812",
    "attempt_token": "sha256:5299addd292b742c4ec26b32e53395ffdbba78253d40316a2512c7526a91ad9e",
    "new_evidence_revision": "sha256:677dc58365a26511cd2165a24d3f284b28dac75f7a2a9d6b6640dd5e4d57b7f5",
    "outcome": "split-remediation-c2-landed",
    "scope": "Unit C2: living-background.ts orchestration + global.css .sprite-pattern utility + reduced-motion/views E2E; C1/B/Unit A/docs/assets untouched; Unit D not implemented"
  },
  "gentle-ai.remediation-evidence/v1": {
    "candidate_text_lines": 281,
    "new_evidence_revision_input": "sha256 (LC_ALL=C) of the byte-sorted concatenation of the 4 C2 files: living-background.ts, global.css, reduced-motion.spec.ts, views.spec.ts",
    "focus_tests": "reduced-motion 9/9 + views sprite-pattern 3/3 (fresh RED: maxWidth Received 0 at views.spec.ts:879/:889, opacity Received 1, 3 failed -> 0)",
    "full_unit": "117/117 (12 files); canvas.test.ts 15/15 (C1 regression)",
    "full_e2e": "87/87 (budget.spec.ts:143 flaked once under parallel load, green in isolation + re-run)",
    "runtime_probe": "animated default (dpr3 -> capped 2560x1440), coverage 23.6%; reduced static frame identical 300ms, coverage 23.8%; bands deep (16,32,96) mid (80,112,192) near (32,128,176)",
    "biome": "clean — 4 C2 files, no fixes applied",
    "astro_check": "0 errors, 0 warnings (4 hints, pre-existing level)",
    "gate": "provenance gate: OK (25 entries, 25 originals)",
    "build": "7 pages",
    "canonical_sweep": "no forward icon-pattern in src/tests (grep exit 1); only historical evidence in apply-progress.md",
    "rollback": "git restore --staged + git restore the 4 C2 files; C1/B/Unit A/docs/assets untouched"
  }
}
