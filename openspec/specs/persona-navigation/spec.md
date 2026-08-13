# Persona Navigation Specification

## Purpose

Game-menu shell navigation at `/`: a zero-JavaScript link list of five views, keyboard-first, with per-screen scoped key handling, focus restoration, and constrained focus while the shell menu is active.

## Requirements

### Requirement: Game-menu shell navigation

The system MUST render a full-screen game shell at `/` containing exactly five menu items — ABOUT, RESUME, PROJECTS, SKILLS, CONTACT — each linking to its own static route (`/about`, `/resume`, `/projects`, `/skills`, `/contact`). The menu MUST be centered or center-right and each item MUST be diagonally staggered with a distinct per-item offset/skew so items never overlap. On coarse-pointer viewports the stagger and skew MUST collapse so every item remains a non-colliding target of at least 44px. The shell MUST be fully operable without JavaScript: items MUST be real links in a plain list. The system MAY render gamepad hints (`GAMEPAD`/`↵` styled keys) as decoration only; the Gamepad API MUST NOT be used.
(Previously: five left-aligned uniform-size links with no diagonal stagger)

#### Scenario: Five items, five real routes

- GIVEN the root route rendered
- WHEN the menu items are inspected and each is activated
- THEN exactly five items exist and each navigates to its own static route

#### Scenario: Shell works with zero JS

- GIVEN JavaScript disabled
- WHEN the root route renders
- THEN the five menu items are visible as a plain link list and each navigates to its route

#### Scenario: Centered staggered menu

- GIVEN the root route rendered
- WHEN the menu items are inspected
- THEN the menu is horizontally centered or center-right and each item carries a distinct diagonal offset/skew with no overlapping items

#### Scenario: Coarse pointer collapses stagger

- GIVEN a coarse-pointer (touch) viewport
- WHEN the menu renders
- THEN the diagonal stagger collapses and every item remains a non-colliding target of at least 44px

### Requirement: Keyboard scope and focus restoration

While the shell menu is active, ArrowUp/ArrowDown MUST move the active item (wrapping at the ends) and Enter MUST activate it. On a view, ArrowUp/ArrowDown MUST move across LIST items, Enter or ArrowRight MUST open the detail panel, and Escape MUST close an open panel first and then navigate to `/`. All key handlers MUST be scoped to the active screen: on any inactive screen these keys MUST NOT be intercepted. Closing a panel or leaving a screen MUST restore focus to the element that opened it. While the shell menu is active, Tab focus MUST be constrained within the menu.
(Previously: keys scoped only to the overlay menu on the single page)

#### Scenario: Keyboard moves and activates

- GIVEN the shell menu active
- WHEN ArrowDown then Enter are pressed
- THEN the active item wraps and moves down, and Enter navigates to the item's route

#### Scenario: No hijack when inactive

- GIVEN a view rendered and the shell not active
- WHEN ArrowDown is pressed
- THEN no shell or inactive-screen handler reacts

#### Scenario: Escape hierarchy with focus restoration

- GIVEN a view with the detail panel open
- WHEN Escape is pressed, then Escape again
- THEN the first press closes the panel and restores focus to the list item, and the second navigates to `/`

#### Scenario: Focus constrained while open

- GIVEN the shell menu active
- WHEN Tab is pressed repeatedly
- THEN focus cycles only within the menu until navigation happens

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

### Requirement: Persistent keyboard-active indicator

The system MUST set `data-active` and `aria-current="page"` on the shell item keyboard navigation selects, and MUST render an unmistakable, persistent, colorful active treatment (accent text plus a distinct accent layer or highlight bar) that follows ArrowUp/ArrowDown movement. The `:focus-visible` outline MUST remain visible and MUST NOT be suppressed by the active treatment. Hover MUST apply the same active treatment. Items MUST remain real anchors with unchanged semantics.

#### Scenario: Active indicator follows arrows

- GIVEN the shell menu active
- WHEN ArrowDown is pressed
- THEN `data-active` and `aria-current="page"` move to the next item and the colorful indicator visibly follows

#### Scenario: Focus-visible never hidden

- GIVEN a keyboard-focused menu item
- WHEN the item is inspected
- THEN a visible `:focus-visible` outline renders alongside the active treatment and is not suppressed

#### Scenario: Hover mirrors active state

- GIVEN the menu rendered
- WHEN a menu item is hovered
- THEN the same colorful active treatment appears on the hovered item

### Requirement: Bottom-right control guidance

Keyboard/control guidance (key hints and the mute control) MUST render as a fixed bottom-right cluster that does not overlap the centered menu or other content at desktop widths. On coarse-pointer viewports the decorative hints MUST be hidden while interactive controls remain reachable. Guidance that duplicates real controls MUST remain `aria-hidden`.

#### Scenario: Hints cluster bottom-right without overlap

- GIVEN a desktop viewport
- WHEN the shell or a view renders
- THEN the control guidance renders in the bottom-right corner and does not overlap menu items or content

#### Scenario: Coarse pointer hides hints

- GIVEN a coarse-pointer viewport
- WHEN the page renders
- THEN the decorative hints are hidden and interactive controls remain reachable
