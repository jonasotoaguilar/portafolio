# Resume Content Specification

## Purpose

Schema-validated resume content typed from Jona's August 2026 CV: education, experience, projects, skills, and languages, rendered by the RESUME view. Privacy and accuracy contracts: the CV phone number and any fake ranks or metrics never ship.

## Requirements

### Requirement: Resume content typed from the CV

The system MUST provide a `resume` content collection whose schema validates education, experience, projects, skills, and languages. The RESUME view MUST render only verified CV facts: USACH computing/informatics (Mar 2020–Apr 2025) and technical telecommunications (Mar 2017–Nov 2019); Productos Barber Chile (2020–2026) and the Policomp IT support internship (Jan–Mar 2020); the ServiceFlow and WealthQuest projects, including the WealthQuest academic publication (May 2025); languages Spanish (native) and English (basic technical reading). The build MUST fail on any schema violation or missing required field.

#### Scenario: Verified CV facts render

- GIVEN the typed resume content
- WHEN the RESUME view renders
- THEN education, experience, projects, publication, and languages match the verified CV facts

#### Scenario: Schema violation fails the build

- GIVEN a resume entry missing a required field
- WHEN the build runs
- THEN the build fails with a schema error and produces no output

### Requirement: No phone and no fake ranks

The CV phone number MUST NOT appear in content files, rendered HTML, tests, or commit history. The schema MUST NOT define phone, rank, level, or metric fields; resume skills MUST be plain names. A review gate MUST scan the rendered output and fail the change when the phone number is present.

#### Scenario: Phone absent from output

- GIVEN the production build output
- WHEN the rendered HTML and content files are scanned for the CV phone number
- THEN no match exists anywhere

#### Scenario: No ranks or metrics

- GIVEN the resume schema and the rendered view
- WHEN fields and labels are inspected
- THEN no rank numbers, levels, or metrics are present — only plain skill names and verified facts

#### Scenario: Gate fails on phone leak

- GIVEN a rendered output containing the CV phone number
- WHEN the no-phone gate runs
- THEN the gate fails the change review
