import { expect, type Page, test } from "@playwright/test";

interface VtSample {
	pseudo: string;
	total: number;
	properties: string[];
}

// Compact click-driven sampler for ::view-transition overlays (same approach
// as views.spec.ts): reports every overlay animation observed within the
// window so return-direction hops can be timed.
async function installVtSampler(page: Page): Promise<void> {
	await page.addInitScript(() => {
		(window as unknown as { __clickAndSampleVt: unknown }).__clickAndSampleVt =
			(href: string, waitMs = 1200): Promise<VtSample[]> =>
				new Promise((resolve) => {
					const samples: VtSample[] = [];
					const start = performance.now();
					const record = () => {
						try {
							for (const animation of document.getAnimations()) {
								const effect = animation.effect as KeyframeEffect | null;
								if (!effect) continue;
								const pseudo = effect.pseudoElement ?? "";
								if (!pseudo.includes("view-transition")) continue;
								const timing = effect.getComputedTiming();
								const keyframes =
									(effect.getKeyframes() as Record<string, string>[]) ?? [];
								const properties = [
									...new Set(
										keyframes.flatMap((frame: Record<string, string>) =>
											Object.keys(frame).filter(
												(key) =>
													![
														"offset",
														"composite",
														"easing",
														"computedOffset",
													].includes(key),
											),
										),
									),
								].sort();
								samples.push({
									pseudo,
									total:
										Number(timing.delay) +
										Number(timing.duration) +
										Number(timing.endDelay),
									properties,
								});
							}
						} catch {
							// ignore per-frame teardown races
						}
					};
					const frame = () => {
						record();
						if (performance.now() - start < waitMs) {
							requestAnimationFrame(frame);
						} else {
							resolve(samples);
						}
					};
					requestAnimationFrame(frame);
					const link =
						document.querySelector<HTMLAnchorElement>(`a[href="${href}"]`) ??
						Object.assign(document.createElement("a"), { href });
					if (!link.isConnected) document.body.append(link);
					link.click();
				});
	});
}

const sampleVt = (page: Page, href: string) =>
	page.evaluate(
		(hrefToClick) =>
			(
				window as unknown as {
					__clickAndSampleVt: (href: string) => Promise<VtSample[]>;
				}
			).__clickAndSampleVt(hrefToClick),
		href,
	);

const canvasState = (page: Page) =>
	page.evaluate(() => {
		const canvas = document.getElementById(
			"living-background",
		) as HTMLCanvasElement & {
			__p3probe?: string;
			livingBackgroundField?: { particles: unknown[] };
		};
		if (!canvas) return { found: false };
		return {
			found: true,
			marker: canvas.__p3probe ?? null,
			canvasCount: document.querySelectorAll("canvas").length,
			particles: canvas.livingBackgroundField?.particles.length ?? -1,
		};
	});

test.describe("return-direction transitions and canvas persistence", () => {
	const assertOverlayContract = (samples: VtSample[], maxMs: number) => {
		expect(samples.length).toBeGreaterThanOrEqual(2);
		for (const sample of samples) {
			expect(sample.pseudo).toMatch(/::view-transition-/);
			expect(sample.total).toBeLessThanOrEqual(maxMs);
			for (const property of sample.properties) {
				expect(["opacity", "transform"]).toContain(property);
			}
		}
	};

	test("view-to-shell return overlay completes within 400ms", async ({
		page,
	}) => {
		await installVtSampler(page);
		await page.goto("/about");
		const samples = await sampleVt(page, "/");

		assertOverlayContract(samples, 400);
		await expect(
			page.getByRole("navigation", { name: "Game menu" }),
		).toBeVisible();
	});

	test("shell-to-404 and 404-to-shell overlays both complete within 400ms", async ({
		page,
	}) => {
		await installVtSampler(page);
		await page.goto("/");
		const to404 = await sampleVt(page, "/missing-page-xyz");
		assertOverlayContract(to404, 400);
		await expect(
			page.getByRole("heading", { level: 1, name: "404" }),
		).toBeVisible();

		const back = await sampleVt(page, "/");
		assertOverlayContract(back, 400);
		await expect(
			page.getByRole("navigation", { name: "Game menu" }),
		).toBeVisible();
	});

	test("the persisted canvas is the same element and keeps its animation across navigation", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(page.locator("#living-background")).toBeVisible();
		await page.evaluate(() => {
			const canvas = document.getElementById(
				"living-background",
			) as HTMLCanvasElement & { __p3probe?: string };
			canvas.__p3probe = "persisted-canvas";
		});
		// Fresh shell: no stashed field exists before any swap.
		expect((await canvasState(page)).particles).toBe(-1);

		await page.getByRole("link", { name: "About" }).click();
		await expect(
			page.getByRole("heading", { level: 1, name: "About" }),
		).toBeVisible();
		// Let the inbound view transition settle before pressing Escape: a
		// close issued mid-transition races the router's swap and can be
		// swallowed (same pattern as the navigation-sounds spec).
		await page.waitForFunction(
			() => !document.documentElement.hasAttribute("data-astro-transition"),
		);
		const afterView = await canvasState(page);
		expect(afterView.found).toBe(true);
		expect(afterView.marker).toBe("persisted-canvas");
		expect(afterView.canvasCount).toBe(1);

		// About (about-view contract) hides the Back to menu link; Escape is
		// its documented return path.
		await page.keyboard.press("Escape");
		await expect(page).toHaveURL("/");
		await expect(
			page.getByRole("navigation", { name: "Game menu" }),
		).toBeVisible();
		const afterReturn = await canvasState(page);
		expect(afterReturn.found).toBe(true);
		expect(afterReturn.marker).toBe("persisted-canvas");
		expect(afterReturn.canvasCount).toBe(1);
		// The field stashed on before-swap was adopted by the returned
		// document: the loop continues from the same particles, not a restart.
		expect(afterReturn.particles).toBeGreaterThan(0);
		// The rAF loop keeps painting on the returned document (no restart).
		const initialFrame = await page.evaluate(() =>
			(
				document.getElementById("living-background") as HTMLCanvasElement
			).toDataURL(),
		);
		await expect
			.poll(() =>
				page.evaluate(() =>
					(
						document.getElementById("living-background") as HTMLCanvasElement
					).toDataURL(),
				),
			)
			.not.toBe(initialFrame);
	});
});
