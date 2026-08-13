# Delta for Portfolio Page

## ADDED Requirements

### Requirement: Coherent visual-system remediation

The shell and all five view routes MUST apply the remediated visual system based on the reference composition — blue/cyan/white accents, angular shapes, the oversized abstract figure, the centered/staggered menu, and the bottom-right guidance — so every route reads as one coherent game-shell system. The remediation MUST preserve static routes and zero-JS readability: without JavaScript every route MUST still render all content in normal document flow.

#### Scenario: All routes share the visual system

- GIVEN any of the six routes rendered
- WHEN the page is inspected
- THEN the route shows the coherent blue/cyan/white angular composition with the figure and bottom-right guidance

#### Scenario: Zero-JS readability preserved

- GIVEN JavaScript disabled
- WHEN any route renders
- THEN all content is visible in normal document flow with the static figure layer present

### Requirement: Remediation regression boundaries

The remediation MUST NOT regress existing contracts: every route MUST stay below 100KB gzipped JavaScript including the new audio script and figure layer, motion MUST stay within the 400ms transition envelope, and the active indicator and mute control MUST remain keyboard-operable. Automated tests MUST assert the shell `aria-current`/`data-active`, keyboard operability of the mute toggle, and that figures are hidden from assistive technology.

#### Scenario: Budget holds with new assets

- GIVEN the production build with the audio and figure layers
- WHEN gzipped JavaScript is measured per route
- THEN each route stays below 100KB

#### Scenario: Regression tests assert new contracts

- GIVEN the e2e suite
- WHEN it runs
- THEN it asserts the shell `aria-current`/`data-active`, keyboard mute operability, and figure `aria-hidden`

### Requirement: Documentation synchronization

PRD, DESIGN, and ARCHITECTURE MUST be updated to describe the remediated visual system — menu composition, persistent active indicator, decorative figure layer, bottom-right guidance, and the ambient-audio capability — and the setup/audio documentation MUST describe the BYO `/audio/background.mp3` contract.

#### Scenario: Design docs reflect the remediation

- GIVEN the documentation
- WHEN PRD, DESIGN, and ARCHITECTURE are read
- THEN each describes the remediated composition, indicator, figure layer, guidance cluster, and audio capability

#### Scenario: Audio setup documented

- GIVEN the setup/audio docs
- WHEN the audio contract is read
- THEN the BYO licensed-track path and the no-track state are described
