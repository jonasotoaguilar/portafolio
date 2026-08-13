# Portfolio Content Specification

## Purpose

File-based single source of truth: projects, skills, and site config rendered by the portfolio page. Content is schema-validated at build time; invalid or incomplete content never ships.

## Requirements

### Requirement: Projects collection with featured flag

The system MUST provide a `projects` content collection whose schema validates `title`, `description`, `stack[]`, `link`, `external`, and ordering, plus an optional `featured` flag. The Featured Work and Projects sections MUST render exactly the four declared projects in declared order. When `featured` is absent, the system MUST treat the project as featured (default: all four). The build MUST fail on any schema violation or missing required field.

#### Scenario: Four valid entries render

- GIVEN four valid project entries (ServiceFlow, WealthQuest, EventCommerce, Fintual Sensor) with declared order
- WHEN the build runs and the index page renders
- THEN exactly four project cards appear in the declared order

#### Scenario: Schema violation fails the build

- GIVEN a project entry missing a required field such as `link`
- WHEN the build runs
- THEN the build fails with a schema error and produces no output

#### Scenario: Featured defaults to all four

- GIVEN project entries without a `featured` flag
- WHEN the Featured Work section renders
- THEN all four projects appear as featured

#### Scenario: Content completeness boundary

- GIVEN a projects collection with fewer or more than four entries
- WHEN the build runs
- THEN the build fails, enforcing the four-project completeness boundary

### Requirement: Skills and site config collections

The system MUST provide grouped skills content (backend / frontend / tooling) without level numbers or fake metrics, and a site config providing name, role, tagline, focus areas, email, socials, and page title. The Skills section MUST render the configured groups and the Contact section MUST surface the configured email. Invalid content MUST fail the build.

#### Scenario: Grouped skills render without fake metrics

- GIVEN grouped skills content
- WHEN the Skills section renders
- THEN groups appear with plain skill names and no numeric levels

#### Scenario: Contact email comes from config

- GIVEN site config with email jonathansoto.dev@gmail.com
- WHEN the Contact section renders
- THEN the contact CTA surfaces that email

#### Scenario: Invalid config fails the build

- GIVEN malformed site config content
- WHEN the build runs
- THEN the build fails with a schema error
