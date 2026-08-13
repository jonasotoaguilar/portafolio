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
