```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:d20e45121c761021ea379bf886ca74168d86388e0227b2979a555e73716d6960
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 19/19
scenarios: 34/34
test_command: pnpm exec playwright test
test_exit_code: 0
test_output_hash: sha256:526eac268ea6a88fce133d70af319bf0ac6ffeb12c29bdb7cf77e991e73c84a4
build_command: env -u SITE pnpm build
build_exit_code: 0
build_output_hash: sha256:9b5ff6640289c179d89cf3d4c39e66e4f1c9306b6fb7cde73ef5569028c4127a
```

## Verification Report

**Change**: ui-performance-seo-audit
**Version**: N/A
**Mode**: Strict TDD

Independent verify in `/home/jona/projects/portafolio-worktrees/ui-performance-seo-audit` at `9bb0e572e591d058e53b8cd031bddb354c5028ac`. Product code was not modified. Native attempt token `sha256:cba789a7c966341d773c0b6c41d3ae199ffcd15ccacefc9ed9f05a522d1b38ae` was not acquired or settled. This report replaces failed evidence `sha256:970cb134bcf75fde80052567568df6b31000aef1a9f230b1e7ed6f284c91bcc6`. Remediation evidence `sha256:66bdd27470fffe384b183b1d2f0c06785cf455fdb1da8fe3957e540df2df056e` was treated as apply-history only, not as this run's proof.

Authoritative heading counts from the five delta specs: **19** `### Requirement:` and **34** `#### Scenario:`.

### Completeness

| Metric           | Value |
| ---------------- | ----- |
| Tasks total      | 16    |
| Tasks complete   | 16    |
| Tasks incomplete | 0     |

### Build & Tests Execution

**Build**: ✅ Passed (SITE-unset) and ✅ Passed (`SITE=https://example.test`)

```text
env -u SITE pnpm build
exit 0
hash sha256:9b5ff6640289c179d89cf3d4c39e66e4f1c9306b6fb7cde73ef5569028c4127a
7 page(s) built in 322ms; robots Allow / only; sitemap files = 0; canonical/og:url/og:image = 0;
sameAs LinkedIn retained; JSON-LD url falls back to GitHub; no phone/CV/8894/2050/+56; no example.test; no localhost origin.

SITE=https://example.test pnpm build
exit 0
hash sha256:801d91cd6b0b99286ba29d9e0fe3e999716b9014f61a8f5b25fcd7c8d74f8764
7 page(s) built in 358ms; sitemap-index.xml created.
canonical/og:url https://example.test/; og:image https://example.test/og.png width 1200 height 630;
robots Sitemap: https://example.test/sitemap-index.xml; JSON-LD url https://example.test/;
sameAs unchanged; no phone/CV.
public/og.png is PNG 1200×630 (1.10109MiB).
```

**Tests**: ✅ 35 unit passed / ✅ 54 e2e passed / ⚠️ 0 skipped

```text
pnpm run format:check  exit 0  sha256:368f5b3280e3f044076d646b3ee6e2263ba17f317af310302ab42262ba4a824e
  All matched files use the correct format. 83 files.

pnpm run lint          exit 0  sha256:b3f428b8b892af785816d7190f68918c4ccaf35667bcde486acda59c95a720cf
  0 errors; 3 warnings (no-shadow waitForFunction `before`; complexity 11 persist-swap; no-underscore-dangle __motionInitCount).

pnpm exec astro check  exit 0  sha256:ec15e490a359e659f9603a81742285c58b5c837e946425d6cff3c4f8231fa724
  Result (34 files): 0 errors, 0 warnings, 0 hints.

pnpm run test:unit     exit 0  sha256:93a6a35ba09561fb40389c155bd425459ec3a4606026d6e010b76618ef423328
  Test Files 5 passed (5); Tests 35 passed (35).

pnpm exec playwright test e2e/interaction.spec.ts -g "enables parallax"
  exit 0  sha256:92e2ecc4dd1890cd89ed5820d6e639923df100af66ddd5b384f9ba3baac1de2c
  1 passed (2.9s) — coarse/no-hover skips parallax, fine+hover enables parallax (2.2s).

pnpm exec playwright test  exit 0  sha256:526eac268ea6a88fce133d70af319bf0ac6ffeb12c29bdb7cf77e991e73c84a4
  54 passed (28.0s). Reused existing astro preview on 127.0.0.1:4321 from this worktree.
```

