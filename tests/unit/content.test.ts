import { describe, expect, it } from "vitest";
import {
	assertExactlyFour,
	isExternalLink,
	sortByOrder,
} from "../../src/lib/content/projects";
import {
	projectSchema,
	siteConfigSchema,
	skillsSchema,
} from "../../src/lib/content/schemas";

const VALID_PROJECT = {
	title: "ServiceFlow",
	description: "Event-driven service orchestration in Go.",
	stack: ["Go", "TypeScript"],
	link: "https://example.com/serviceflow",
	order: 1,
};

describe("projectSchema", () => {
	it("parses a valid project", () => {
		const project = projectSchema.parse(VALID_PROJECT);

		expect(project.title).toBe("ServiceFlow");
		expect(project.description).toContain("Go");
		expect(project.stack).toEqual(["Go", "TypeScript"]);
		expect(project.link).toBe("https://example.com/serviceflow");
		expect(project.external).toBe(false);
	});

	it("preserves an explicit external: true", () => {
		const project = projectSchema.parse({ ...VALID_PROJECT, external: true });

		expect(project.external).toBe(true);
	});

	it("rejects a non-boolean external value", () => {
		expect(() =>
			projectSchema.parse({ ...VALID_PROJECT, external: "yes" }),
		).toThrow();
	});

	it("rejects an empty stack", () => {
		expect(() =>
			projectSchema.parse({ ...VALID_PROJECT, stack: [] }),
		).toThrow();
	});

	it("rejects a project missing the required link", () => {
		const { link: _link, ...withoutLink } = VALID_PROJECT;
		expect(() => projectSchema.parse(withoutLink)).toThrow();
	});
});

describe("projectSchema without featured", () => {
	it("parses a project without exposing a featured property", () => {
		const project = projectSchema.parse(VALID_PROJECT);

		expect(project.title).toBe("ServiceFlow");
		expect("featured" in project).toBe(false);
	});

	it("strips a stale explicit featured key from the parsed project", () => {
		const project = projectSchema.parse({ ...VALID_PROJECT, featured: false });

		expect(project.external).toBe(false);
		expect("featured" in project).toBe(false);
	});
});

describe("assertExactlyFour", () => {
	it("throws when fewer than four entries exist", () => {
		const entries = [1, 2, 3];

		expect(() => assertExactlyFour(entries)).toThrow(/exactly 4/);
	});

	it("throws when more than four entries exist", () => {
		const entries = [1, 2, 3, 4, 5];

		expect(() => assertExactlyFour(entries)).toThrow(/exactly 4/);
	});

	it("returns the four entries unchanged", () => {
		const entries = [1, 2, 3, 4];

		expect(assertExactlyFour(entries)).toEqual([1, 2, 3, 4]);
	});
});

describe("sortByOrder", () => {
	it("sorts entries by declared order", () => {
		const entries = [
			{ order: 3, title: "EventCommerce" },
			{ order: 1, title: "ServiceFlow" },
			{ order: 2, title: "WealthQuest" },
		];

		const sorted = sortByOrder(entries);

		expect(sorted.map((entry) => entry.title)).toEqual([
			"ServiceFlow",
			"WealthQuest",
			"EventCommerce",
		]);
	});

	it("does not mutate the input array", () => {
		const entries = [
			{ order: 2, title: "B" },
			{ order: 1, title: "A" },
		];

		sortByOrder(entries);

		expect(entries.map((entry) => entry.title)).toEqual(["B", "A"]);
	});
});

describe("skillsSchema", () => {
	it("parses grouped skills with plain names", () => {
		const skills = skillsSchema.parse({
			backend: ["Go", "TypeScript", "Python"],
			frontend: ["Astro", "Tailwind CSS"],
		});

		expect(skills.backend).toEqual(["Go", "TypeScript", "Python"]);
		expect(skills.frontend).toContain("Astro");
	});

	it("rejects a group with an empty skill list", () => {
		expect(() => skillsSchema.parse({ backend: [] })).toThrow();
	});

	it("rejects non-string values (no level numbers or metrics)", () => {
		expect(() => skillsSchema.parse({ backend: ["Go", 5] })).toThrow();
	});

	it("rejects object-valued skills (fake metric objects)", () => {
		expect(() =>
			skillsSchema.parse({ backend: [{ name: "Go", level: 5 }] }),
		).toThrow();
	});
});

describe("isExternalLink", () => {
	it("treats absolute off-site URLs as external", () => {
		expect(
			isExternalLink("https://github.com/jonasotoaguilar/ServiceFlow"),
		).toBe(true);
	});

	it("treats absolute http:// off-site URLs as external", () => {
		expect(isExternalLink("http://example.com/serviceflow")).toBe(true);
	});

	it("treats relative URLs and non-http(s) links as internal", () => {
		expect(isExternalLink("/")).toBe(false);
		expect(isExternalLink("/#projects")).toBe(false);
		expect(isExternalLink("mailto:jona@example.com")).toBe(false);
	});

	it("compares origins when the site origin is known", () => {
		expect(
			isExternalLink(
				"https://jonasotoaguilar.itch.io/wealthquest",
				"https://jonasotoaguilar.dev",
			),
		).toBe(true);
		expect(
			isExternalLink(
				"https://jonasotoaguilar.dev/#contact",
				"https://jonasotoaguilar.dev",
			),
		).toBe(false);
	});
});

describe("siteConfigSchema", () => {
	it("parses the full site config and surfaces the contact email", () => {
		const config = siteConfigSchema.parse({
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
		});

		expect(config.email).toBe("jonathansoto.dev@gmail.com");
		expect(config.focusAreas).toHaveLength(5);
	});

	it("rejects config missing the required email", () => {
		expect(() =>
			siteConfigSchema.parse({
				name: "Jonathan Soto",
				role: "Backend & Full-Stack Engineer",
			}),
		).toThrow();
	});

	it("surfaces the exact role and contact email from config", () => {
		const config = siteConfigSchema.parse({
			name: "Jonathan Soto",
			role: "Backend & Full-Stack Engineer",
			tagline: "Engineer with a Persona-3 soul.",
			focusAreas: ["Go", "TypeScript"],
			email: "jonathansoto.dev@gmail.com",
			socials: {
				github: "https://github.com/jonasotoaguilar",
				wealthquest: "https://jonasotoaguilar.itch.io/wealthquest",
			},
			pageTitle: "Jonathan Soto · Backend & Full-Stack Engineer",
		});

		expect(config.role).toBe("Backend & Full-Stack Engineer");
		expect(config.email).toBe("jonathansoto.dev@gmail.com");
	});

	it("rejects config missing the role or an empty focus-areas list", () => {
		const base = {
			name: "Jonathan Soto",
			tagline: "Engineer with a Persona-3 soul.",
			email: "jonathansoto.dev@gmail.com",
			socials: {
				github: "https://github.com/jonasotoaguilar",
				wealthquest: "https://jonasotoaguilar.itch.io/wealthquest",
			},
			pageTitle: "Jonathan Soto · Backend & Full-Stack Engineer",
		};
		const { role: _role, ...withoutRole } = {
			...base,
			role: "Backend & Full-Stack Engineer",
			focusAreas: ["Go"],
		};
		expect(() => siteConfigSchema.parse(withoutRole)).toThrow();
		expect(() =>
			siteConfigSchema.parse({ ...base, role: "R", focusAreas: [] }),
		).toThrow();
	});
});
