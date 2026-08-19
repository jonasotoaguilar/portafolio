# Delta for portfolio-content

## ADDED Requirements

### Requirement: Static factual stats with fallback

The site config MUST support an optional `stats` array of static factual values (label and value pairs) validated by the content schema and rendered on the Home stat card and the About stats panel. Stats MUST be static build-time facts — they MUST NOT come from live sources such as GitHub APIs, visit counters, or any network request at build or runtime. When `stats` is absent, the system MUST render the built-in fallback set (6+ years of experience, 4 projects, 2 languages). Malformed or invalid `stats` content MUST fail the build. Values MUST remain factual and MUST NOT include fabricated ranks or metrics.

#### Scenario: Declared stats render

- GIVEN site config declaring a valid `stats` array
- WHEN the Home and About routes render
- THEN the declared label/value pairs render in the stat card and the stats panel

#### Scenario: Fallback when stats absent

- GIVEN site config without a `stats` array
- WHEN the Home route renders
- THEN the built-in fallback set (6+ years of experience, 4 projects, 2 languages) renders

#### Scenario: Malformed stats fail the build

- GIVEN a `stats` array with an invalid shape or a missing required field
- WHEN the build runs
- THEN the build fails with a schema error

#### Scenario: No live data

- GIVEN the production site
- WHEN build-time and page-load network activity is inspected
- THEN no stats-related network requests occur at build time or at runtime
