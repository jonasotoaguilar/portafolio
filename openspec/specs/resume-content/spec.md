# Resume Content Specification

## Purpose

Schema-validated, English-only resume content typed from Jona's August 2026 CV: the degree, professional experience with selectable descriptions, and the professional summary, rendered by the RESUME view. Projects and skills have their own views and never appear here. Privacy and accuracy contracts: the CV phone number and any fake ranks or metrics never ship.

## Requirements

### Requirement: Resume content typed from the CV

The system MUST provide a `resume` content collection whose schema validates the degree (institution, title, period), a non-empty professional experience list (company, role, period, description), and the professional summary. The RESUME view MUST render only verified CV facts: the USACH degree "Computer Science and Informatics Engineer" (Mar 2020–Apr 2025); the Productos Barber Chile experience (2020–2026) and the Policomp IT support internship (Jan–Mar 2020), each with a professional English description; and the professional summary. The collection MUST NOT carry projects, skills, or languages — those have dedicated views. The build MUST fail on any schema violation or missing required field.

#### Scenario: Verified CV facts render

- GIVEN the typed resume content
- WHEN the RESUME view renders
- THEN the degree, both experience entries with their selectable descriptions, and the professional summary match the verified CV facts

#### Scenario: Schema violation fails the build

- GIVEN a resume entry missing a required field
- WHEN the build runs
- THEN the build fails with a schema error and produces no output

### Requirement: No phone and no fake ranks

The CV phone number MUST NOT appear in content files, rendered HTML, tests, or commit history. The schema MUST NOT define phone, rank, level, or metric fields, and MUST reject project, skill, or language sections (they live in their own collections and views). A review gate MUST scan the rendered output and fail the change when the phone number is present.

#### Scenario: Phone absent from output

- GIVEN the production build output
- WHEN the rendered HTML and content files are scanned for the CV phone number
- THEN no match exists anywhere

#### Scenario: No ranks or metrics

- GIVEN the resume schema and the rendered view
- WHEN fields and labels are inspected
- THEN no rank numbers, levels, or metrics are present — only the verified degree, experience descriptions, and professional summary

#### Scenario: Gate fails on phone leak

- GIVEN a rendered output containing the CV phone number
- WHEN the no-phone gate runs
- THEN the gate fails the change review
