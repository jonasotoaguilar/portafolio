import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeAll, describe, expect, it } from "vitest";

import JsonLd from "../../src/components/JsonLd.astro";
import BaseLayout from "../../src/layouts/BaseLayout.astro";
import type { SiteConfig } from "../../src/lib/content/schemas";
import { buildPersonJsonLd, serializeJsonLd } from "../../src/lib/seo/person";
import { isSitemapEligible } from "../../src/lib/seo/sitemap";
import {
	canonicalUrl,
	SHELL_TITLE,
	VIEW_TITLES,
} from "../../src/lib/seo/titles";

const SITE: SiteConfig = {
	name: "Jonathan Soto",
	role: "Backend & Full-Stack Engineer",
	tagline: "Engineer with a Persona-3 soul.",
	focusAreas: [
		"Go",
		"TypeScript",
		"Python",
		"clean architecture",
		"API design",
	],
	email: "jonathansoto.dev@gmail.com",
	socials: {
		github: "https://github.com/jonasotoaguilar",
		wealthquest: "https://jonasotoaguilar.itch.io/wealthquest",
	},
	pageTitle: "Jonathan Soto · Backend & Full-Stack Engineer",
};

describe("buildPersonJsonLd", () => {
	it("builds a schema.org Person with the exact name and jobTitle", () => {
		const person = buildPersonJsonLd(SITE);

		expect(person["@context"]).toBe("https://schema.org");
		expect(person["@type"]).toBe("Person");
		expect(person.name).toBe("Jonathan Soto");
		expect(person.jobTitle).toBe("Backend & Full-Stack Engineer");
	});

	it("includes the email and both sameAs URLs from the site config", () => {
		const person = buildPersonJsonLd(SITE);

		expect(person.email).toBe("jonathansoto.dev@gmail.com");
		expect(person.sameAs).toEqual([
			"https://github.com/jonasotoaguilar",
			"https://jonasotoaguilar.itch.io/wealthquest",
		]);
	});
});

describe("serializeJsonLd", () => {
	it("round-trips through JSON.parse", () => {
		const serialized = serializeJsonLd({ name: "Jonathan Soto" });

		expect(JSON.parse(serialized)).toEqual({ name: "Jonathan Soto" });
	});

	it("escapes angle brackets so script content cannot break out", () => {
		const serialized = serializeJsonLd({
			name: "</script><script>alert(1)</script>",
		});

		expect(serialized).not.toContain("</script>");
		expect(serialized).toContain("\\u003c");
	});
});

describe("isSitemapEligible", () => {
	it("includes the index URL", () => {
		expect(isSitemapEligible("https://jonasotoaguilar.dev/")).toBe(true);
	});

	it("excludes both the /404 page and its generated html form", () => {
		expect(isSitemapEligible("https://jonasotoaguilar.dev/404")).toBe(false);
		expect(isSitemapEligible("https://jonasotoaguilar.dev/404.html")).toBe(
			false,
		);
	});
});

describe("per-route document titles", () => {
	it("shell title is the exact identity title", () => {
		expect(SHELL_TITLE).toBe("Jonathan Soto · Backend & Full-Stack Engineer");
	});

	it("view titles follow the exact {View} · Jonathan Soto pattern", () => {
		expect(VIEW_TITLES.about).toBe("About · Jonathan Soto");
		expect(VIEW_TITLES.resume).toBe("Resume · Jonathan Soto");
		expect(VIEW_TITLES.projects).toBe("Projects · Jonathan Soto");
		expect(VIEW_TITLES.skills).toBe("Skills · Jonathan Soto");
		expect(VIEW_TITLES.contact).toBe("Contact · Jonathan Soto");
	});

	it("all six route titles are distinct", () => {
		const titles = new Set([SHELL_TITLE, ...Object.values(VIEW_TITLES)]);
		expect(titles.size).toBe(6);
	});
});

describe("canonicalUrl", () => {
	it("builds the absolute canonical for the shell and every view", () => {
		const site = "https://jonasotoaguilar.dev";
		expect(canonicalUrl("/", site)).toBe("https://jonasotoaguilar.dev/");
		expect(canonicalUrl("/about", site)).toBe(
			"https://jonasotoaguilar.dev/about",
		);
		expect(canonicalUrl("/resume", site)).toBe(
			"https://jonasotoaguilar.dev/resume",
		);
		expect(canonicalUrl("/projects", site)).toBe(
			"https://jonasotoaguilar.dev/projects",
		);
		expect(canonicalUrl("/skills", site)).toBe(
			"https://jonasotoaguilar.dev/skills",
		);
		expect(canonicalUrl("/contact", site)).toBe(
			"https://jonasotoaguilar.dev/contact",
		);
	});
});

describe("BaseLayout per-route SEO", () => {
	let container: AstroContainer;

	beforeAll(async () => {
		container = await AstroContainer.create();
	});

	it("renders the canonical link for the shell route", async () => {
		const html = await container.renderToString(BaseLayout, {
			props: { title: SHELL_TITLE },
			request: new Request("http://localhost:4321/"),
			slots: { default: "<p>shell</p>" },
		});

		expect(html).toContain(
			'<link rel="canonical" href="https://jonasotoaguilar.dev/">',
		);
	});

	it("renders the canonical link for a view route", async () => {
		const html = await container.renderToString(BaseLayout, {
			props: { title: VIEW_TITLES.about },
			request: new Request("http://localhost:4321/about"),
			slots: { default: "<p>view</p>" },
		});

		expect(html).toContain(
			'<link rel="canonical" href="https://jonasotoaguilar.dev/about">',
		);
	});

	it("embeds the JSON-LD Person block with sameAs when site is provided", async () => {
		const html = await container.renderToString(BaseLayout, {
			props: { title: VIEW_TITLES.about, site: SITE },
			slots: { default: "<p>view</p>" },
		});
		const script = html.match(
			/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
		);

		expect(script).not.toBeNull();
		const person = JSON.parse(script?.[1] ?? "{}");
		expect(person["@type"]).toBe("Person");
		expect(person.name).toBe("Jonathan Soto");
		expect(person.jobTitle).toBe("Backend & Full-Stack Engineer");
		expect(person.email).toBe("jonathansoto.dev@gmail.com");
		expect(person.sameAs).toEqual([
			"https://github.com/jonasotoaguilar",
			"https://jonasotoaguilar.itch.io/wealthquest",
		]);
	});

	it("omits canonical and JSON-LD on the 404 route", async () => {
		const html = await container.renderToString(BaseLayout, {
			props: { title: "404" },
			request: new Request("http://localhost:4321/404"),
			slots: { default: "<p>not found</p>" },
		});

		expect(html).not.toContain("application/ld+json");
		expect(html).not.toContain('rel="canonical"');
	});
});

describe("JsonLd", () => {
	let container: AstroContainer;

	beforeAll(async () => {
		container = await AstroContainer.create();
	});

	it("renders the Person block as parseable application/ld+json", async () => {
		const html = await container.renderToString(JsonLd, {
			props: { site: SITE },
		});
		const script = html.match(
			/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
		);

		expect(script).not.toBeNull();
		const person = JSON.parse(script?.[1] ?? "{}");
		expect(person["@type"]).toBe("Person");
		expect(person.name).toBe("Jonathan Soto");
		expect(person.jobTitle).toBe("Backend & Full-Stack Engineer");
		expect(person.email).toBe("jonathansoto.dev@gmail.com");
		expect(person.sameAs).toEqual([
			"https://github.com/jonasotoaguilar",
			"https://jonasotoaguilar.itch.io/wealthquest",
		]);
	});
});
