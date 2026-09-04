# Delta for Runtime Performance

## ADDED Requirements

### Requirement: Scroll Trace Before Paint Optimization

Before any blur, clip, or fixed-layer paint optimization, the system MUST capture a scroll frame trace on `/projects` and `/experience` at desktop and mobile viewports, three repeats each. Evidence MUST report frame, main-thread, and paint attribution. Capturing the trace MUST NOT promise a paint change. Salience evidence MUST NOT substitute for this performance evidence.

#### Scenario: Happy path measurement completes

- GIVEN comparable production-preview conditions
- WHEN `/projects` and `/experience` are traced at desktop and mobile, three repeats
- THEN evidence reports frame, main-thread, and paint attribution
- AND no paint change is implied by capturing the trace

#### Scenario: Trace-pass ships no paint change

- GIVEN that matrix and three repeats
- WHEN median FPS is not below 50 and long tasks aligned to ghost, clip, or fixed layers are not more than 2 in 2 of 3 runs
- THEN no blur or fixed-layer code change ships
- AND the summary records attribution without a paint-improvement claim

#### Scenario: Trace-fail authorizes a bounded candidate

- GIVEN that matrix and three repeats
- WHEN median FPS is below 50 or more than 2 aligned long tasks occur in 2 of 3 runs
- THEN at most one bounded paint candidate on the attributed layer MAY be authorized
- AND no paint change ships until that gate fails

#### Scenario: ClientRouter revisit is included

- GIVEN a fresh load trace for `/projects` or `/experience`
- WHEN the same route is traced after ClientRouter away and back
- THEN attribution includes persisted decorative layers
- AND the run still does not itself change paint code

### Requirement: Paint Change Is Trace-Gated And Single-Variable

Any paint optimization MUST be conditional on a failing scroll-trace gate, MUST change one measured variable at a time, and MUST NOT claim improvement inside run-to-run variance. Motion salience MUST be evaluated separately from frame metrics.

#### Scenario: One variable after a failing gate

- GIVEN a failing trace gate and a single attributed bottleneck
- WHEN a paint change is applied
- THEN exactly one variable is changed before re-measure
- AND salience pass or fail is recorded separately from FPS

#### Scenario: Inside variance is not an improvement

- GIVEN comparable before/after scroll traces
- WHEN the FPS or long-task delta is within documented variance
- THEN no paint improvement is claimed
- AND the candidate is not kept as a performance win

#### Scenario: Edge case gate without attribution

- GIVEN traces that miss frame, main-thread, or paint attribution
- WHEN a paint change is proposed
- THEN the change MUST NOT ship
