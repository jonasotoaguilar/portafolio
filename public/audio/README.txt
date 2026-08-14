AMBIENT AUDIO — LICENSED DERIVATIVE (MAINTENANCE)
=================================================

The site ships a committed ambient track: `background.mp3` is a
deterministic derivative of the licensed Pixabay source
`assets/music/background.mp3` ("Acid Jazz Groove" by alex-morgan,
https://pixabay.com/music/cafe-acid-jazz-groove-517096/, Pixabay Content
License — commercial use and modification permitted, standalone
redistribution prohibited).

Rules:
- The raw source never ships; only this derivative is served.
- Regenerate with the pinned ffmpeg flags (ADR-0006):

      node scripts/optimize-audio.mjs

  The script re-encodes with `-c:a libmp3lame -b:a 128k -ar 48000
  -joint_stereo 1` and prints the derivative sha256 — record it in
  `assets/PROVENANCE.yaml` under `music[].derivative-sha256`, which the
  provenance gate (`pnpm run gate:provenance`) verifies against the
  committed file.
- Do not add other audio files here: the provenance gate rejects any
  audio in `dist` other than this registered derivative.
- The runtime never exposes a download link for this file; playback
  starts only after the first pointer/keyboard gesture (browser
  autoplay policy), the mute preference persists in localStorage
  (`portfolio:audio:muted`), and the no-track/error fallbacks keep the
  site silent if the derivative is absent.
