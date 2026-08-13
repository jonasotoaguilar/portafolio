# Site Transitions Specification

## Purpose

Cross-page motion between index and 404 via native View Transitions, with canvas persistence and a strict motion contract.

## Requirements

### Requirement: View transitions with fallback

The system MUST enable native view transitions for navigation between the index and 404 pages. When the browser does not support them, navigation MUST fall back to full-page loads that still reach the target page.

#### Scenario: Transition plays when supported

- GIVEN a browser with View Transitions support
- WHEN navigating between index and 404
- THEN the page transition animation plays and the target content renders

#### Scenario: Full-page fallback

- GIVEN a browser without View Transitions support
- WHEN navigating between pages
- THEN the browser performs a full-page load and the target page renders

### Requirement: Canvas persistence

The canvas background layer MUST persist across view transitions without restarting or flickering.

#### Scenario: Canvas survives navigation

- GIVEN the canvas layer running on the index page
- WHEN navigating to the 404 page and back
- THEN the same canvas element persists and the animation continues without restart

### Requirement: Motion contract

UI motion MUST animate only `transform` and `opacity`, complete under 300ms (overlay moments MAY use up to 400ms as a documented exception), and under reduced motion MUST become opacity-only transitions of at most 200ms. Layout properties MUST NOT be animated.

#### Scenario: Default motion bounds

- GIVEN default motion preferences
- WHEN an entrance or transition runs
- THEN only transform and opacity animate and the duration stays under 300ms (400ms exception for overlay moments)

#### Scenario: Reduced-motion transition

- GIVEN `prefers-reduced-motion: reduce`
- WHEN a transition or entrance runs
- THEN only opacity animates and the duration is at most 200ms