**Coverage**: ➖ Not available — vitest.config.ts has no coverage reporter; no coverage command in package.json.

### Parallax proof (prior tautology blocker)

Source `e2e/interaction.spec.ts:533-644` no longer contains `afterFine !== "" || afterFine !== "none"`. That OR remains only in a comment documenting the negative control.

Coarse/no-hover path (correct skip disjunction):

- `expect(afterCoarse === "" || afterCoarse === "none").toBeTruthy()`

Fine+hover path (cannot pass for empty / none / unchanged):

1. Capture `beforeFine` after reload, before pointer movement.
2. `page.mouse.move(100,100)` then `(900,600)`.
3. `waitForFunction` requires `t !== "" && t !== "none" && t !== before` (times out if transform stays empty, none, or unchanged).
4. Assertions: `not.toBe(beforeFine)`, `not.toBe("")`, `not.toBe("none")`, conjunction `afterFine !== "" && afterFine !== "none"`, `toMatch(/translate|matrix/)`.

Independent boolean control (not a test substitute): old OR is true for `""`, `"none"`, and matrix; new full predicate is false for empty, none, and unchanged matrix, true for `translate(4px, 3px)` vs empty. Focused Playwright run passed 1/1; full suite re-ran the same test 2.4s and passed.

Production `src/scripts/motion.ts` `allowsParallax()` remains `(hover: hover) and (pointer: fine)` && !reduce; `setupParallax` uses `gsap.quickTo` duration 0.9. No production edit in this verify.

### Spec Compliance Matrix

