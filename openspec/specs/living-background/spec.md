# Living Background Specification

## Purpose

Fixed three-layer decorative background — CSS glow, CSS scanlines, Canvas 2D particles — providing ambient Persona-3 atmosphere without ever blocking content.

## Requirements

### Requirement: Layered decorative background

The system MUST render glow and scanlines as fixed full-viewport CSS layers and the canvas layer behind content, all `pointer-events-none` and `aria-hidden`. Content MUST render and remain fully usable when the canvas is unsupported or JavaScript is disabled; glow and scanlines MUST still render in those cases.

#### Scenario: Zero-JS still shows the static layers

- GIVEN JavaScript disabled
- WHEN the page renders
- THEN content, glow, and scanlines are visible and no canvas layer exists

#### Scenario: Canvas unsupported degrades gracefully

- GIVEN a browser without Canvas 2D support
- WHEN the page renders
- THEN content remains usable with glow and scanlines present

#### Scenario: Layers never intercept input

- GIVEN the page rendered
- WHEN an interaction targets the background area
- THEN the event passes through the decorative layers to content

### Requirement: Canvas loop bounds

The canvas animation MUST cap particle count and devicePixelRatio, and MUST pause its animation loop when the tab is hidden and resume when visible.

#### Scenario: Hidden tab pauses the loop

- GIVEN the canvas loop running
- WHEN the tab becomes hidden
- THEN the loop stops and no frames are painted; when visible again, the loop resumes

#### Scenario: Display scale capped

- GIVEN a high-DPR display
- WHEN the canvas initializes
- THEN rendering uses a capped devicePixelRatio and a capped particle count

### Requirement: Reduced-motion static frame

With `prefers-reduced-motion: reduce`, the canvas MUST paint exactly one static frame and MUST NOT start its animation loop; the glow MUST hold without breathing animation; and the decorative figure/artifact layer MUST render static with no transform, opacity, or entrance motion.
(Previously: reduced motion covered only the canvas and glow, not the figure layer)

#### Scenario: Static frame under reduced motion

- GIVEN `prefers-reduced-motion: reduce` emulated
- WHEN the page loads
- THEN exactly one static canvas frame is painted and no animation loop starts

#### Scenario: Loop runs by default

- GIVEN no reduced-motion preference
- WHEN the page loads
- THEN the animation loop runs continuously

#### Scenario: Figures static under reduced motion

- GIVEN `prefers-reduced-motion: reduce` emulated
- WHEN the page loads
- THEN the figure/artifact layer renders static with no motion

### Requirement: Decorative figure and artifact layer

The system MUST render an original, abstract protagonist silhouette/figure plus blue/cyan/white angular artifact layers as a decorative layer between the canvas and content, layered over the existing glow/scanlines/particle atmosphere. The layer MUST be `aria-hidden` and `pointer-events-none`, MUST render without JavaScript, and MUST NOT copy or bundle any copyrighted Persona/ATLUS character art, fonts, or assets — all figures MUST be original vector/CSS geometry.

#### Scenario: Original abstract figures render over atmosphere

- GIVEN the page rendered
- WHEN the background layers are inspected
- THEN an abstract silhouette figure and angular blue/cyan/white artifacts render above the canvas and below content

#### Scenario: Figures are decoration only

- GIVEN the page rendered
- WHEN an assistive technology and a pointer interact with the figure layer
- THEN the layer is hidden from assistive technology and pointer events pass through

#### Scenario: No copied assets bundled

- GIVEN the source and built assets
- WHEN bundled assets are inspected
- THEN no character art, game fonts, or audio from the reference repos is present
