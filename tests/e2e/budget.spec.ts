import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

import { expect, test } from "@playwright/test";

// Every static route ships its own document with its own script set; the
// budget applies to each of the five routes, not just the shell.
const ROUTES = [
	["/", "index.html"],
	["/about", "about/index.html"],
	["/resume", "resume/index.html"],
	["/projects", "projects/index.html"],
	["/skills", "skills/index.html"],
] as const;

// Exact per-route document titles (seo-metadata): asserted from the rendered
// route, not just from built HTML.
// Inline module scripts (Astro inlines small scripts — the ambient-audio
// wiring is one of them), which the external-script regex must not miss.
const INLINE_MODULES = (html: string): string[] =>
	[...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map(
		(match) => match[1] ?? "",
	);

const TITLES: [string, string][] = [
	["/", "Jonathan Soto · Backend & Full-Stack Engineer"],
	["/about", "About · Jonathan Soto"],
	["/resume", "Resume · Jonathan Soto"],
	["/projects", "Projects · Jonathan Soto"],
	["/skills", "Skills · Jonathan Soto"],
];

test.describe("first-load budget", () => {
	test("every route ships audio wiring and no route ships the removed figure layer", () => {
		// Portfolio-page spec "Budget holds with new assets": the production
		// build with the audio layer is what the budget measures. The
		// decorative figure layer is removed, so no route document may carry
		// its markup hook.
		// The ambient-audio wiring (design AD5) is inlined per route by Astro
		// — checked in the built document wherever the bundler puts the audio
		// module.
		for (const [route, file] of ROUTES) {
			const html = readFileSync(`dist/${file}`, "utf8");
			const external = [...html.matchAll(/src="(\/_astro\/[^"]+\.js)"/g)].map(
				(match) => match[1] ?? "",
			);
			const measured = [
				...external.map((src) => readFileSync(`dist${src}`, "utf8")),
				...INLINE_MODULES(html),
			].join("\n");
			expect(
				measured.includes("no-track") && measured.includes("muted"),
				`${route} audio wiring must be inside the measured script set`,
			).toBe(true);
			expect(
				html.includes("data-figure-layer"),
				`${route} must not ship the removed figure-layer markup`,
			).toBe(false);
		}
	});

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
			const external = scripts.reduce((sum, src) => {
				const bytes = Buffer.from(readFileSync(`dist${src}`, "utf8"));
				return sum + gzipSync(bytes).length;
			}, 0);
			const inline = INLINE_MODULES(html).reduce(
				(sum, source) => sum + gzipSync(Buffer.from(source, "utf8")).length,
				0,
			);
			const total = external + inline;
			console.log(
				`${route} gzipped JS: ${total} bytes (external ${external} + inline ${inline})`,
			);
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

	test("SKILLS ships the fixed seven-slot recycled list: seven persistent slots, listbox semantics, red active layer", async ({
		page,
	}) => {
		await page.goto("/skills");
		// 7 persistent slot options (role=option), no detail panels, no
		// fallback cards left in the enhanced DOM.
		await expect(page.locator("main").getByRole("option")).toHaveCount(7);
		await expect(page.locator("[data-detail-panel]")).toHaveCount(0);
		await expect(page.locator("[data-skill-card]")).toHaveCount(0);
		// Initial window: skills 1..7; the list is a listbox and slot 1
		// carries posinset 1.
		await expect(page.locator("[data-list]")).toHaveAttribute(
			"role",
			"listbox",
		);
		const first = page.locator("[data-skill-slot]").first();
		await expect(first.getByText("Go", { exact: true })).toBeVisible();
		await expect(first.getByText("Backend", { exact: true })).toBeVisible();
		await expect(first.locator(".skill-card-rank-value")).toHaveText("4");
		await expect(first).toHaveAttribute("aria-posinset", "1");
		// Exactly one active slot; its red geometric layer paints behind it
		// (the ::before lives on the slot's <li>, the button's parent).
		await expect(page.locator("[data-skill-slot][data-active]")).toHaveCount(1);
		const red = await page
			.locator("[data-skill-slot][data-active]")
			.first()
			.locator("xpath=..")
			.evaluate((el) => getComputedStyle(el, "::before").backgroundColor);
		expect(red).toBe("rgb(228, 0, 43)");
		// The data blob carries all 22 records (9 backend + 5 frontend + 8
		// tooling) with ranks on the 1..4 scale.
		const data = await page.evaluate(() =>
			JSON.parse(document.getElementById("skills-data")?.textContent ?? "[]"),
		);
		expect(data).toHaveLength(22);
		expect(
			data.filter(
				(entry: { category: string }) => entry.category === "Backend",
			),
		).toHaveLength(9);
		expect(
			data.filter(
				(entry: { category: string }) => entry.category === "Frontend",
			),
		).toHaveLength(5);
		expect(
			data.filter(
				(entry: { category: string }) => entry.category === "Tooling",
			),
		).toHaveLength(8);
		for (const entry of data as { rank: number }[]) {
			expect([1, 2, 3, 4]).toContain(entry.rank);
		}
	});
});
