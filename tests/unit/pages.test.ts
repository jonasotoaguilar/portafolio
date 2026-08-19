import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { describe, expect, it, vi } from "vitest";

import type {
	Project,
	SiteConfig,
	Skills,
} from "../../src/lib/content/schemas";
import NotFound from "../../src/pages/404.astro";
import Index from "../../src/pages/index.astro";

const { MOCK_PROJECTS, MOCK_SITE, MOCK_SKILLS } = vi.hoisted(() => {
	const projects: { id: string; data: Project }[] = [
		{
			id: "serviceflow",
			data: {
				title: "ServiceFlow",
				description: "Service order and ticket management.",
				stack: ["Next.js", "TypeScript"],
				link: "https://github.com/jonasotoaguilar/ServiceFlow",
				order: 1,
				external: true,
				pullRequests: 12,
				commits: 205,
			},
		},
		{
			id: "wealthquest",
			data: {
				title: "WealthQuest",
				description: "Thesis game built with Unity.",
				stack: ["Unity", "C#"],
				link: "https://jonasotoaguilar.itch.io/wealthquest",
				order: 2,
				external: true,
				pullRequests: null,
				commits: null,
			},
		},
		{
			id: "eventcommerce",
			data: {
				title: "EventCommerce",
				description: "Event-driven commerce backend.",
				stack: ["Python", "FastAPI"],
				link: "https://github.com/jonasotoaguilar/eventcommerce",
				order: 3,
				external: true,
				pullRequests: 51,
				commits: 11,
			},
		},
		{
			id: "fintual-sensor",
			data: {
				title: "Fintual Sensor",
				description: "Org-owned contribution.",
				stack: ["JavaScript", "Docker"],
				link: "https://github.com/BlendedGames-bGames/bGames-FintualSensor",
				order: 4,
				external: true,
				pullRequests: 0,
				commits: 7,
			},
		},
	];
	const site: SiteConfig = {
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
	const skills: Skills = {
		backend: [
			{ name: "Go", rank: 4 },
			{ name: "Python", rank: 3 },
			{ name: "TypeScript", rank: 3 },
		],
		frontend: [
			{ name: "Astro", rank: 3 },
			{ name: "React 19", rank: 3 },
			{ name: "Next.js 16", rank: 2 },
		],
		tooling: [
			{ name: "Docker", rank: 3 },
			{ name: "Git", rank: 4 },
			{ name: "Biome", rank: 2 },
		],
	};
	return {
		MOCK_PROJECTS: projects,
		MOCK_SITE: [{ id: "site", data: site }],
		MOCK_SKILLS: [{ id: "skills", data: skills }],
	};
});

vi.mock("astro:content", () => ({
	getCollection: vi.fn((name: string) => {
		if (name === "projects") return Promise.resolve(MOCK_PROJECTS);
		if (name === "skills") return Promise.resolve(MOCK_SKILLS);
		return Promise.resolve(MOCK_SITE);
	}),
}));

let container: AstroContainer;

async function render(page: typeof Index | typeof NotFound): Promise<string> {
	if (!container) container = await AstroContainer.create();
	return container.renderToString(page);
}

describe("index page (game shell)", () => {
	it("renders exactly four menu links to the four view routes in declared order", async () => {
		const html = await render(Index);
		const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
		const anchors = [...main.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
		const links = anchors.map((match) => ({
			href: match[1]?.match(/href="([^"]*)"/)?.[1],
			text: (match[2] ?? "").replace(/<[^>]+>/g, "").trim(),
		}));

		expect(links).toEqual([
			{ href: "/about", text: "About" },
			{ href: "/resume", text: "Resume" },
			{ href: "/projects", text: "Projects" },
			{ href: "/skills", text: "Skills" },
		]);
	});

	it("renders exactly one h1 and embeds the JSON-LD Person block", async () => {
		const html = await render(Index);

		expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
		const script = html.match(
			/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
		);
		expect(script).not.toBeNull();
		const person = JSON.parse(script?.[1] ?? "{}");
		expect(person["@type"]).toBe("Person");
		expect(person.name).toBe("Jonathan Soto");
		expect(person.jobTitle).toBe("Backend & Full-Stack Engineer");
		expect(person.sameAs).toEqual([
			"https://github.com/jonasotoaguilar",
			"https://jonasotoaguilar.itch.io/wealthquest",
		]);
	});
});

describe("404 page", () => {
	it("renders the Persona identity with a single action back to /", async () => {
		const html = await render(NotFound);

		expect(html).toContain("Jonathan Soto");
		expect(html).toContain("Backend &amp; Full-Stack Engineer");
		const anchors = html.match(/<a\b[^>]*>/g) ?? [];
		expect(anchors).toHaveLength(1);
		expect(anchors[0]).toContain('href="/"');
		expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
	});

	it("does not embed JSON-LD on the 404 page", async () => {
		const html = await render(NotFound);

		expect(html).not.toContain("application/ld+json");
	});
});
