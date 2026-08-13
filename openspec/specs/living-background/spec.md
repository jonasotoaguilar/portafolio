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

With `prefers-reduced-motion: reduce`, the canvas MUST paint exactly one static frame and MUST NOT start its animation loop; the glow MUST hold without breathing animation.

#### Scenario: Static frame under reduced motion

- GIVEN `prefers-reduced-motion: reduce` emulated
- WHEN the page loads
- THEN exactly one static canvas frame is painted and no animation loop starts

#### Scenario: Loop runs by default

- GIVEN no reduced-motion preference
- WHEN the page loads
- THEN the animation loop runs continuously
