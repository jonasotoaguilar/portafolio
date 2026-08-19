# Delta for site-transitions

## MODIFIED Requirements

### Requirement: Motion contract

UI motion MUST animate only `transform` and `opacity`, and every entrance, overlay, and route transition MUST complete within 400ms total, including any staggered sequence. Under reduced motion, all transitions, overlays, and entrances MUST become opacity-only, complete within 200ms, and MUST NOT include decorative travel — no sweeps, slides, or displacements. Layout properties MUST NOT be animated.
(Previously: entrances capped at 300ms with a separate 400ms overlay exception; no choreographed sequences)

#### Scenario: Default motion bounds

- GIVEN default motion preferences
- WHEN a choreographed entrance or route transition runs
- THEN only transform and opacity animate and the whole sequence completes within 400ms

#### Scenario: Reduced-motion transition

- GIVEN `prefers-reduced-motion: reduce`
- WHEN a transition or entrance runs
- THEN only opacity animates, the duration is at most 200ms, and no decorative travel occurs

## ADDED Requirements

### Requirement: Choreographed outgoing and incoming semantics

On navigation between routes, outgoing content MUST dissolve or recede toward its spatial edge and incoming content MUST enter from the edges, via named view-transition groups; where named groups are unsupported, navigation MUST fall back to full-page loads that still reach the target route. In-flight motion MUST be interruptible: a navigation that starts while a previous transition or entrance is running MUST cancel or retarget the running animation and complete promptly. Entrance sequences, including any stagger, MUST finish within the 400ms envelope.

#### Scenario: Outgoing recedes, incoming enters from edges

- GIVEN a browser with View Transitions support
- WHEN navigating between two routes
- THEN outgoing content dissolves toward its spatial edge while incoming content enters from the edges

#### Scenario: Interruptible rapid navigation

- GIVEN a transition in flight
- WHEN a second navigation starts before it finishes
- THEN the first animation is cancelled or retargeted and the second navigation completes promptly
