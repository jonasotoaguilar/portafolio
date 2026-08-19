# Delta for resume-content

## MODIFIED Requirements

### Requirement: Resume content typed from the CV

The system MUST provide a `resume` content collection whose schema validates education, experience, and languages. The RESUME view MUST render only verified CV facts: USACH computing/informatics (Mar 2020–Apr 2025) and technical telecommunications (Mar 2017–Nov 2019); Productos Barber Chile (2020–2026) and the Policomp IT support internship (Jan–Mar 2020); languages Spanish (native) and English (basic technical reading); and contact details sourced from site config. The RESUME view MUST NOT render projects, skills, or the academic publication — ServiceFlow, WealthQuest, the WealthQuest publication (May 2025), and all skill groups render in their own views. The build MUST fail on any schema violation or missing required field.
(Previously: the resume collection validated projects and skills and the RESUME view rendered them)

#### Scenario: Verified CV facts render

- GIVEN the typed resume content
- WHEN the RESUME view renders
- THEN education, experience, languages, and contact match the verified CV facts

#### Scenario: Schema violation fails the build

- GIVEN a resume entry missing a required field
- WHEN the build runs
- THEN the build fails with a schema error and produces no output

#### Scenario: Resume excludes projects and skills

- GIVEN the RESUME view rendered
- WHEN its sections are inspected
- THEN no projects, skills, or publication section renders; those items appear only on the PROJECTS and SKILLS views
