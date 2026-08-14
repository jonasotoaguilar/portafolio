import {
	initNavigationEffects,
	teardownNavigationEffects,
} from "../lib/audio/effects";

// Navigation effect sounds lifecycle (effects.ts owns playback and the
// delegated wiring; this module keeps the wiring in sync with Astro view
// transitions the same way the shell/view/ambient scripts do). Runs once
// per document; nothing plays on initial load — sounds only follow user
// interaction.
document.addEventListener("astro:page-load", () => {
	teardownNavigationEffects();
	initNavigationEffects();
});
document.addEventListener("astro:before-swap", teardownNavigationEffects);
initNavigationEffects();
