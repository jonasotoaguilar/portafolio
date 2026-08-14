// Audio level constants — the single tuning point for the ambient/effects
// balance. Element volumes are 0..1.

// Ambient music base volume: the background bed is intentionally very quiet
// so it never competes with the menu voice or the navigation effects.
// ambient-audio ramps the ambient <audio> element to this target on playback.
export const AMBIENT_VOLUME = 0.1;

// Navigation effect volume: clearly above the ambient target (0.65 vs 0.1)
// so click/select/close feedback is always audible over the music, yet below
// a typical full-scale UI click so repeated key/hover feedback stays subtle.
export const EFFECT_VOLUME = 0.65;