| Requirement                                    | Scenario                                               | Test                                                                                          | Result       |
| ---------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------ |
| About CTA Advances to Contact                  | About CTA opens Contact                                | `e2e/interaction.spec.ts` > About CTA points to /contact                                      | ✅ COMPLIANT |
| About CTA Advances to Contact                  | CTA survives ClientRouter navigation                   | `e2e/interaction.spec.ts` > About CTA … survives ClientRouter back-forward                    | ✅ COMPLIANT |
| Authorized LinkedIn URL Is Clickable           | Contact, home, and Footer use the exact URL            | `e2e/content.spec.ts` > LinkedIn exact href tests                                             | ✅ COMPLIANT |
| Authorized LinkedIn URL Is Clickable           | JSON-LD sameAs includes the exact URL                  | `e2e/content.spec.ts` > JSON-LD Person includes exact LinkedIn sameAs                         | ✅ COMPLIANT |
| Authorized LinkedIn URL Is Clickable           | Handle remains a link after ClientRouter               | `e2e/interaction.spec.ts` > LinkedIn href persists                                            | ✅ COMPLIANT |
| Phone Number Omitted                           | No-phone scan of public outputs                        | `e2e/content.spec.ts` + SITE-unset/SITE-set dist scan                                         | ✅ COMPLIANT |
| Phone Number Omitted                           | Contact after ClientRouter still omits phone           | `e2e/interaction.spec.ts` > /contact remains phone-free                                       | ✅ COMPLIANT |
| Public Voice Is Finished Product               | Contact copy is product language                       | `e2e/interaction.spec.ts` > finished-product copy persists + rendered /contact                | ✅ COMPLIANT |
| Public Voice Is Finished Product               | About and Experience copy is product language          | `e2e/interaction.spec.ts` deny scan on /about /experience                                     | ✅ COMPLIANT |
| No Public Proof or Verification Voice          | Dist contains no public CV                             | SITE-unset and SITE-set dist scan `\bCV\b` = 0                                                | ✅ COMPLIANT |
| No Public Proof or Verification Voice          | GitHub is a channel, not proof                         | `e2e/interaction.spec.ts` deny-list + rendered “GitHub for code”                              | ✅ COMPLIANT |
| No Provenance Teaching Copy                    | Contact does not narrate privacy mechanics             | `e2e/interaction.spec.ts` + rendered /contact                                                 | ✅ COMPLIANT |
| No Provenance Teaching Copy                    | ClientRouter does not restore old provenance copy      | `e2e/interaction.spec.ts` > finished-product copy persists after ClientRouter                 | ✅ COMPLIANT |
| Absolute SEO When Site Is Set                  | Configured site emits absolute discoverability         | `SITE=https://example.test pnpm build` dist inspect                                           | ✅ COMPLIANT |
| Absolute SEO When Site Is Set                  | JSON-LD identity URLs stay absolute                    | SITE-set dist Person.url + sameAs                                                             | ✅ COMPLIANT |
| Missing Site Does Not Fabricate URLs           | Unset SITE omits absolute URL claims                   | `e2e/content.spec.ts` canonical absent + SITE-unset dist                                      | ✅ COMPLIANT |
| SEO Outcome Is Independent of Performance      | Unset SITE is an SEO gap, not a performance fail       | e2e LCP/motion pass SITE-unset; lighthouse sample completed                                   | ✅ COMPLIANT |
| SEO Metadata Omits Phone                       | Metadata and JSON-LD have no phone                     | e2e JSON-LD + both dist scans                                                                 | ✅ COMPLIANT |
| Reproducible Baseline Before Change            | Baseline exists before optimization                    | `/tmp/lh.json` single `/` desktop sample only; no 7-route set                                 | ⚠️ PARTIAL   |
| Reproducible Baseline Before Change            | Missing SITE does not block the baseline               | `/tmp/lh.json` requestedUrl http://localhost:4321/ SITE-unset                                 | ✅ COMPLIANT |
| LCP Hints Target True LCP Images               | Home hero is the prioritized LCP image                 | `e2e/interaction.spec.ts` > home hero is prioritized LCP                                      | ✅ COMPLIANT |
| LCP Hints Target True LCP Images               | About profile is the prioritized LCP image             | `e2e/interaction.spec.ts` > about profile is prioritized LCP                                  | ✅ COMPLIANT |
| Claims Require Comparable Evidence             | Improvement outside variance may be claimed            | No improvement claimed (MAY not exercised)                                                    | ✅ COMPLIANT |
| Claims Require Comparable Evidence             | Result inside variance is not an improvement           | No improvement claimed; GSAP kept; LCP hints kept as correctness                              | ✅ COMPLIANT |
| Performance Is Independent of SEO              | SEO-complete and SEO-absent builds are both measurable | Both builds ran; no LCP/INP/CLS comparison of the two                                         | ⚠️ PARTIAL   |
| Reduced Motion Disables Non-Essential Motion   | Reduced motion on first load                           | `e2e/interaction.spec.ts` > reduced-motion on load                                            | ✅ COMPLIANT |
| Reduced Motion Disables Non-Essential Motion   | Reduced motion after ClientRouter                      | `e2e/interaction.spec.ts` > reduced-motion after ClientRouter                                 | ✅ COMPLIANT |
| Pointer Parallax Is Gated                      | Fine pointer with hover enables parallax               | `e2e/interaction.spec.ts:606-643` delta + non-empty + translate/matrix; focused 1/1 and 54/54 | ✅ COMPLIANT |
| Pointer Parallax Is Gated                      | Coarse pointer or no hover skips parallax              | `e2e/interaction.spec.ts` coarse/no-hover skips parallax                                      | ✅ COMPLIANT |
| Will-Change Is Transient                       | After motion completes, will-change is gone            | `e2e/interaction.spec.ts` no standing stylesheet will-change                                  | ✅ COMPLIANT |
| Will-Change Is Transient                       | Persist swap clears motion hints                       | `e2e/interaction.spec.ts` persist swap clears motion hints                                    | ✅ COMPLIANT |
| Persist Teardown Before Swap                   | Back-forward leaves no stale motion                    | `e2e/interaction.spec.ts` persist swap + back-forward                                         | ✅ COMPLIANT |
| Smooth Scroll Does Not Compete With Navigation | ClientRouter restoration is instant                    | only `scrollBehavior !== "smooth"`; no restored-position assertion                            | ⚠️ PARTIAL   |
| Smooth Scroll Does Not Compete With Navigation | SkipLink focus is not smoothed site-wide               | `scrollBehavior !== "smooth"` + SkipLink focus to `#main`                                     | ✅ COMPLIANT |

