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

### Requirement: Persist Teardown Before Swap

Motion timelines, RAF loops, and pointer listeners MUST be torn down before a ClientRouter swap and MUST NOT duplicate after `astro:page-load`. Back-forward MUST NOT leave offset or running ambient motion on persisted nodes.

#### Scenario: Back-forward leaves no stale motion

- GIVEN the visitor navigates away and returns via back or forward
- WHEN the previous route is shown
- THEN pointer and ambient motion are not duplicated
- AND persisted layers are not offset from stale tracking

### Requirement: Smooth Scroll Does Not Compete With Navigation

The document MUST NOT apply site-wide smooth scrolling that delays ClientRouter scroll restoration or SkipLink focus movement.

#### Scenario: ClientRouter restoration is instant

- GIVEN ClientRouter navigation to a route with a restored scroll position
- WHEN swap completes
- THEN scroll restoration is not animated by a document-wide smooth-scroll rule

#### Scenario: SkipLink focus is not smoothed site-wide

- GIVEN SkipLink is activated
- WHEN focus moves to main content
- THEN movement is not delayed by a document-wide smooth-scroll rule
