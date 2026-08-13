# Site Transitions Specification

## Purpose

Cross-page motion between the shell, any of the five view routes, and the 404 page via native View Transitions, with canvas persistence and a strict motion contract.

## Requirements

### Requirement: View transitions with fallback

The system MUST enable native view transitions for navigation between the shell, any of the five view routes, and the 404 page. When the browser does not support them, navigation MUST fall back to full-page loads that still reach the target page.
(Previously: transitions only between the index and 404 pages)

#### Scenario: Transition plays between menu and views

- GIVEN a browser with View Transitions support
- WHEN navigating from the shell to a view and back
- THEN the page transition animation plays and the target content renders

#### Scenario: Full-page fallback

- GIVEN a browser without View Transitions support
- WHEN navigating between pages
- THEN the browser performs a full-page load and the target page renders

### Requirement: Canvas persistence

The canvas background layer MUST persist across view transitions between any routes without restarting or flickering.

#### Scenario: Canvas survives navigation

- GIVEN the canvas layer running on the shell
- WHEN navigating to a view and back
- THEN the same canvas element persists and the animation continues without restart

### Requirement: Motion contract

UI motion MUST animate only `transform` and `opacity`, and complete under 300ms; per-view transition overlays MUST complete within 400ms total (300ms default, 400ms documented exception). Under reduced motion, transitions and overlays MUST become opacity-only of at most 200ms with no sweeps. Layout properties MUST NOT be animated.
(Previously: 300ms default with a 400ms exception; per-view overlays did not yet exist)

#### Scenario: Default motion bounds

- GIVEN default motion preferences
- WHEN a menu-to-view transition or entrance runs
- THEN only transform and opacity animate, entrances stay under 300ms, and overlays under 400ms total

#### Scenario: Reduced-motion transition

- GIVEN `prefers-reduced-motion: reduce`
- WHEN a transition or overlay runs
- THEN only opacity animates and the duration is at most 200ms