**Compliance summary**: 31/34 scenarios compliant (0 UNTESTED, 3 PARTIAL)

### Correctness (Static Evidence)

| Requirement                          | Status             | Notes                                                                            |
| ------------------------------------ | ------------------ | -------------------------------------------------------------------------------- |
| About CTA Advances to Contact        | ✅ Implemented     | `/about` primary control `GET IN CONTACT` `href="/contact"`                      |
| Authorized LinkedIn URL              | ✅ Implemented     | `site.linkedinUrl` exact URL; Footer/home/contact `rel="me noopener noreferrer"` |
| Phone Number Omitted                 | ✅ Implemented     | No tel/telephone/8894/2050/+56 in product pages or either dist                   |
| Public Voice Is Finished Product     | ✅ Implemented     | Contact/About/Experience product language; copy-deny is test-only                |
| No Public Proof / Provenance         | ✅ Implemented     | No public `CV`; GitHub is a channel                                              |
| Absolute SEO When Site Is Set        | ✅ Implemented     | Head helpers + robots Sitemap + sitemap integration gated on SITE                |
| Missing Site Does Not Fabricate URLs | ✅ Implemented     | `astro.config.mjs` does not invent `site`; helpers return undefined              |
| SEO Independent of Performance       | ✅ Implemented     | Performance tests do not require canonical/OG                                    |
| Reduced Motion                       | ✅ Implemented     | `prefersReduced()` short-circuits entrance/parallax; CSS reduce media            |
| Pointer Parallax Gated               | ✅ Implemented     | `allowsParallax()` hover+fine && !reduce; e2e now proves enable and skip         |
| Will-Change Transient                | ✅ Implemented     | JS `setTransientWillChange` / `clearWillChange`; no standing CSS will-change     |
| Persist Teardown                     | ✅ Implemented     | `astro:before-swap` → `destroyMotion`/`killAll` resets transform                 |
| Smooth Scroll                        | ✅ Implemented     | global `html { scroll-behavior: smooth }` removed; reduce media sets auto        |
| LCP Hints                            | ✅ Implemented     | `/` hero and `/about` profile `priority`; WaterField `loading="lazy"`            |
| Claims Require Evidence              | ✅ Implemented     | No performance-win claim; GSAP retained                                          |

### Coherence (Design)

| Decision                             | Followed? | Notes                                                             |
| ------------------------------------ | --------- | ----------------------------------------------------------------- |
| LinkedIn SoT `site.linkedinUrl`      | ✅ Yes    | Exact constructed URL, comment not 999-verified                   |
| SEO origin gated on SITE             | ✅ Yes    | No fallback host in astro.config                                  |
| robots endpoint Sitemap only if site | ✅ Yes    |                                                                   |
| Head calls site-helpers              | ✅ Yes    |                                                                   |
| Remove global smooth scroll          | ✅ Yes    |                                                                   |
| will-change JS-only, cleared         | ✅ Yes    |                                                                   |
| Parallax hover+fine && !reduce       | ✅ Yes    | Enable path now proven at runtime                                 |
| LCP `priority` on true LCP only      | ✅ Yes    |                                                                   |
| Keep GSAP unless measured win        | ✅ Yes    | No CSS replacement shipped                                        |
| OG 1200×630 from existing hero       | ✅ Yes    | `public/og.png` 1200×630                                          |
| Visual inherit chosen.yaml           | ✅ Yes    | No new palette/type/composition; rendered inherit at 1280 and 360 |

