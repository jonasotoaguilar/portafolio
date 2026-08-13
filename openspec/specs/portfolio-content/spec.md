# Portfolio Content Specification

## Purpose

File-based single source of truth: projects, skills, and site config rendered by the portfolio views. Content is schema-validated at build time; invalid or incomplete content never ships.

## Requirements

### Requirement: Projects collection rendered once

The system MUST provide a `projects` content collection whose schema validates `title`, `description`, `stack[]`, `link`, `external`, and ordering. The PROJECTS view MUST render exactly the four declared projects, in declared order, exactly once. The build MUST fail on any schema violation, missing required field, or a collection with fewer or more than four entries.
(Previously: a featured flag drove two duplicated renderings — the Featured Work grid plus the Projects list)

#### Scenario: Four valid entries render once

- GIVEN four valid project entries (ServiceFlow, WealthQuest, EventCommerce, Fintual Sensor) with declared order
- WHEN the build runs and the PROJECTS view renders
- THEN exactly four list items appear once, in the declared order

#### Scenario: Schema violation fails the build

- GIVEN a project entry missing a required field such as `link`
- WHEN the build runs
- THEN the build fails with a schema error and produces no output

#### Scenario: Content completeness boundary

- GIVEN a projects collection with fewer or more than four entries
- WHEN the build runs
- THEN the build fails, enforcing the four-project boundary

### Requirement: Skills and site config collections

The system MUST provide grouped skills content (backend / frontend / tooling) without level numbers or fake metrics, and a site config providing name, role, tagline, focus areas, email, socials, and page title. The SKILLS view MUST render the configured groups as plain skill names; the CONTACT view MUST surface the configured email and the GitHub and WealthQuest links. Invalid content MUST fail the build.
(Previously: skills and config rendered in single-page sections)

#### Scenario: Grouped skills render without fake metrics

- GIVEN grouped skills content
- WHEN the SKILLS view renders
- THEN groups appear with plain skill names and no numeric levels

#### Scenario: Contact email comes from config

- GIVEN site config with email jonathansoto.dev@gmail.com
- WHEN the CONTACT view renders
- THEN the contact CTA surfaces that email

#### Scenario: CONTACT links verified

- GIVEN the CONTACT view rendered
- WHEN its links are checked
- THEN the email CTA, GitHub, and WealthQuest links are present and each resolves (E2E link check)

#### Scenario: Invalid config fails the build

- GIVEN malformed site config content
- WHEN the build runs
- THEN the build fails with a schema error
