# Delta for ambient-audio

## RENAMED Requirements

### Requirement: BYO licensed-track contract → Licensed track contract

(Reason: the track is now a bundled Pixabay-licensed derivative normally present in production, not a user-provided file)
(Migration: docs and tests referencing the BYO `/audio/background.mp3` placement update to the bundled licensed-derivative contract)

## MODIFIED Requirements

### Requirement: Licensed track contract

The system MUST NOT bundle any Persona/ATLUS soundtrack or SFX. It MUST ship exactly one licensed background track as an optimized derivative of the source `assets/music/background.mp3` (Pixabay Content License, see asset-provenance), normally present in production, loaded via `<audio loop preload="none">` so that zero track bytes are fetched before the user's first gesture. When the derivative is absent from the build, the system MUST treat this as the expected no-track product state: the site stays silent and the mute control renders the disabled no-track state. The system MUST NOT expose a direct download link or URL that serves the track bytes for standalone download. The track MUST persist across navigation and respect the persisted mute state.
(Previously: the track was user-provided (BYO) at `/audio/background.mp3`, absent by default, with no bundled derivative)

#### Scenario: Licensed derivative ships and loads lazily

- GIVEN the production build with the licensed derivative present
- WHEN the page loads before any user gesture
- THEN the mute control is enabled and zero track bytes are fetched until the first pointer or keyboard gesture

#### Scenario: No bundled official soundtrack

- GIVEN the built assets
- WHEN the audio output is inspected
- THEN no Persona/ATLUS soundtrack or SFX ships and the only audio present is the registered licensed derivative

#### Scenario: No direct download link

- GIVEN the production site
- WHEN its UI and output are inspected for audio download affordances
- THEN no direct link or URL offers the track bytes for standalone download

#### Scenario: Track persists through navigation and mute

- GIVEN audio enabled
- WHEN navigating to another route or toggling mute
- THEN the track continues per the persisted state and the mute state survives the navigation

## ADDED Requirements

### Requirement: Distinguishable no-track and error states

When the licensed derivative is absent, the system MUST treat this as the expected no-track product state: the site stays silent, the mute control renders its disabled no-track state, and no error is surfaced to the user. When a derivative file is present but fails to load, decode, or play back (a real runtime/media failure), the system MUST surface a distinct error state that is observable and distinguishable from no-track, for example a distinct control state plus an explicit log channel. In both states the system MUST remain silent, the mute control MUST remain keyboard-operable, and the control MUST convey its state to assistive technology (for example via `aria-pressed` and status text).

#### Scenario: Missing derivative is expected no-track

- GIVEN no derivative in the build
- WHEN the page loads
- THEN the site is silent, the control shows the disabled no-track state, and no error state appears

#### Scenario: Real failure is distinguishable

- GIVEN a derivative file present in the build
- WHEN the file fails to load, decode, or play back
- THEN a distinct error state appears that is observably different from the no-track state, and the site remains silent

#### Scenario: Control stays operable and accessible

- GIVEN either the no-track or the error state
- WHEN the mute control is focused and activated
- THEN the control remains keyboard-operable and its state is conveyed to assistive technology
