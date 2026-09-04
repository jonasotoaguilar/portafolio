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

### Requirement: Performance Is Independent of SEO

Runtime-performance criteria MUST be evaluated without requiring canonical, sitemap, robots, or absolute Open Graph URLs.

#### Scenario: SEO-complete and SEO-absent builds are both measurable

- GIVEN two builds that differ only by whether `site`/`SITE` is set
- WHEN LCP, INP, and CLS are compared as performance evidence
- THEN presence or absence of SEO absolute URLs does not pass or fail the performance result
