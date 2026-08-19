# Delta for living-background

## ADDED Requirements

### Requirement: Oceanic wave and particle canvas

The canvas layer MUST render procedural ocean waves together with the existing particles as decorative motion over the CSS layers. Waves MUST be generated procedurally — the canvas MUST NOT load image or media assets. The wave animation MUST respect the existing loop bounds: capped devicePixelRatio, capped particle/draw counts, and a paused loop while the tab is hidden. Under `prefers-reduced-motion: reduce`, the canvas MUST paint exactly one static frame that includes the waves and MUST NOT start the loop.

#### Scenario: Waves and particles animate by default

- GIVEN no reduced-motion preference
- WHEN the page loads
- THEN the canvas renders moving waves and particles behind content

#### Scenario: Waves are procedural

- GIVEN the page rendered
- WHEN the background's network and asset usage are inspected
- THEN no image or media file loads for the wave rendering

#### Scenario: Hidden tab pauses waves

- GIVEN the wave loop running
- WHEN the tab becomes hidden
- THEN the loop stops painting and resumes when the tab is visible again

#### Scenario: Static wave frame under reduced motion

- GIVEN `prefers-reduced-motion: reduce` emulated
- WHEN the page loads
- THEN exactly one static frame including the waves paints and no loop starts

### Requirement: White contrast-cut figure geometry

The decorative figure/artifact layer MUST apply white contrast cuts — white angular panels and cuts over the deep-ocean base — while remaining original vector/CSS geometry. The layer MUST stay `aria-hidden` and `pointer-events-none`, MUST render without JavaScript, and MUST NOT copy or bundle any copyrighted Persona/ATLUS art, fonts, or assets.

#### Scenario: White cuts render over the ocean base

- GIVEN the page rendered
- WHEN the figure layer is inspected
- THEN white angular contrast-cut geometry renders over the deep-ocean base as part of the figure/artifact layer

#### Scenario: Cuts stay decorative

- GIVEN the page rendered
- WHEN assistive technology and pointers interact with the figure layer
- THEN the layer remains hidden from assistive technology and pointer events pass through

### Requirement: Decorative sprite accents

Decorative accents sourced from `assets/sprites` MAY repeat across the background and figure/artifact layers as restrained patterns. Repeated sprites MUST remain `aria-hidden` and `pointer-events-none`, MUST NOT obscure text or controls, and MUST NOT reduce adjacent content below WCAG 2.2 AA contrast. Mockups and asset sheets MUST remain excluded from production (see asset-provenance).

#### Scenario: Repeated sprite patterns stay decorative

- GIVEN the page rendered with repeated `assets/sprites` accents across the background layers
- WHEN assistive technology and pointers interact and content over the accents is inspected
- THEN the accents remain hidden from assistive technology, pointer events pass through, and content stays readable at AA contrast