### TDD Compliance

| Check                         | Result | Details                                                                                             |
| ----------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| TDD Evidence reported         | ✅     | Slice A + Slice B TDD Cycle Evidence tables in apply-progress.md                                    |
| All tasks have tests          | ⚠️     | 16/16 tasks checked; measurement tasks 3.1/3.4 have no test file (Lighthouse process)               |
| RED confirmed (tests exist)   | ✅     | `copy-deny.test.ts`, `site-helpers.test.ts`, `e2e/content.spec.ts`, `e2e/interaction.spec.ts` exist |
| GREEN confirmed (tests pass)  | ✅     | Independent 35/35 unit and 54/54 e2e pass now                                                       |
| Triangulation adequate        | ✅     | Motion 6 cases including fine-hover delta/matrix; copy-deny 7 cases                                 |
| Safety Net for modified files | ✅     | Apply-progress records unit/e2e baselines before GREEN                                              |

**TDD Compliance**: 5/6 checks passed (1 warning)

### Test Layer Distribution

| Layer       | Tests  | Files | Tools             |
| ----------- | ------ | ----- | ----------------- |
| Unit        | 35     | 5     | Vitest 4.1.11     |
| Integration | 0      | 0     | not installed     |
| E2E         | 54     | 4     | Playwright 1.62.1 |
| **Total**   | **89** | **9** |                   |

Changed/new tests: `src/lib/copy-deny.test.ts` (unit), `src/lib/site-helpers.test.ts` (unit), `e2e/content.spec.ts` (e2e), `e2e/interaction.spec.ts` (e2e).

### Changed File Coverage

Coverage analysis skipped — no coverage tool detected.

### Assertion Quality

| File                      | Line | Assertion                                                         | Issue                                                                  | Severity |
| ------------------------- | ---- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- | -------- |
| `e2e/interaction.spec.ts` | 760  | `expect(Array.isArray(wc)).toBeTruthy()`                          | Type-only / always true; does not prove single init                    | WARNING  |
| `e2e/interaction.spec.ts` | 735  | `expect(typeof before === "number" && typeof after === "number")` | Type-only; does not prove SkipLink is unsmoothed beyond scrollBehavior | WARNING  |

**Assertion quality**: 0 CRITICAL, 2 WARNING

Fine-hover tautology is gone. The new conjunction + before/after delta + `translate\|matrix` match fails for `""`, `"none"`, and unchanged transform.

### Quality Metrics

**Linter**: ⚠️ 3 warnings, 0 errors
**Type Checker**: ✅ No errors (`astro check` 34 files)

### Mutation / Test Adequacy

Strict TDD is active. Independent search found **no** Stryker/mutation config, package, or `node_modules/@stryker-mutator` in this worktree. Per sdd-mutation-testing: framework absent → campaign skipped, mutation evidence **N/A** (not blocked-config). No mutation tooling was installed or configured.

Test Adequacy: changed fine-hover assertions now distinguish empty, none, and unchanged transform from a real GSAP translate/matrix. Other changed unit tests distinguish wrong implementations (undefined vs empty, CV word-boundary, SITE unset).

### Performance evidence

Design/tasks asked for Chromium 3×7 routes at 1280 and 375 Slow-4G CPU 4× (126 runs) and median LCP/INP/CLS.

