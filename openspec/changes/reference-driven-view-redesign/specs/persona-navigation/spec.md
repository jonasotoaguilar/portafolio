# Delta for persona-navigation

## ADDED Requirements

### Requirement: Shell Tab-focus synchronization

While the shell menu is active, moving DOM focus with Tab or Shift+Tab MUST synchronize the keyboard cursor: the focused item MUST become the active item (`data-active` and `aria-current="page"` follow DOM focus), and Enter MUST activate the currently focused item even when focus arrived via Tab.

#### Scenario: Tab then arrows keep cursor coherent

- GIVEN the shell menu active
- WHEN Tab moves focus to SKILLS and then ArrowDown is pressed
- THEN the active indicator moves from SKILLS to CONTACT without teleporting to another item

#### Scenario: Tab directly to an item then Enter

- GIVEN the shell menu active
- WHEN Tab moves focus directly to RESUME and Enter is pressed
- THEN the RESUME route navigates, because the focused item equals the active item

### Requirement: Direct section navigation shortcut

The system MUST provide a direct section-navigation shortcut on every view: `Ctrl+Alt+ArrowRight` MUST advance and `Ctrl+Alt+ArrowLeft` MUST reverse through the ring ABOUT → RESUME → PROJECTS → SKILLS → CONTACT, wrapping at both ends. On the shell at `/` the shortcut MUST be inert. The shortcut MUST be modifier-qualified only: it MUST NOT intercept plain ArrowUp/ArrowDown/Enter/Escape or the shell menu keys, and list-view cursors MUST keep their unmodified arrow behavior. The shortcut MUST navigate to the destination route, MUST NOT carry a `#slug` fragment (the destination opens in its default state), and MUST land focus on the destination view's active entry point, including after a View Transition completes. With JavaScript disabled, navigation MUST remain fully possible via the plain link list.

#### Scenario: Forward cycle wraps

- GIVEN the CONTACT view rendered
- WHEN Ctrl+Alt+ArrowRight is pressed
- THEN the ABOUT view renders with the ring wrapped forward

#### Scenario: Home is inert

- GIVEN the shell at `/` rendered
- WHEN Ctrl+Alt+ArrowLeft or Ctrl+Alt+ArrowRight is pressed
- THEN no navigation occurs and the shell keeps its current active item

#### Scenario: No collision with list keys

- GIVEN a list view (e.g., PROJECTS) with a list item focused
- WHEN ArrowDown is pressed
- THEN the list cursor moves within the list and no section navigation occurs

#### Scenario: Focus lands on the destination entry point

- GIVEN the SKILLS view rendered
- WHEN Ctrl+Alt+ArrowRight is pressed
- THEN the CONTACT view renders and focus rests on its active entry point after the transition

#### Scenario: Fragment is dropped

- GIVEN the PROJECTS view at `/projects#serviceflow`
- WHEN Ctrl+Alt+ArrowLeft is pressed
- THEN the RESUME view renders with no URL fragment and no preset selection

## MODIFIED Requirements

### Requirement: Keyboard scope and focus restoration

While the shell menu is active, ArrowUp/ArrowDown MUST move the active item (wrapping at the ends) and Enter MUST activate it. On a view, ArrowUp/ArrowDown MUST move the single keyboard cursor — DOM focus and the active item MUST move together, so the focused item always equals the active item — Enter or ArrowRight MUST open the detail panel of the focused item, and Escape MUST close an open panel first and then navigate to `/`. On entering a view, focus MUST rest on the active LIST item. All key handlers MUST be scoped to the active screen: on any inactive screen these keys MUST NOT be intercepted. Closing a panel or leaving a screen MUST restore focus to the element that opened it. While the shell menu is active, Tab focus MUST be constrained within the menu.
(Previously: arrows moved only the active indicator and Enter could open the cursor item's panel while DOM focus diverged)

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

#### Scenario: List cursor keeps focus and active together

- GIVEN a list view rendered
- WHEN ArrowDown is pressed
- THEN DOM focus and the active item move to the next item together and Enter opens that item's panel

#### Scenario: Initial focus on the active item

- GIVEN a view entered with the third LIST item active
- WHEN the view renders and focus is inspected
- THEN focus rests on the active (third) item
