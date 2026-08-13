# SEO Metadata Specification

## Purpose

Crawlable metadata for the six routes: exact per-view document titles, JSON-LD Person block, per-route canonical links, and build-time sitemap.

## Requirements

### Requirement: Per-view page titles

Each of the six routes MUST render a distinct exact document title: the shell "Jonathan Soto · Backend & Full-Stack Engineer" and the five views "{View} · Jonathan Soto" (About, Resume, Projects, Skills, Contact).
(Previously: a single exact title on the index page)

#### Scenario: Exact title per route

- GIVEN any route rendered
- WHEN the document title is read
- THEN it equals that route's exact title and differs from every other route's title

### Requirement: JSON-LD Person

Every route MUST include a JSON-LD `Person` block that parses as valid schema.org data, containing `name`, `jobTitle`, `email`, and `sameAs` links to the GitHub profile and the WealthQuest itch.io page.
(Previously: the Person block appeared only on the index page)

#### Scenario: Valid Person block per route

- GIVEN any route's HTML
- WHEN the JSON-LD script is parsed
- THEN it is valid schema.org `Person` data with `name`, `jobTitle`, and `email`

#### Scenario: sameAs links present

- GIVEN the JSON-LD Person block
- WHEN `sameAs` is inspected
- THEN it includes the GitHub profile and the WealthQuest itch.io URL

### Requirement: Sitemap generation

The build MUST generate `sitemap.xml` listing the six routes (the shell plus the five views) and MUST NOT include the 404 page.
(Previously: the sitemap listed only the index page)

#### Scenario: Sitemap contains six URLs

- GIVEN the production build output
- WHEN `sitemap.xml` is inspected
- THEN it lists the shell and the five view URLs

#### Scenario: 404 excluded

- GIVEN the production build output
- WHEN `sitemap.xml` is inspected
- THEN no 404 page URL is present

### Requirement: Canonical URLs

Each route MUST render a canonical link pointing to its own absolute URL.

#### Scenario: Canonical matches the route

- GIVEN any route rendered
- WHEN the canonical link is inspected
- THEN it equals that route's absolute URL
