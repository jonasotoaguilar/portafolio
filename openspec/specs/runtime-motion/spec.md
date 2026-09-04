# Runtime Motion Specification

## Purpose

Motion stays interruptible and cheap: reduced motion is honored, pointer parallax is gated, `will-change` is transient, persist navigation does not leave stale motion, and global smooth scroll does not fight ClientRouter.

## Requirements

### Requirement: Reduced Motion Disables Non-Essential Motion

When `prefers-reduced-motion: reduce` is active, the system MUST NOT run entrance translation, ambient drift, or pointer parallax. Essential opacity or instant state changes MAY remain.

#### Scenario: Reduced motion on first load

- GIVEN the user prefers reduced motion
- WHEN any public route loads
- THEN no entrance translation, ambient drift, or parallax runs

#### Scenario: Reduced motion after ClientRouter

- GIVEN reduced motion and ClientRouter navigation or back-forward
- WHEN the new route is shown
- THEN non-essential motion remains off
- AND persisted decorative layers are not animating

### Requirement: Pointer Parallax Is Gated

Pointer-driven parallax MUST run only when hover is available and the pointer is fine, and MUST NOT run under reduced motion. Coarse pointer or no-hover environments MUST NOT attach that work.

#### Scenario: Fine pointer with hover enables parallax

- GIVEN hover and a fine pointer, without reduced motion
- WHEN the pointer moves over the decorative field
- THEN parallax tracking is active

#### Scenario: Coarse pointer or no hover skips parallax

- GIVEN a coarse pointer or no hover
- WHEN the route loads or is restored via ClientRouter
- THEN no pointer-driven parallax listener is active

### Requirement: Will-Change Is Transient

`will-change` MUST NOT remain on decorative or motion layers in the stylesheet as a standing hint. If used, it MUST be present only while motion is in progress and MUST be cleared when motion completes, is killed, or the document swaps.

#### Scenario: After motion completes, will-change is gone

- GIVEN a route that animates without reduced motion
- WHEN the animation finishes
- THEN affected elements do not retain `will-change`

#### Scenario: Persist swap clears motion hints

- GIVEN ClientRouter navigation or back-forward with persisted decorative layers
- WHEN swap completes
- THEN no stale `will-change` remains on those layers

### Requirement: Visible Route Transition

Route changes MUST be visibly legible at selected 250ms duration. Under `prefers-reduced-motion: reduce`, the system MUST collapse to instant opacity or no spatial transition.

#### Scenario: Happy path mid-transition opacity

- GIVEN reduced motion is not preferred
- WHEN ClientRouter navigates between public routes
- THEN an in-flight sample shows opacity in (0,1) before settle at 250ms

#### Scenario: Reduced motion collapses the route fade

- GIVEN reduced motion
- WHEN ClientRouter navigates
- THEN no 250ms spatial route transition runs

### Requirement: Visible Panel Entrance

Panel entrance MUST use 24px, 620ms, 80ms stagger, and `power3.out`. Salience MUST use a bounded in-flight sample. After complete, kill, or swap, transforms and `will-change` MUST be cleared.

#### Scenario: Happy path in-flight cascade

- GIVEN reduced motion is not preferred
- WHEN a route with panels loads
- THEN a pre-completion sample shows opacity in (0,1) or non-none transform using 24px, 620ms, 80ms, `power3.out`

#### Scenario: Cleanup after entrance

- GIVEN a panel entrance ran
- WHEN it completes, is killed, or the document swaps
- THEN those panels retain neither transform nor `will-change`

#### Scenario: Reduced motion panels

- GIVEN reduced motion
- WHEN any public route loads
- THEN panels MUST NOT translate

### Requirement: Fine Pointer Card Lift

Dossier cards MUST lift `-2px` only on fine hover without reduced motion. Coarse, no-hover, and reduced-motion MUST NOT move the card.

#### Scenario: Fine hover lifts

- GIVEN hover and a fine pointer, without reduced motion
- WHEN the pointer enters a dossier card
- THEN the card lifts `-2px`

#### Scenario: Coarse pointer has no lift

- GIVEN a coarse pointer or no hover
- WHEN a dossier card is shown or activated
- THEN no lift movement is applied

#### Scenario: Reduced motion has no lift

- GIVEN reduced motion
- WHEN a fine pointer hovers a dossier card
- THEN no lift movement is applied

### Requirement: Persisted Background Opacity Re-entry

Persisted decorative background MUST re-enter with opacity only at 250ms. It MUST NOT keep stale transforms or repeat full ambient setup.

#### Scenario: ClientRouter opacity re-entry

- GIVEN persisted background and no reduced motion
- WHEN ClientRouter returns to a route
- THEN re-entry is opacity-only at 250ms and layers are not transform-offset

#### Scenario: Reduced motion skips animated re-entry

- GIVEN reduced motion and persisted background
- WHEN ClientRouter returns
- THEN no 250ms ambient re-entry animation runs

### Requirement: Persist Teardown Before Swap

Motion timelines, RAF loops, and pointer listeners MUST be torn down before a ClientRouter swap and MUST NOT duplicate after `astro:page-load`. Back-forward MUST NOT leave offset or duplicated ambient timelines on persisted nodes. Opacity-only 250ms re-entry MAY run after teardown; full ambient setup MUST NOT repeat.

#### Scenario: Back-forward leaves no stale motion

- GIVEN the visitor navigates away and returns via back or forward
- WHEN the previous route is shown
- THEN pointer and ambient motion are not duplicated
- AND persisted layers are not offset from stale tracking

### Requirement: Smooth Scroll Does Not Compete With Navigation

The document MUST NOT apply site-wide smooth scrolling that delays ClientRouter scroll restoration or SkipLink focus. Native scrolling MUST remain. Global smooth scrolling MUST NOT be restored.

#### Scenario: ClientRouter restoration is instant

- GIVEN ClientRouter navigation to a route with a restored scroll position
- WHEN swap completes
- THEN restoration is not animated by site-wide smooth scroll

#### Scenario: SkipLink focus is not smoothed site-wide

- GIVEN SkipLink is activated
- WHEN focus moves to main content
- THEN movement is not delayed by site-wide smooth scroll

#### Scenario: Native scroll is retained

- GIVEN any public route
- WHEN the visitor scrolls
- THEN scrolling is native with no document-wide smooth-scroll rule
