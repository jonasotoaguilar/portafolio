AMBIENT AUDIO — BRING YOUR OWN LICENSED TRACK
==============================================

This site ships NO bundled soundtrack. Ambient background music is
opt-in: place a single track you are licensed to use at:

    /audio/background.mp3

Rules:
- Use audio you own, or that you have explicit rights to stream and
  redistribute.
- Do NOT use copyrighted music — including any Persona / ATLUS
  soundtrack, remix, or sound effect. The site must never bundle it.
- MP3 format is required (the <audio> element expects it).

How it behaves:
- No track file? The site stays silent and the mute control shows a
  disabled no-track state. Nothing is downloaded.
- With a track: the file is probed once (HEAD request) and its bytes
  are only loaded when playback starts, after your first pointer or
  keyboard gesture on the page.
- The mute preference persists locally (localStorage key
  `portfolio:audio:muted`); playback never starts automatically.
