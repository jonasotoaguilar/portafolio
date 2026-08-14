import { seededRng } from "./particles";

/** Maximum sine-superposition bands (design: 3, deep→near). */
export const WAVE_BAND_CAP = 3;
/** Band-edge sampling step (~1 pt/8px, design budget). */
const SAMPLE_STEP = 8;

export interface WaveBand {
	baseY: number; // vertical center, fraction of canvas height
	amplitude: number; // px
	wavelength: number; // px per cycle
	thickness: number; // px
	phase: number; // radians; +speed per step
	speed: number; // radians per step
	color: string;
	alpha: number;
}
export interface WaveField {
	bands: WaveBand[];
	width: number;
	height: number;
}

/** Deep→near specs as [baseY, amplitude, wavelength, thickness, color, alpha]. */
const BAND_SPECS = [
	[0.35, 9, 420, 30, "rgb(13, 37, 96)", 0.4],
	[0.62, 13, 320, 38, "rgb(124, 146, 255)", 0.25],
	[0.9, 17, 230, 46, "rgb(56, 225, 255)", 0.18],
] as const;

/** Deterministic: same seed → identical geometry. */
export function createWaveField(
	seed: number,
	width: number,
	height: number,
): WaveField {
	const rng = seededRng(seed);
	const bands = BAND_SPECS.slice(0, WAVE_BAND_CAP).map((spec) => ({
		baseY: spec[0],
		amplitude: spec[1],
		wavelength: spec[2],
		thickness: spec[3],
		phase: rng() * Math.PI * 2,
		speed: 0.008 + rng() * 0.006,
		color: spec[4],
		alpha: spec[5],
	}));
	return { bands, width, height };
}

/** Advances every band phase (immutable, wrapped at 2π). */
export function stepWaves(field: WaveField): WaveField {
	return {
		...field,
		bands: field.bands.map((band) => ({
			...band,
			phase: (band.phase + band.speed) % (Math.PI * 2),
		})),
	};
}

/** Surface offset at x: main sine + counter-phase ripple. */
function bandOffset(band: WaveBand, x: number): number {
	const angle = (x / band.wavelength) * Math.PI * 2 + band.phase;
	const main = Math.sin(angle);
	const ripple = Math.sin(angle * 1.6129 - band.phase * 3.3129);
	return (main + ripple * 0.35) * band.amplitude;
}

/** Paints one filled wavy strip per band (one path + fill per band). */
export function renderWaves(
	field: WaveField,
	ctx: CanvasRenderingContext2D,
): void {
	for (const band of field.bands) {
		const base = band.baseY * field.height;
		ctx.fillStyle = band.color;
		ctx.globalAlpha = band.alpha;
		ctx.beginPath();
		ctx.moveTo(0, base + bandOffset(band, 0));
		for (let x = SAMPLE_STEP; x <= field.width; x += SAMPLE_STEP) {
			ctx.lineTo(x, base + bandOffset(band, x));
		}
		const edge = base + bandOffset(band, field.width) + band.thickness;
		ctx.lineTo(field.width, edge);
		for (let x = field.width - SAMPLE_STEP; x >= 0; x -= SAMPLE_STEP) {
			ctx.lineTo(x, base + bandOffset(band, x) + band.thickness);
		}
		ctx.closePath();
		ctx.fill();
	}
	ctx.globalAlpha = 1;
}
