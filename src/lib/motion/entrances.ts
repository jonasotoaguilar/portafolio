/** Ease-out curve for entrances (strong ease-out, DESIGN.md motion table). */
export const ENTRANCE_EASE: [number, number, number, number] = [
	0.23, 1, 0.32, 1,
];

export interface EntranceOptions {
	/** From-value vertical offset in px; 0 under reduced motion (opacity only). */
	y: number;
	/** Total duration in ms. */
	duration: number;
	/** Opacity keyframes from -> to. */
	opacity: [number, number];
	/** True when the entrance is opacity-only (reduced motion). */
	reduced: boolean;
}

/**
 * Motion contract (site-transitions spec): default entrances animate only
 * transform+opacity under 300ms; reduced-motion entrances are opacity-only
 * at most 200ms.
 */
export function entranceOptions(reducedMotion: boolean): EntranceOptions {
	if (reducedMotion) {
		return { y: 0, duration: 200, opacity: [0, 1], reduced: true };
	}
	return { y: 8, duration: 300, opacity: [0, 1], reduced: false };
}
