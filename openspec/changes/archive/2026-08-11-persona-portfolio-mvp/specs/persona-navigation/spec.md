# Persona Navigation Specification

## Purpose

Hybrid navigation: a compact anchor nav that works with zero JavaScript, plus a full-screen overlay menu as progressive enhancement, keyboard-first and accessibility-safe.

## Requirements

### Requirement: Hybrid navigation

The system MUST render a compact anchor nav (Featured Work, Projects, Skills, Contact) that works without JavaScript. When JavaScript is available, the system MAY provide a full-screen overlay menu as an enhancement; the compact nav MUST remain functional either way.

#### Scenario: Compact nav with zero JS

- GIVEN JavaScript disabled
- WHEN the page renders
- THEN the compact nav is visible and its links navigate to section anchors

#### Scenario: Overlay as enhancement

- GIVEN JavaScript enabled
- WHEN the menu trigger is activated
- THEN the overlay menu opens with staggered item entrances

### Requirement: Keyboard scope and focus restoration

While the overlay is open, ArrowUp/ArrowDown MUST move the active item and Enter MUST activate it. These key handlers MUST be scoped to the open menu: with the menu closed, arrow keys MUST NOT be intercepted and page scroll MUST behave normally. Closing the menu MUST restore focus to the element that opened it. While open, Tab focus MUST be constrained within the menu; Escape MUST close it.

#### Scenario: Keyboard moves and activates

- GIVEN the overlay open with focus inside
- WHEN ArrowDown then Enter are pressed
- THEN the active item moves down, the Enter activation navigates to its section, and the overlay closes

#### Scenario: No hijack when closed

- GIVEN the overlay closed
- WHEN ArrowDown is pressed
- THEN the page scrolls normally and no menu handler reacts

#### Scenario: Focus restored on close

- GIVEN the overlay open
- WHEN the overlay closes (Escape or activation)
- THEN focus returns to the element that opened it

#### Scenario: Focus constrained while open

- GIVEN the overlay open
- WHEN Tab is pressed repeatedly
- THEN focus cycles only within the overlay until it closes

### Requirement: Touch targets, focus visibility, external links

Interactive navigation elements MUST be at least 44px tall and MUST show a visible `:focus-visible` state in the accent family. External links MUST open in a new tab with `rel="noopener noreferrer"`.

#### Scenario: Adequate targets and visible focus

- GIVEN the nav rendered
- WHEN targets are measured and the keyboard is used
- THEN every interactive element is at least 44px tall and shows a visible focus state

#### Scenario: External links open safely

- GIVEN an external link (e.g., WealthQuest)
- WHEN it is activated
- THEN it opens in a new tab with `rel="noopener noreferrer"`
