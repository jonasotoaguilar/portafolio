import { expect, type Page, test } from "@playwright/test";

interface EntranceSample {
	t: number;
	opacity: string;
	transform: string;
}

const entranceSamples = (page: Page) =>
	page.evaluate(
		() =>
			(window as unknown as { __entranceSamples: EntranceSample[] })
				.__entranceSamples,
	);

const canvasDataUrl = (page: Page) =>
	page.evaluate(() =>
		(
			document.getElementById("living-background") as HTMLCanvasElement
		).toDataURL(),
	);

test.describe("reduced motion", () => {
	test("canvas paints one static frame with no ongoing progression", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/");
		await expect(page.locator("#living-background")).toBeVisible();
		const samples = await page.evaluate(async () => {
			const canvas = document.getElementById(
				"living-background",
			) as HTMLCanvasElement;
			const first = canvas.toDataURL();
			await new Promise((resolve) => setTimeout(resolve, 250));
			return [first, canvas.toDataURL()];
		});
		expect(samples[0]).toBe(samples[1]);
	});

	test("glow layer holds without breathing animation", async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/");
		const glow = await page.locator(".glow-layer").evaluate((el) => {
			const style = getComputedStyle(el);
			return { animation: style.animationName, opacity: style.opacity };
		});
		expect(glow.animation).toBe("none");
		expect(glow.opacity).toBe("1");
	});

	test("entrances are opacity-only and at most 200ms", async ({ page }) => {
		await page.addInitScript(() => {
			const samples: EntranceSample[] = [];
			(
				window as unknown as { __entranceSamples: typeof samples }
			).__entranceSamples = samples;
			const start = performance.now();
			const frame = () => {
				const element = document.querySelector<HTMLElement>("[data-entrance]");
				if (element) {
					const style = getComputedStyle(element);
					samples.push({
						t: performance.now() - start,
						opacity: style.opacity,
						transform: style.transform,
					});
				}
				if (samples.length < 1000) requestAnimationFrame(frame);
			};
			requestAnimationFrame(frame);
		});
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/");

		await expect
			.poll(
				async () =>
					(await entranceSamples(page)).filter((s) => s.opacity !== "1").length,
				{ timeout: 15000 },
			)
			.toBeGreaterThan(0);
		const samples = await entranceSamples(page);
		const transitions = samples.filter((sample) => sample.opacity !== "1");
		expect(new Set(samples.map((sample) => sample.transform)).size).toBe(1);
		const first = transitions[0]?.t ?? 0;
		const last = transitions[transitions.length - 1]?.t ?? 0;
		expect(last - first).toBeLessThanOrEqual(240);
		expect(last).toBeLessThanOrEqual(1000);
	});

	test("animation loop runs continuously by default", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("#living-background")).toBeVisible();
		const initial = await canvasDataUrl(page);
		await expect
			.poll(() => canvasDataUrl(page), { timeout: 2000 })
			.not.toBe(initial);
	});
});

test.describe("figure layer", () => {
	// Decorative figure/artifact layer (living-background spec scenarios
	// "Original abstract figures render over atmosphere" / "Figures are
	// decoration only" / "Figures static under reduced motion"; design AD3):
	// one original inline-SVG composition per route, fixed between the canvas
	// and content, aria-hidden, pointer-events-none, zero JS, and fully static
	// under prefers-reduced-motion. Placements below encode the design route
	// variants (DESIGN.md figure placements): shell/404 oversized right half,
	// projects cyan top band, skills right figure framing the center, about
	// bottom-left, contact bottom blue wash + left figure, resume left-mid.
	const figureLayer = (page: Page) => page.locator(".figure-layer");

	const layerStyle = (page: Page) =>
		figureLayer(page).evaluate((el) => {
			const style = getComputedStyle(el);
			return {
				pointerEvents: style.pointerEvents,
				zIndex: style.zIndex,
				animation: style.animationName,
				transition: style.transitionDuration,
				opacity: style.opacity,
				transform: style.transform,
			};
		});

	const ROUTE_PLACEMENTS: [
		string,
		{ left: number; top: number; width: number; height: number },
	][] = [
		["/", { left: 640, top: 0, width: 640, height: 720 }],
		["/projects", { left: 0, top: 0, width: 1280, height: 288 }],
		["/skills", { left: 665.6, top: 0, width: 614.4, height: 720 }],
		["/about", { left: 0, top: 273.6, width: 704, height: 446.4 }],
		["/contact", { left: 0, top: 324, width: 1280, height: 396 }],
		["/resume", { left: 0, top: 86.4, width: 537.6, height: 547.2 }],
		["/404", { left: 640, top: 0, width: 640, height: 720 }],
	];

	test("decorative figure renders above the atmosphere and below content", async ({
		page,
	}) => {
		await page.goto("/");
		const layer = figureLayer(page);
		await expect(layer).toBeVisible();
		await expect(layer).toHaveAttribute("aria-hidden", "true");
		await expect(layer.locator("svg")).toHaveCount(1);
		const style = await layerStyle(page);
		expect(style.pointerEvents).toBe("none");
		expect(style.zIndex).toBe("-1");
		// Same negative z-index layer as the canvas, painted after it in DOM
		// order, so the figure sits above the animated atmosphere and below
		// content (stacking: glow -> scanlines -> canvas -> figure -> content).
		// compareDocumentPosition returns PRECEDING when the canvas (other)
		// precedes the figure (this node).
		const paintsAboveCanvas = await page.evaluate(() => {
			const canvas = document.getElementById("living-background");
			const figure = document.querySelector(".figure-layer");
			if (!canvas || !figure) return false;
			return (
				(figure.compareDocumentPosition(canvas) &
					Node.DOCUMENT_POSITION_PRECEDING) !==
				0
			);
		});
		expect(paintsAboveCanvas).toBe(true);
	});

	test("figures render static under reduced motion", async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		for (const path of ["/", "/projects"]) {
			await page.goto(path);
			await expect(figureLayer(page)).toBeVisible();
			const style = await layerStyle(page);
			expect(style.animation, `${path} no animation`).toBe("none");
			expect(style.transition, `${path} no transition`).toBe("0s");
			expect(style.opacity, `${path} fully opaque`).toBe("1");
			expect(style.transform, `${path} no transform`).toBe("none");
		}
	});

	test("every route places its own figure variant", async ({ page }) => {
		for (const [path, expected] of ROUTE_PLACEMENTS) {
			await page.goto(path);
			const layer = figureLayer(page);
			await expect(layer, `${path} figure visible`).toBeVisible();
			await expect(layer).toHaveAttribute("aria-hidden", "true");
			const actual = await layer.evaluate((el) => {
				const style = getComputedStyle(el);
				return {
					left: parseFloat(style.left),
					top: parseFloat(style.top),
					width: parseFloat(style.width),
					height: parseFloat(style.height),
				};
			});
			for (const key of ["left", "top", "width", "height"] as const) {
				expect(
					Math.abs(actual[key] - expected[key]),
					`${path} ${key} placement (got ${actual[key]})`,
				).toBeLessThanOrEqual(2);
			}
		}
	});
});
