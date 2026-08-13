# Delta for Persona Navigation

## MODIFIED Requirements

### Requirement: Game-menu shell navigation

The system MUST render a full-screen game shell at `/` containing exactly five menu items — ABOUT, RESUME, PROJECTS, SKILLS, CONTACT — each linking to its own static route (`/about`, `/resume`, `/projects`, `/skills`, `/contact`). The shell MUST be fully operable without JavaScript: items MUST be real links in a plain list. The system MAY render gamepad hints (`GAMEPAD`/`↵` styled keys) as decoration only; the Gamepad API MUST NOT be used.
(Previously: compact anchor nav plus a JavaScript-only overlay menu over one page)

#### Scenario: Five items, five real routes

- GIVEN the root route rendered
- WHEN the menu items are inspected and each is activated
- THEN exactly five items exist and each navigates to its own static route

#### Scenario: Shell works with zero JS

- GIVEN JavaScript disabled
- WHEN the root route renders
- THEN the five menu items are visible as a plain link list and each navigates to its route

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