Independent assessment of `/tmp/lh.json` (lighthouse 13.0.3, fetchTime 2026-09-03T23:44:26.888Z, requestedUrl `http://localhost:4321/`):

- LCP 1951.6778 ms (display 2.0 s, score 0.97)
- CLS 0
- TBT 0
- interactive 1951.6778 ms
- max-potential-fid 164 ms

**The 3×7×2 matrix does not exist. Field 75th percentile does not exist.** Those numbers are not invented here. No improvement is claimed.

Spec language used for the claims decision:

- Requirement **Claims Require Comparable Evidence**: “A performance claim MUST cite comparable before/after LCP, INP, or CLS. If the delta is within run-to-run variance, the change MUST NOT be claimed as an improvement”
- Scenario **Improvement outside variance may be claimed** is MAY
- Apply did **not** claim a performance win; GSAP was kept; LCP `priority` is structural correctness

Therefore the missing 3×7 matrix is **not** a product-behavior FAIL by itself. It is ⚠️ PARTIAL against Requirement **Reproducible Baseline Before Change** (“MUST record a baseline for all seven public entries”). Structural LCP ownership is COMPLIANT via passing e2e.

### Rendered / UI evidence

Chrome DevTools against `http://127.0.0.1:4321` (public static site; access n/a). Viewports 1280×800 and 360×800 (mobile/touch). ClientRouter About → Get in Contact → `/contact`.

Positive: exact LinkedIn href+rel on home/contact/footer; About CTAs `/contact`; finished-product contact copy (“GitHub for code”); no phone; hero `loading=eager fetchpriority=high`; WaterField `loading=lazy` `aria-hidden=true`; `scroll-behavior: auto`; will-change computed auto; no horizontal overflow at 360 (`scrollWidth=360`); inherit cyan/ink clipped-panel world vs `chosen.yaml` (`inherit-existing`); WaterField not competing as hero; mobile uses Open menu.

Note: after the SITE-set build, live preview served `canonical=https://example.test/` from `dist/`. SITE-unset omission was proven earlier by `env -u SITE pnpm build` dist inspect and by e2e `canonical absent when SITE not set` against the pre-SITE-set preview.

Reduced-motion rendered pass used Playwright `emulateMedia({ reducedMotion: "reduce" })` (Chrome emulate tool has no reduced-motion flag). Covering e2e tests passed. No visual-regression screenshots persisted (no contractual mismatch).

UI audit/motion/craft: no contractual visual failure. Craft only: home teaser “Verified roles & dates” is product voice, not provenance teaching.

### Issues Found

**CRITICAL**: None

**WARNING**:

1. Seven-route Lighthouse baseline was not collected; only `/` desktop single sample exists. Spec MUST for all seven entries is PARTIAL. No improvement was claimed.
2. ClientRouter restoration scenario only asserts `scrollBehavior !== "smooth"`.
3. `motion initializes exactly once` test does not count inits (`Array.isArray` tautology).
4. Playwright `waitForTimeout` used in motion tests (flake risk; not a spec miss).
5. oxlint warnings: complexity on persist-swap; no-underscore-dangle `__motionInitCount`; no-shadow on waitForFunction `before`.
6. Mutation campaign N/A (framework not present in this worktree).
7. SEO-complete vs SEO-absent performance comparison not measured (both builds succeeded).

**SUGGESTION**:

1. Add a SITE-set Playwright project/fixture so absolute SEO is not verify-only build inspect.
2. Drop unused `__motionInitCount` probe or actually increment it in `motion.ts`.
3. Assert ClientRouter restored scroll position is applied without animation, not only `scrollBehavior`.

### Verdict

PASS WITH WARNINGS
Fine-hover parallax is now proven (delta from pre-move, neither empty nor none, translate/matrix); 31/34 scenarios compliant; remaining gaps are PARTIAL performance-baseline, SEO-vs-perf measurement, and scroll-restoration depth. Commands green. No attempt settlement.
