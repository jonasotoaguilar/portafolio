# Runtime Performance Specification

## Purpose

Runtime performance work is measured. SEO gaps are not performance failures. LCP hints apply only to true LCP images. No improvement is claimed inside run-to-run variance.

## Requirements

### Requirement: Reproducible Baseline Before Change

Before any runtime-performance change, the system MUST record a baseline for all seven public entries under documented comparable conditions (device class, network/throttling, `SITE` setting). Later runs MUST reuse those conditions.

#### Scenario: Baseline exists before optimization

- GIVEN no performance change has been applied
- WHEN a performance change is proposed
- THEN a baseline LCP, INP, and CLS set exists for `/`, `/projects`, `/skills`, `/experience`, `/about`, `/contact`, and `404`

#### Scenario: Missing SITE does not block the baseline

- GIVEN `site`/`SITE` is unset
- WHEN the baseline is collected
- THEN the run still completes under the documented conditions
- AND missing SEO URLs are not recorded as performance failures

### Requirement: LCP Hints Target True LCP Images

Above-fold LCP candidates MUST receive high-priority loading treatment. On `/` that candidate is the hero image. On `/about` that candidate is the profile image. The decorative water field MUST NOT receive LCP-priority treatment.

#### Scenario: Home hero is the prioritized LCP image

- GIVEN `/` is requested
- WHEN loading hints are inspected
- THEN the hero image is prioritized
- AND the water field is not treated as LCP

#### Scenario: About profile is the prioritized LCP image

- GIVEN `/about` is requested
- WHEN loading hints are inspected
- THEN the profile image is prioritized
- AND the water field is not treated as LCP

### Requirement: Claims Require Comparable Evidence

A performance claim MUST cite comparable before/after LCP, INP, or CLS. If the delta is within run-to-run variance, the change MUST NOT be claimed as an improvement and SHOULD be reverted. GSAP versus CSS MUST be kept or discarded only from that evidence, not assumed.

#### Scenario: Improvement outside variance may be claimed

- GIVEN baseline and after runs under the same conditions
- WHEN the after median or 75th-percentile metric improves beyond documented variance
- THEN the claim MAY cite those figures

#### Scenario: Result inside variance is not an improvement

- GIVEN baseline and after runs under the same conditions
- WHEN the delta is within documented variance
- THEN no improvement is claimed
- AND the change is not kept as a performance win

### Requirement: Scroll Trace Before Paint Optimization

Before any blur, clip, or fixed-layer paint optimization, the system MUST capture a scroll frame trace on `/projects` and `/experience` at desktop and mobile viewports, three repeats each. Evidence MUST report frame, main-thread, and paint attribution. Capturing the trace MUST NOT promise a paint change. Salience evidence MUST NOT substitute for this performance evidence.

#### Scenario: Happy path measurement completes

- GIVEN comparable production-preview conditions
- WHEN `/projects` and `/experience` are traced at desktop and mobile, three repeats
- THEN evidence reports frame, main-thread, and paint attribution
- AND no paint change is implied by capturing the trace

#### Scenario: Trace-pass ships no paint change

- GIVEN that matrix and three repeats
- WHEN median FPS is not below 50 and long tasks aligned to ghost, clip, or fixed layers are not more than 2 in 2 of 3 runs
- THEN no blur or fixed-layer code change ships
- AND the summary records attribution without a paint-improvement claim

#### Scenario: Trace-fail authorizes a bounded candidate

- GIVEN that matrix and three repeats
- WHEN median FPS is below 50 or more than 2 aligned long tasks occur in 2 of 3 runs
- THEN at most one bounded paint candidate on the attributed layer MAY be authorized
- AND no paint change ships until that gate fails

#### Scenario: ClientRouter revisit is included

- GIVEN a fresh load trace for `/projects` or `/experience`
- WHEN the same route is traced after ClientRouter away and back
- THEN attribution includes persisted decorative layers
- AND the run still does not itself change paint code

### Requirement: Paint Change Is Trace-Gated And Single-Variable

Any paint optimization MUST be conditional on a failing scroll-trace gate, MUST change one measured variable at a time, and MUST NOT claim improvement inside run-to-run variance. Motion salience MUST be evaluated separately from frame metrics.

#### Scenario: One variable after a failing gate

- GIVEN a failing trace gate and a single attributed bottleneck
- WHEN a paint change is applied
- THEN exactly one variable is changed before re-measure
- AND salience pass or fail is recorded separately from FPS

#### Scenario: Inside variance is not an improvement

- GIVEN comparable before/after scroll traces
- WHEN the FPS or long-task delta is within documented variance
- THEN no paint improvement is claimed
- AND the candidate is not kept as a performance win

#### Scenario: Edge case gate without attribution

- GIVEN traces that miss frame, main-thread, or paint attribution
- WHEN a paint change is proposed
- THEN the change MUST NOT ship

### Requirement: Performance Is Independent of SEO

Runtime-performance criteria MUST be evaluated without requiring canonical, sitemap, robots, or absolute Open Graph URLs.

#### Scenario: SEO-complete and SEO-absent builds are both measurable

- GIVEN two builds that differ only by whether `site`/`SITE` is set
- WHEN LCP, INP, and CLS are compared as performance evidence
- THEN presence or absence of SEO absolute URLs does not pass or fail the performance result
