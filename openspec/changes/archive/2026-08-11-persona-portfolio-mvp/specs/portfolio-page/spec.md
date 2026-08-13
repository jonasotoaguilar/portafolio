# Portfolio Page Specification

## Purpose

The single index page (Hero, Featured Work, Projects, Skills, Contact) and the 404 page, rendered from content with the fixed dark theme and a strict first-load JavaScript budget.

## Requirements

### Requirement: Single page with anchored sections

The index page MUST render sections in the order Hero, Featured Work, Projects, Skills, Contact. Anchor links `#featured-work`, `#projects`, `#skills`, `#contact` MUST scroll to their sections, and MUST work as default fragment navigation when JavaScript is disabled.

#### Scenario: Anchor navigation scrolls

- GIVEN the index page rendered
- WHEN a visitor activates the Projects nav item
- THEN the page scrolls to the `#projects` section

#### Scenario: Zero-JS anchor navigation

- GIVEN JavaScript disabled in the browser
- WHEN a visitor follows a nav link
- THEN the browser performs default fragment navigation to the matching section

#### Scenario: Section order

- GIVEN the index page rendered
- WHEN the sections are inspected
- THEN they appear in order Hero, Featured Work, Projects, Skills, Contact

### Requirement: Hero content and heading hierarchy

The Hero MUST render the subtitle "Backend & Full-Stack Engineer" and the focus areas Go, TypeScript, Python, clean architecture, and API design. The index page MUST contain exactly one `h1` (the hero title).

#### Scenario: Hero renders role and focus areas

- GIVEN the index page rendered
- WHEN the Hero section is inspected
- THEN the subtitle and all five focus areas are visible

#### Scenario: Single h1

- GIVEN the index page rendered
- WHEN headings are counted
- THEN exactly one `h1` exists

### Requirement: 404 page

Unknown paths MUST render a 404 page matching the visual identity with a single action back to `/`. It MUST be reachable via a direct server request.

#### Scenario: Unknown path renders 404

- GIVEN a request to an unknown path
- WHEN the response renders
- THEN a 404 page appears with one link returning to `/`

#### Scenario: Direct visit works

- GIVEN a direct browser visit to an unknown path
- WHEN the page loads
- THEN the 404 page renders without client-side routing

### Requirement: First-load JavaScript budget

The index page MUST ship less than 100KB of gzipped JavaScript on first load, including canvas and motion scripts.

#### Scenario: Budget enforced

- GIVEN the production build output
- WHEN the gzipped JavaScript bytes for the index page are measured
- THEN the total is below 100KB
