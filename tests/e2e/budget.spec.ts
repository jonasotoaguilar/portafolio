import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

import { expect, test } from "@playwright/test";

// Every static route ships its own document with its own script set; the
// budget applies to each of the six routes, not just the shell.
const ROUTES = [
	["/", "index.html"],
	["/about", "about/index.html"],
	["/resume", "resume/index.html"],
	["/projects", "projects/index.html"],
	["/skills", "skills/index.html"],
	["/contact", "contact/index.html"],
] as const;

// Exact per-route document titles (seo-metadata): asserted from the rendered
// route, not just from built HTML.
const TITLES: [string, string][] = [
	["/", "Jonathan Soto · Backend & Full-Stack Engineer"],
	["/about", "About · Jonathan Soto"],
	["/resume", "Resume · Jonathan Soto"],
	["/projects", "Projects · Jonathan Soto"],
	["/skills", "Skills · Jonathan Soto"],
	["/contact", "Contact · Jonathan Soto"],
];

test.describe("first-load budget", () => {
	test("every route stays under 100KB of gzipped JavaScript", () => {
		for (const [route, file] of ROUTES) {
			const html = readFileSync(`dist/${file}`, "utf8");
			const scripts = [...html.matchAll(/src="(\/_astro\/[^"]+\.js)"/g)].map(
				(match) => match[1] ?? "",
			);
			expect(
				scripts.length,
				`${route} must reference client scripts`,
			).toBeGreaterThan(0);
			const total = scripts.reduce((sum, src) => {
				const bytes = Buffer.from(readFileSync(`dist${src}`, "utf8"));
				return sum + gzipSync(bytes).length;
			}, 0);
			console.log(`${route} gzipped JS: ${total} bytes`);
			expect(total, `${route} under 100KB gzipped`).toBeLessThan(100 * 1024);
		}
	});

	test("every route renders its exact title and exactly one h1", async ({
		page,
	}) => {
		for (const [route, title] of TITLES) {
			await page.goto(route);
			await expect(page, `${route} must render its exact title`).toHaveTitle(
				title,
			);
			await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
		}
	});

	test("zero-JS: every route keeps all content in flow and scrolls normally", async ({
		browser,
	}) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		await page.setViewportSize({ width: 375, height: 480 });
		let scrollable = 0;
		for (const [route] of ROUTES) {
			await page.goto(route);
			const flow = await page.evaluate(() => ({
				gated: document.documentElement.hasAttribute("data-game-ready"),
				overflow: getComputedStyle(document.documentElement).overflow,
				scrollHeight: document.documentElement.scrollHeight,
				hidden: [...document.querySelectorAll("[hidden]")].map(
					(element) => element.className,
				),
			}));
			expect(
				flow.gated,
				`${route} must not apply the JS-only no-scroll gate`,
			).toBe(false);
			expect(flow.overflow, `${route} must not clamp page scroll`).not.toBe(
				"hidden",
			);
			expect(
				flow.hidden,
				`${route} must hide only the background canvas`,
			).toEqual(["living-background"]);
			if (flow.scrollHeight > 480) {
				scrollable += 1;
				await page.evaluate(() =>
					window.scrollTo(0, document.documentElement.scrollHeight),
				);
				expect(
					await page.evaluate(() => window.scrollY),
					`${route} must scroll to its content`,
				).toBeGreaterThan(0);
			}
		}
		expect(scrollable).toBeGreaterThanOrEqual(3);
		await context.close();
	});

	test("with JS every route fills the viewport with no page scroll, content reachable", async ({
		page,
	}) => {
		const probes: [string, string | RegExp][] = [
			["/", "About"],
			["/about", "Backend & Full-Stack Engineer"],
			["/resume", "Ingeniería de Ejecución en Computación e Informática"],
			["/projects", /Service-order and ticket management platform/],
			["/skills", "FastAPI"],
			["/contact", "jonathansoto.dev@gmail.com"],
		];
		for (const [route, probe] of probes) {
			await page.goto(route);
			await expect(
				page.locator("html"),
				`${route} must apply the JS-only gate`,
			).toHaveAttribute("data-game-ready", "");
			const scroll = await page.evaluate(() => {
				window.scrollTo(0, 1000);
				return {
					y: window.scrollY,
					overflow: getComputedStyle(document.documentElement).overflow,
				};
			});
			expect(scroll.overflow).toBe("hidden");
			expect(scroll.y).toBe(0);
			await expect(page.getByText(probe, { exact: true })).toBeVisible();
		}
	});
});
