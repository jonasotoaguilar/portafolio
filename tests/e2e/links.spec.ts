import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const SHELL_ROUTES = [
	["About", "/about"],
	["Resume", "/resume"],
	["Projects", "/projects"],
	["Skills", "/skills"],
	["Contact", "/contact"],
] as const;

const SIX_ROUTES = ["/", ...SHELL_ROUTES.map(([, path]) => path)] as const;

const SIX_URLS = [
	"https://jonasotoaguilar.dev/",
	"https://jonasotoaguilar.dev/about/",
	"https://jonasotoaguilar.dev/resume/",
	"https://jonasotoaguilar.dev/projects/",
	"https://jonasotoaguilar.dev/skills/",
	"https://jonasotoaguilar.dev/contact/",
] as const;

const PROJECT_LINKS: [string, string][] = [
	["ServiceFlow", "https://github.com/jonasotoaguilar/ServiceFlow"],
	["WealthQuest", "https://jonasotoaguilar.itch.io/wealthquest"],
	["EventCommerce", "https://github.com/jonasotoaguilar/eventcommerce"],
	[
		"Fintual Sensor",
		"https://github.com/BlendedGames-bGames/bGames-FintualSensor",
	],
];

test.describe("links and SEO", () => {
	test("PROJECTS renders each project link exactly once with its declared href", async ({
		page,
	}) => {
		await page.goto("/projects");
		for (const [label, href] of PROJECT_LINKS) {
			// Non-active detail panels are gated behind the no-scroll enhancement,
			// so href-based locators check the document content of every panel.
			const link = page.locator(`a[href="${href}"]`);
			await expect(link).toHaveCount(1);
			await expect(link).toHaveAttribute("href", href);
			await expect(link).toHaveText(label);
		}
	});

	test("every off-site project link opens safely with noopener noreferrer", async ({
		page,
	}) => {
		await page.goto("/projects");
		for (const [, href] of PROJECT_LINKS) {
			const link = page.locator(`a[href="${href}"]`);
			await expect(link).toHaveAttribute("target", "_blank");
			await expect(link).toHaveAttribute("rel", /noopener/);
			await expect(link).toHaveAttribute("rel", /noreferrer/);
		}
	});

	test("internal navigation links stay in the same tab", async ({ page }) => {
		await page.goto("/");
		const menu = page.getByRole("navigation", { name: "Game menu" });
		for (const [label] of SHELL_ROUTES) {
			await expect(menu.getByRole("link", { name: label })).not.toHaveAttribute(
				"target",
				/.*/,
			);
		}
	});

	test("every route embeds a JSON-LD Person block with identity and sameAs links", async ({
		page,
	}) => {
		for (const path of SIX_ROUTES) {
			await page.goto(path);
			const person = await page
				.locator('script[type="application/ld+json"]')
				.evaluate((el) => JSON.parse(el.textContent ?? "{}"));
			expect(person["@type"]).toBe("Person");
			expect(person.name).toBe("Jonathan Soto");
			expect(person.jobTitle).toBe("Backend & Full-Stack Engineer");
			expect(person.email).toBe("jonathansoto.dev@gmail.com");
			expect(person.sameAs).toEqual([
				"https://github.com/jonasotoaguilar",
				"https://jonasotoaguilar.itch.io/wealthquest",
			]);
		}
	});

	test("sitemap lists the six routes and excludes the 404 page", () => {
		const entries = readFileSync("dist/sitemap-0.xml", "utf8");
		for (const url of SIX_URLS) {
			expect(entries).toContain(url);
		}
		expect(entries).not.toContain("404");
		const index = readFileSync("dist/sitemap-index.xml", "utf8");
		expect(index).toContain("sitemap-0.xml");
	});
});
