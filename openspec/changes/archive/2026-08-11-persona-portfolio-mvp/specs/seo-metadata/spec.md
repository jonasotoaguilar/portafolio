# SEO Metadata Specification

## Purpose

Crawlable metadata for the index page: exact document title, JSON-LD Person block, and build-time sitemap.

## Requirements

### Requirement: Page title

The index page MUST render the document title "Jonathan Soto · Backend & Full-Stack Engineer".

#### Scenario: Exact title

- GIVEN the index page rendered
- WHEN the document title is read
- THEN it equals "Jonathan Soto · Backend & Full-Stack Engineer"

### Requirement: JSON-LD Person

The index page MUST include a JSON-LD `Person` block that parses as valid schema.org data, containing `name`, `jobTitle`, `email`, and `sameAs` links to the GitHub profile and the WealthQuest itch.io page.

#### Scenario: Valid Person block

- GIVEN the index page HTML
- WHEN the JSON-LD script is parsed
- THEN it is valid schema.org `Person` data with `name`, `jobTitle`, and `email`

#### Scenario: sameAs links present

- GIVEN the JSON-LD Person block
- WHEN `sameAs` is inspected
- THEN it includes the GitHub profile and the WealthQuest itch.io URL

### Requirement: Sitemap generation

The build MUST generate `sitemap.xml` including the index page, and MUST NOT include the 404 page.

#### Scenario: Sitemap contains the index

- GIVEN the production build output
- WHEN `sitemap.xml` is inspected
- THEN it lists the index page URL

#### Scenario: 404 excluded

- GIVEN the production build output
- WHEN `sitemap.xml` is inspected
- THEN no 404 page URL is present
