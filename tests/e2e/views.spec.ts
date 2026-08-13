import { expect, type Page, test } from "@playwright/test";

interface VtSample {
	pseudo: string;
	delay: number;
	duration: number;
	endDelay: number;
	properties: string[];
}

// Installs a click-driven sampler for ::view-transition overlay animations:
// clicks the matching link (or a freshly created one for the 404 route) and
// reports every distinct overlay animation observed within the window.
async function installVtSampler(page: Page): Promise<void> {
	await page.addInitScript(() => {
		(window as unknown as { __clickAndSampleVt: unknown }).__clickAndSampleVt =
			(href: string, waitMs = 1200): Promise<VtSample[]> =>
				new Promise((resolve) => {
					const samples: VtSample[] = [];
					const seen = new Set<string>();
					const start = performance.now();
					const record = () => {
						// Transition teardown races (destroyed pseudo-elements
						// mid-swap) must not kill the sampler loop.
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
								const key = `${pseudo}|${timing.delay}|${timing.duration}|${timing.endDelay}|${properties.join(",")}`;
								if (seen.has(key)) continue;
								seen.add(key);
								samples.push({
									pseudo,
									delay: Number(timing.delay),
									duration: Number(timing.duration),
									endDelay: Number(timing.endDelay),
									properties,
								});
							}
						} catch {
							// ignore per-frame teardown errors
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

const VIEWS: [string, string][] = [
	["/about", "About"],
	["/resume", "Resume"],
	["/projects", "Projects"],
	["/skills", "Skills"],
	["/contact", "Contact"],
];

test.describe("game shell and view routes", () => {
	test("shell renders exactly five menu links to the five view routes", async ({
		page,
	}) => {
		await page.goto("/");
		const menu = page.getByRole("navigation", { name: "Game menu" });
		await expect(menu.getByRole("link")).toHaveCount(5);
		for (const [path, label] of VIEWS) {
			await expect(menu.getByRole("link", { name: label })).toHaveAttribute(
				"href",
				path,
			);
		}
	});

	test("every view route is directly reachable with its heading and a single main", async ({
		page,
	}) => {
		for (const [path, label] of VIEWS) {
			await page.goto(path);
			await expect(
				page.getByRole("heading", { level: 1, name: label }),
			).toBeVisible();
			await expect(page.getByRole("main")).toHaveCount(1);
			await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
		}
	});

	test("zero-JS: the shell is a plain link list that still navigates", async ({
		browser,
	}) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		await page.goto("/");
		const menu = page.getByRole("navigation", { name: "Game menu" });
		for (const [path, label] of VIEWS) {
			await expect(menu.getByRole("link", { name: label })).toHaveAttribute(
				"href",
				path,
			);
		}
		await page.getByRole("link", { name: "About" }).click();
		await expect(page).toHaveURL(/\/about$/);
		await expect(
			page.getByRole("heading", { level: 1, name: "About" }),
		).toBeVisible();
		await context.close();
	});

	test("Tab focus is confined within the shell menu while active", async ({
		page,
	}) => {
		await page.goto("/");
		const menu = page.getByRole("navigation", { name: "Game menu" });
		for (let index = 0; index < 12; index += 1) {
			await page.keyboard.press("Tab");
			expect(
				await menu.evaluate((el) => el.contains(document.activeElement)),
			).toBe(true);
		}
	});

	test("inactive screens never intercept shell keys", async ({ page }) => {
		await page.goto("/about");
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("ArrowUp");
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(/\/about$/);
	});

	test("native Back returns to the shell", async ({ page }) => {
		await page.goto("/");
		await page
			.getByRole("navigation", { name: "Game menu" })
			.getByRole("link", { name: "Projects" })
			.click();
		await expect(page).toHaveURL(/\/projects$/);
		await page.goBack();
		await expect(page).toHaveURL(/\/$/);
		await expect(
			page.getByRole("navigation", { name: "Game menu" }),
		).toBeVisible();
	});

	test("ABOUT renders the role and focus areas from site config", async ({
		page,
	}) => {
		await page.goto("/about");
		await expect(
			page.getByText("Backend & Full-Stack Engineer", { exact: true }),
		).toBeVisible();
		for (const area of [
			"Go",
			"TypeScript",
			"Python",
			"clean architecture",
			"API design",
		]) {
			await expect(page.getByText(area, { exact: true })).toBeVisible();
		}
	});

	test("SKILLS groups render plain names with no numeric levels or metrics", async ({
		page,
	}) => {
		await page.goto("/skills");
		// Content-region scope: the dev-only Astro toolbar injects its own
		// buttons outside <main>, so page-wide button counts are unstable in
		// dev (the toolbar is absent from production builds).
		await expect(page.locator("main").getByRole("button")).toHaveCount(3);
		await expect(page.getByRole("button", { name: "backend" })).toBeVisible();
		const panel = page.locator("[data-detail-panel][data-active]");
		await expect(panel.getByText("FastAPI")).toBeVisible();
		const text = await page.locator("main").innerText();
		expect(text).not.toContain("%");
		expect(text).not.toMatch(/\d+\s*\/\s*\d+/);
	});

	test("CONTACT surfaces the email CTA and safe external links", async ({
		page,
	}) => {
		await page.goto("/contact");
		await expect(
			page.getByRole("link", { name: "jonathansoto.dev@gmail.com" }),
		).toHaveAttribute("href", "mailto:jonathansoto.dev@gmail.com");
		const external: [string, string][] = [
			["GitHub", "https://github.com/jonasotoaguilar"],
			["WealthQuest", "https://jonasotoaguilar.itch.io/wealthquest"],
		];
		for (const [label, href] of external) {
			const link = page.getByRole("link", { name: label });
			await expect(link).toHaveAttribute("href", href);
			await expect(link).toHaveAttribute("target", "_blank");
			await expect(link).toHaveAttribute("rel", /noopener/);
			await expect(link).toHaveAttribute("rel", /noreferrer/);
		}
	});

	test("PROJECTS renders the four projects once in declared order", async ({
		page,
	}) => {
		await page.goto("/projects");
		const items = page.locator("[data-list-item]");
		await expect(items).toHaveCount(4);
		expect(await items.allTextContents()).toEqual([
			"ServiceFlow",
			"WealthQuest",
			"EventCommerce",
			"Fintual Sensor",
		]);
		for (const name of [
			"ServiceFlow",
			"WealthQuest",
			"EventCommerce",
			"Fintual Sensor",
		]) {
			await expect(page.getByRole("button", { name })).toHaveCount(1);
		}
	});

	test("/projects#slug preselects the matching project detail", async ({
		page,
	}) => {
		await page.goto("/projects#serviceflow");
		await expect(
			page.locator("[data-detail-panel][data-active]"),
		).toContainText("ServiceFlow");
		await page.goto("/projects#wealthquest");
		await expect(
			page.locator("[data-detail-panel][data-active]"),
		).toContainText("WealthQuest");
	});

	test("Escape closes an open panel first, then returns to the menu", async ({
		page,
	}) => {
		await page.goto("/skills");
		await page.getByRole("button", { name: "backend" }).focus();
		await page.keyboard.press("Enter");
		await expect(page.locator("[data-detail-panel][data-active]")).toHaveCount(
			1,
		);
		await expect(
			page.locator("[data-detail-panel][data-active]"),
		).toBeFocused();
		await page.keyboard.press("Escape");
		await expect(page.locator("[data-detail-panel][data-active]")).toHaveCount(
			0,
		);
		await expect(page.getByRole("button", { name: "backend" })).toBeFocused();
		await page.keyboard.press("Escape");
		await expect(page).toHaveURL(/\/$/);
	});

	test("Escape on a plain view returns to the menu", async ({ page }) => {
		await page.goto("/about");
		await page.keyboard.press("Escape");
		await expect(page).toHaveURL(/\/$/);
	});

	test("unknown paths render the 404 page with a single back action", async ({
		page,
	}) => {
		const response = await page.goto("/missing-page-xyz");
		expect(response?.status()).toBe(404);
		await expect(
			page.getByRole("heading", { level: 1, name: "404" }),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Back to home" }),
		).toHaveAttribute("href", "/");
	});
});

test.describe("RESUME view", () => {
	test("renders the verified CV facts across every section", async ({
		page,
	}) => {
		await page.goto("/resume");
		// Content-region scope: dev-only Astro toolbar buttons live outside
		// <main> and would otherwise inflate the page-wide button count.
		await expect(page.locator("main").getByRole("button")).toHaveCount(5);
		const panel = page.locator("[data-detail-panel][data-active]");

		await expect(panel).toContainText("USACH");
		await expect(panel).toContainText(
			"Ingeniería de Ejecución en Computación e Informática",
		);
		await expect(panel).toContainText("Mar 2020–Apr 2025");
		await expect(panel).toContainText("Mar 2017–Nov 2019");

		await page.getByRole("button", { name: "Experience" }).click();
		await expect(panel).toContainText("Productos Barber Chile");
		await expect(panel).toContainText("2020–2026");
		await expect(panel).toContainText("Policomp");
		await expect(panel).toContainText("Jan–Mar 2020");

		await page.getByRole("button", { name: "Projects" }).click();
		await expect(panel).toContainText("ServiceFlow");
		await expect(panel).toContainText("WealthQuest");
		await expect(panel).toContainText("Academic publication");
		await expect(panel).toContainText("May 2025");

		await page.getByRole("button", { name: "Skills" }).click();
		for (const skill of [
			"Python",
			"Java",
			"Spring Boot",
			"TypeScript/JavaScript",
			"SQL and related tooling",
		]) {
			await expect(panel.getByText(skill, { exact: true })).toBeVisible();
		}

		await page.getByRole("button", { name: "Languages" }).click();
		await expect(panel).toContainText("Spanish");
		await expect(panel).toContainText("native");
		await expect(panel).toContainText("English");
		await expect(panel).toContainText("basic technical reading");
	});

	test("renders no contact-number content in any route's HTML", async ({
		page,
	}) => {
		for (const path of [
			"/",
			"/about",
			"/resume",
			"/projects",
			"/skills",
			"/contact",
			"/missing-page-xyz",
		]) {
			await page.goto(path);
			// Dev-server injection (style/script blocks) carries Tailwind
			// utility noise (e.g. cursor-cell, unsplash asset ids); the
			// rendered document surface is the HTML minus those blocks.
			const html = await page
				.content()
				.then((content) =>
					content
						.replace(/<style[\s\S]*?<\/style>/g, "")
						.replace(/<script[\s\S]*?<\/script>/g, ""),
				);

			expect(html, `${path} must not contain tel:`).not.toMatch(/tel:/);
			expect(html, `${path} must not contain 9+ digit runs`).not.toMatch(
				/[0-9]{9,}/,
			);
			expect(html, `${path} must not contain phone words`).not.toMatch(
				/\b(?:telephone|mobile|cell)\b/,
			);
		}
	});

	test("detail panel stacks below the list and scrolls internally on small screens", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 375, height: 720 });
		await page.goto("/resume");

		const listBox = await page.locator("[data-list]").boundingBox();
		const panelBox = await page
			.locator("[data-detail-panel][data-active]")
			.boundingBox();
		if (!listBox || !panelBox) {
			throw new Error("expected visible list and panel boxes");
		}
		expect(panelBox.y).toBeGreaterThanOrEqual(listBox.y + listBox.height);
		const overflowY = await page
			.locator("[data-detail-panel][data-active]")
			.evaluate((el) => getComputedStyle(el).overflowY);
		expect(overflowY).toBe("auto");
	});
});

test.describe("view-transition overlays", () => {
	const assertWithin = (samples: VtSample[], maxMs: number) => {
		expect(samples.length).toBeGreaterThanOrEqual(2);
		for (const sample of samples) {
			expect(sample.pseudo).toMatch(/::view-transition-/);
			expect(
				sample.delay + sample.duration + sample.endDelay,
			).toBeLessThanOrEqual(maxMs);
		}
	};

	test("overlays complete within 400ms between the shell and a view", async ({
		page,
	}) => {
		await installVtSampler(page);
		await page.goto("/");
		const samples = await sampleVt(page, "/about");

		assertWithin(samples, 400);
		// The default overlay is a wipe (transform + opacity), not a fade.
		expect(
			samples.some((sample) => sample.properties.includes("transform")),
		).toBe(true);
		for (const sample of samples) {
			for (const property of sample.properties) {
				expect(["opacity", "transform"]).toContain(property);
			}
		}
		await expect(
			page.getByRole("heading", { level: 1, name: "About" }),
		).toBeVisible();
	});

	test("overlays cover the 404 route within 400ms", async ({ page }) => {
		await installVtSampler(page);
		await page.goto("/");
		const samples = await sampleVt(page, "/missing-page-xyz");

		assertWithin(samples, 400);
		for (const sample of samples) {
			for (const property of sample.properties) {
				expect(["opacity", "transform"]).toContain(property);
			}
		}
		await expect(
			page.getByRole("heading", { level: 1, name: "404" }),
		).toBeVisible();
	});

	// Reduced-motion overlay contract from the authored stylesheet: the
	// html[data-route] rules must declare 200ms opacity-only fades for the
	// outgoing/incoming root snapshots (Chromium's UA skips VT animations
	// entirely under prefers-reduced-motion, so the stylesheet is the
	// contract that browsers without that UA behavior must honor).
	const overlayRules = (page: Page) =>
		page.evaluate(() => {
			const parseCssTime = (value: string): number => {
				const n = Number.parseFloat(value);
				return value.trim().endsWith("ms") ? n : n * 1000;
			};
			const found: {
				selector: string;
				duration: number;
				delay: number;
				keyframes: string[];
			}[] = [];
			const keyframeProps = (name: string): string[] => {
				const props = new Set<string>();
				for (const sheet of document.styleSheets) {
					try {
						for (const rule of sheet.cssRules) {
							if (rule instanceof CSSKeyframesRule && rule.name === name) {
								for (const frame of rule.cssRules) {
									for (const prop of (frame as CSSStyleRule).style) {
										props.add(prop);
									}
								}
							}
						}
					} catch {
						// cross-origin sheet access is not expected in dev
					}
				}
				return [...props];
			};
			const walk = (rules: CSSRuleList) => {
				for (const rule of rules) {
					if (rule instanceof CSSMediaRule) {
						if (!rule.conditionText.includes("reduced-motion: reduce"))
							continue;
						for (const inner of rule.cssRules) {
							if (
								inner instanceof CSSStyleRule &&
								/view-transition-(?:old|new)\(root\)/.test(inner.selectorText)
							) {
								const duration = parseCssTime(inner.style.animationDuration);
								const delay = parseCssTime(inner.style.animationDelay);
								found.push({
									selector: inner.selectorText,
									duration: Number.isNaN(duration) ? 0 : duration,
									delay: Number.isNaN(delay) ? 0 : delay,
									keyframes: keyframeProps(inner.style.animationName),
								});
							}
						}
					}
				}
			};
			for (const sheet of document.styleSheets) {
				try {
					walk(sheet.cssRules);
				} catch {
					// cross-origin sheet access is not expected in dev
				}
			}
			return found;
		});

	test("reduced motion keeps overlays opacity-only at most 200ms, 404 included", async ({
		page,
	}) => {
		await installVtSampler(page);
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/");
		const samples = await sampleVt(page, "/skills");

		if (samples.length > 0) {
			// Browsers that do not natively skip VT animations under reduced
			// motion must run the authored opacity-only <=200ms overlay.
			assertWithin(samples, 200);
			for (const sample of samples) {
				expect(sample.properties).toEqual(["opacity"]);
			}
		} else {
			// Chromium's UA skips VT animations entirely under reduced
			// motion; the stylesheet contract still must hold.
			const rules = await overlayRules(page);
			expect(rules.length).toBeGreaterThanOrEqual(2);
			for (const rule of rules) {
				expect(rule.duration).toBeLessThanOrEqual(200);
				expect(rule.delay).toBe(0);
				for (const property of rule.keyframes) {
					expect(["opacity"]).toContain(property);
				}
			}
		}
		await expect(
			page.getByRole("heading", { level: 1, name: "Skills" }),
		).toBeVisible();

		const notFound = await sampleVt(page, "/missing-page-xyz");
		if (notFound.length > 0) {
			assertWithin(notFound, 200);
			for (const sample of notFound) {
				expect(sample.properties).toEqual(["opacity"]);
			}
		} else {
			const rules = await overlayRules(page);
			expect(rules.length).toBeGreaterThanOrEqual(2);
			for (const rule of rules) {
				expect(rule.duration).toBeLessThanOrEqual(200);
				for (const property of rule.keyframes) {
					expect(["opacity"]).toContain(property);
				}
			}
		}
		await expect(
			page.getByRole("heading", { level: 1, name: "404" }),
		).toBeVisible();
	});

	test("without view-transition support navigation falls back to full-page loads", async ({
		page,
	}) => {
		await page.addInitScript(() => {
			Object.defineProperty(document, "startViewTransition", {
				configurable: true,
				value: undefined,
			});
			// Per-document identity: a full-page load creates a NEW document,
			// while a client-side swap keeps the same document object.
			(window as unknown as { __docId: string }).__docId = Math.random()
				.toString(36)
				.slice(2);
		});
		await page.goto("/");
		const docBefore = await page.evaluate(
			() => (window as unknown as { __docId: string }).__docId,
		);
		// Keyboard activation (focus + Enter) is a real user activation that
		// avoids hover-triggered prefetch commits racing the init scripts.
		await page.locator("[data-menu-item]").first().focus();
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(/\/about$/);
		await expect(
			page.getByRole("heading", { level: 1, name: "About" }),
		).toBeVisible();
		const sVT = await page.evaluate(() => typeof document.startViewTransition);
		const docAfter = await page.evaluate(
			() => (window as unknown as { __docId: string }).__docId,
		);
		expect(sVT).toBe("undefined");
		expect(
			docAfter,
			"full-page fallback must create a new document (startViewTransition masked)",
		).not.toBe(docBefore);
	});
});

// Bottom-right control cluster (persona-navigation spec scenarios "Hints
// cluster bottom-right without overlap" and "Coarse pointer hides hints";
// design AD4): the cluster is fixed at bottom 1.5rem / right 1.75rem, the
// decorative key hints hide on short (<560px) or coarse-pointer viewports,
// and the mute control keeps a ≥44px target. Anchor boxes (the visible
// menu items) are the non-overlap measure on the shell; the heading and the
// back link stand for view content, which never reaches the corner region.
test.describe("bottom-right control cluster", () => {
	const cluster = (page: Page) => page.locator("[data-control-cluster]");

	const clusterBox = async (page: Page) => {
		const box = await cluster(page).boundingBox();
		if (!box) throw new Error("expected a visible control cluster box");
		return box;
	};

	const assertCorner = (
		box: { x: number; y: number; width: number; height: number },
		viewportWidth: number,
		viewportHeight: number,
	) => {
		expect(
			Math.abs(viewportWidth - 28 - (box.x + box.width)),
		).toBeLessThanOrEqual(2);
		expect(
			Math.abs(viewportHeight - 24 - (box.y + box.height)),
		).toBeLessThanOrEqual(2);
	};

	const assertNoOverlap = (
		a: { x: number; y: number; width: number; height: number },
		b: { x: number; y: number; width: number; height: number },
	) => {
		const overlapX =
			Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
		const overlapY =
			Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
		expect(Math.min(overlapX, overlapY)).toBeLessThanOrEqual(0.5);
	};

	const assertMuteTarget = async (page: Page) => {
		const mute = page.getByRole("button", { name: "Sound: Off" });
		await expect(mute).toBeVisible();
		const box = await mute.boundingBox();
		if (!box) throw new Error("expected a visible mute button box");
		expect(box.height).toBeGreaterThanOrEqual(44);
		expect(box.width).toBeGreaterThanOrEqual(44);
	};

	test.use({ viewport: { width: 1280, height: 720 } });

	test.describe("desktop 1280x720", () => {
		test("shell: cluster is fixed bottom-right and never overlaps menu items", async ({
			page,
		}) => {
			await page.goto("/");
			await expect(cluster(page)).toBeVisible();
			expect(
				await cluster(page).evaluate((el) => getComputedStyle(el).position),
			).toBe("fixed");
			const box = await clusterBox(page);
			assertCorner(box, 1280, 720);
			const items = await page.locator("[data-menu-item]").evaluateAll((els) =>
				els.map((el) => {
					const rect = el.getBoundingClientRect();
					return {
						x: rect.x,
						y: rect.y,
						width: rect.width,
						height: rect.height,
					};
				}),
			);
			expect(items).toHaveLength(5);
			for (const item of items) assertNoOverlap(item, box);
			await assertMuteTarget(page);
		});

		test("every view: cluster stays fixed bottom-right without overlapping the header", async ({
			page,
		}) => {
			for (const [path] of VIEWS) {
				await page.goto(path);
				await expect(cluster(page)).toBeVisible();
				assertCorner(await clusterBox(page), 1280, 720);
				for (const target of [
					page.getByRole("heading", { level: 1 }),
					page.getByRole("link", { name: "Back to menu" }),
				]) {
					const box = await target.boundingBox();
					if (!box) {
						throw new Error(`expected a visible header box on ${path}`);
					}
					assertNoOverlap(box, await clusterBox(page));
				}
			}
		});
	});

	test.describe("coarse mobile 390x844", () => {
		test.use({
			hasTouch: true,
			isMobile: true,
			viewport: { width: 390, height: 844 },
		});

		test("hints hidden, mute control stays a ≥44px target", async ({
			page,
		}) => {
			await page.goto("/");
			await expect(page.getByText("GAMEPAD")).toBeHidden();
			await assertMuteTarget(page);
		});
	});

	test.describe("coarse desktop-width 1024x768", () => {
		test.use({ hasTouch: true, viewport: { width: 1024, height: 768 } });

		test("hints hidden, mute stays reachable", async ({ page }) => {
			await page.goto("/");
			await expect(page.getByText("GAMEPAD")).toBeHidden();
			await assertMuteTarget(page);
		});
	});

	test.describe("short viewport 1280x500", () => {
		test.use({ viewport: { width: 1280, height: 500 } });

		test("hints hidden below 560px, mute control stays a ≥44px target", async ({
			page,
		}) => {
			await page.goto("/");
			await expect(page.getByText("GAMEPAD")).toBeHidden();
			await assertMuteTarget(page);
		});
	});
});
