# Ambient Audio Specification

## Purpose

Optional ambient background music via a BYO licensed track, with a keyboard-operable mute toggle, gesture-unlocked playback, and graceful no-track behavior. No bundled Persona soundtrack.

## Requirements

### Requirement: BYO licensed-track contract

The system MUST NOT bundle any Persona/ATLUS soundtrack or SFX. It MUST load a user-provided track only from `/audio/background.mp3` when present, using `<audio loop preload="none">`. When no track file exists, the site MUST remain silent and MUST render a graceful disabled no-track state on the mute control.

#### Scenario: No bundled audio

- GIVEN the built assets
- WHEN the audio directory is inspected
- THEN no copyrighted soundtrack file is shipped and the mute control shows the no-track state

#### Scenario: User track loads lazily

- GIVEN a licensed file at `/audio/background.mp3`
- WHEN the page loads
- THEN the track bytes are not loaded until playback begins

### Requirement: First-gesture playback policy

Playback MUST start silent and MUST NOT produce sound until the user's first `pointerdown` or `keydown` gesture; only after that gesture MAY playback begin at the persisted state.

#### Scenario: Silent until first gesture

- GIVEN a track present and no prior interaction
- WHEN the page loads
- THEN no audio plays until the first pointer or keyboard gesture

### Requirement: Keyboard-operable mute toggle

The mute control MUST be a button reachable by keyboard, MUST expose `aria-pressed` reflecting the muted/enabled state and a visible text label, and MUST toggle the audio on activation.

#### Scenario: Keyboard toggles mute

- GIVEN the mute control focused
- WHEN Enter or Space is pressed
- THEN the button toggles and `aria-pressed` and the visible label update

### Requirement: State persistence with safe failure

The mute/enabled state MUST persist to `localStorage`. When storage is unavailable or throws, the toggle MUST still function with an in-memory default and MUST NOT throw.

#### Scenario: State persists across reloads

- GIVEN a muted state saved
- WHEN the page reloads
- THEN the mute control restores the muted state

#### Scenario: Storage failure degrades safely

- GIVEN `localStorage` unavailable or throwing
- WHEN the mute control is used
- THEN the toggle still works in memory and no error surfaces

### Requirement: Transitions and navigation persistence

Audio state changes MUST fade over 200–450ms, and the enabled/muted state MUST persist across navigation between routes.

#### Scenario: Fade on toggle

- GIVEN audio playing
- WHEN muted
- THEN volume fades to silent over 200–450ms

#### Scenario: State survives navigation

- GIVEN a muted state
- WHEN navigating to another route
- THEN the muted state persists

### Requirement: Reduced-distraction expectations

Under `prefers-reduced-motion: reduce` the system MUST NOT start audio automatically, and the mute control MUST remain available.

#### Scenario: Reduced motion respects silence

- GIVEN `prefers-reduced-motion: reduce`
- WHEN the page loads
- THEN no audio plays automatically and the mute control remains operable

### Requirement: Audio documentation

A `public/audio/README.txt` MUST document the BYO contract: place a licensed track as `background.mp3`, use audio you own or have rights to, and avoid copyrighted music.

#### Scenario: BYO instructions present

- GIVEN the public audio directory
- WHEN the README is read
- THEN it states the licensed-track placement and the copyright warning
