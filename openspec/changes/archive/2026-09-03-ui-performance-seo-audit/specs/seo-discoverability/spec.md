# SEO Discoverability Specification

## Purpose

Discoverability metadata is independent of runtime performance. Absolute URLs exist only when `site`/`SITE` is configured. No site URL is fabricated.

## Requirements

### Requirement: Absolute SEO When Site Is Set

When `site`/`SITE` is set to a real deployed origin, each public document MUST emit an absolute canonical URL, absolute `og:url`, and absolute `og:image` with width and height. The build MUST emit a sitemap of public routes and a robots hint that points at that sitemap. The system MUST NOT invent an origin.

#### Scenario: Configured site emits absolute discoverability

- GIVEN a build with `site`/`SITE` set to the real origin
- WHEN public HTML, sitemap, and robots output are inspected
- THEN canonical, `og:url`, and `og:image` are absolute under that origin
- AND `og:image` declares width and height
- AND robots references the sitemap

#### Scenario: JSON-LD identity URLs stay absolute

- GIVEN a build with `site`/`SITE` set
- WHEN Person JSON-LD is read
- THEN `url` is absolute under that origin
- AND `sameAs` includes only absolute identity URLs, including `https://www.linkedin.com/in/jonathan-soto-dev`

### Requirement: Missing Site Does Not Fabricate URLs

When `site`/`SITE` is unset, the system MUST NOT emit a fabricated canonical, `og:url`, `og:image` origin, sitemap of invented hosts, or robots sitemap line with an invented host.

#### Scenario: Unset SITE omits absolute URL claims

- GIVEN a build without `site`/`SITE`
- WHEN HTML, sitemap, and robots output are inspected
- THEN no fabricated origin appears in canonical, Open Graph, sitemap, or robots
- AND LinkedIn `sameAs` remains `https://www.linkedin.com/in/jonathan-soto-dev` when present

### Requirement: SEO Outcome Is Independent of Performance

A missing or incomplete SEO signal MUST be recorded as an SEO result. It MUST NOT be treated as a runtime-performance failure. A performance measurement MUST NOT be required to judge SEO correctness.

#### Scenario: Unset SITE is an SEO gap, not a performance fail

- GIVEN a build without `site`/`SITE` and any performance run
- WHEN results are classified
- THEN absent canonical/sitemap/absolute OG is an SEO gap
- AND that gap does not fail runtime-performance criteria

### Requirement: SEO Metadata Omits Phone

SEO metadata and JSON-LD MUST omit phone, `tel:`, and `telephone`.

#### Scenario: Metadata and JSON-LD have no phone

- GIVEN any public build, with or without `site`/`SITE`
- WHEN metadata and JSON-LD are scanned
- THEN no phone token is present
