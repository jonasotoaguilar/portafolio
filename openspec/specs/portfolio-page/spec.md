# Portfolio Page Specification

## Purpose

The game shell at `/` and the five view routes `/about`, `/resume`, `/projects`, `/skills`, `/contact`, plus the 404 page, rendered from content with the fixed dark theme and a strict per-route first-load JavaScript budget.

## Requirements

### Requirement: Shell and five view routes

The system MUST render a full-screen game shell at `/` and five view routes `/about`, `/resume`, `/projects`, `/skills`, `/contact`, each a full-screen view (`100dvh`, no page scroll by default). Without JavaScript, every route MUST render all content in normal document flow; the no-scroll constraint MUST be applied by the enhancement layer only and MUST NOT hide content when JavaScript is disabled.
(Previously: single index page with anchored sections)

#### Scenario: Views are real deep-linkable routes

- GIVEN a direct request to any of the five view routes
- WHEN the response renders
- THEN the complete view renders with all content in the document

#### Scenario: Zero-JS content in flow

- GIVEN JavaScript disabled
- WHEN any route renders
- THEN all content is visible in normal document flow and the page scrolls normally

#### Scenario: No-scroll is enhancement-only

- GIVEN JavaScript enabled
- WHEN a view renders
- THEN the view fills the viewport without page scrolling while content remains reachable

### Requirement: View heading hierarchy

Each of the six routes MUST contain exactly one `h1` inside a single `<main>` landmark. The ABOUT view MUST render the role "Backend & Full-Stack Engineer" and the focus areas from site config.
(Previously: hero subtitle and a single h1 on the index page)

#### Scenario: One h1 per route

- GIVEN any route rendered
- WHEN headings are counted
- THEN exactly one `h1` exists on that route

#### Scenario: ABOUT renders role and focus areas

- GIVEN the ABOUT view rendered
- WHEN the view is inspected
- THEN the role and all focus areas from site config are visible

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

Every route MUST ship less than 100KB of gzipped JavaScript on first load, including canvas and motion scripts.
(Previously: budget measured on the index page only)

#### Scenario: Budget enforced on every route

- GIVEN the production build output
- WHEN the gzipped JavaScript bytes are measured per route
- THEN each route's total is below 100KB

### Requirement: LIST/detail views

PROJECTS, RESUME, and SKILLS MUST render a LIST of items and an in-view detail panel for the selected item. A PROJECTS fragment link (`/projects#serviceflow`) MUST preselect the matching project. Below 768px, the detail panel MUST stack below the LIST and scroll internally when content overflows. Opening a panel MUST move focus into it; closing MUST return focus to the list item. LIST interactive elements MUST be at least 44px tall.

#### Scenario: Projects list with deep link

- GIVEN the PROJECTS view requested at `/projects#serviceflow`
- WHEN the view renders
- THEN the four project items render and the ServiceFlow detail is preselected

#### Scenario: Mobile stacked panel scrolls

- GIVEN a viewport below 768px
- WHEN a RESUME detail panel opens
- THEN the panel renders below the LIST and scrolls internally when content overflows

#### Scenario: Focus moves with the panel

- GIVEN a LIST with the detail panel closed
- WHEN Enter opens the panel and Escape closes it
- THEN focus moves into the panel on open and returns to the list item on close
