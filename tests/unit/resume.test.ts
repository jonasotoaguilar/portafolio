import { describe, expect, it } from "vitest";
import { resumeSchema } from "../../src/lib/content/schemas";

const VALID_RESUME = {
	education: [
		{
			institution: "USACH",
			title: "Ingeniería de Ejecución en Computación e Informática",
			period: "Mar 2020–Apr 2025",
		},
		{
			institution: "Technical education",
			title: "Telecommunications",
			period: "Mar 2017–Nov 2019",
		},
	],
	experience: [
		{
			company: "Productos Barber Chile",
			role: "Sales and customer service",
			period: "2020–2026",
			details: ["Sales and customer service."],
		},
		{
			company: "Policomp",
			role: "IT Support Intern",
			period: "Jan–Mar 2020",
			details: ["IT support internship."],
		},
	],
	projects: [
		{
			name: "ServiceFlow",
			description: "Service order and ticket management.",
		},
		{
			name: "WealthQuest",
			published: "May 2025",
			description: "Thesis game built with Unity.",
		},
	],
	skills: [
		"Python",
		"Java",
		"Spring Boot",
		"TypeScript/JavaScript",
		"SQL and related tooling",
	],
	languages: [
		{ name: "Spanish", proficiency: "native" },
		{ name: "English", proficiency: "basic technical reading" },
	],
};

describe("resumeSchema", () => {
	it("parses the verified resume facts", () => {
		const resume = resumeSchema.parse(VALID_RESUME);

		expect(resume.education[0]).toMatchObject({
			institution: "USACH",
			period: "Mar 2020–Apr 2025",
		});
		expect(resume.experience[0].company).toBe("Productos Barber Chile");
		expect(resume.experience[1]).toMatchObject({
			company: "Policomp",
			period: "Jan–Mar 2020",
		});
		expect(resume.projects[1].published).toBe("May 2025");
		expect(resume.skills).toEqual([
			"Python",
			"Java",
			"Spring Boot",
			"TypeScript/JavaScript",
			"SQL and related tooling",
		]);
	});

	it("accepts proficiency and never exposes a level field", () => {
		const resume = resumeSchema.parse(VALID_RESUME);

		expect(resume.languages[0].proficiency).toBe("native");
		expect("level" in resume.languages[0]).toBe(false);
	});

	it("rejects a language entry carrying a level key", () => {
		expect(() =>
			resumeSchema.parse({
				...VALID_RESUME,
				languages: [{ name: "Spanish", level: "native" }],
			}),
		).toThrow();
	});

	it("rejects an experience entry carrying a rank key", () => {
		expect(() =>
			resumeSchema.parse({
				...VALID_RESUME,
				experience: [
					{
						company: "Policomp",
						role: "IT Support Intern",
						period: "Jan–Mar 2020",
						details: [],
						rank: "Senior",
					},
				],
			}),
		).toThrow();
	});

	it("rejects metric keys on entries and at the top level", () => {
		expect(() =>
			resumeSchema.parse({
				...VALID_RESUME,
				experience: [
					{
						company: "Policomp",
						role: "IT Support Intern",
						period: "Jan–Mar 2020",
						details: [],
						years: 5,
					},
				],
			}),
		).toThrow();
		expect(() =>
			resumeSchema.parse({ ...VALID_RESUME, yearsOfExperience: 5 }),
		).toThrow();
	});

	it("rejects skills that are not plain string names", () => {
		expect(() =>
			resumeSchema.parse({
				...VALID_RESUME,
				skills: [{ name: "Python", level: 3 }],
			}),
		).toThrow();
		expect(() =>
			resumeSchema.parse({ ...VALID_RESUME, skills: ["Python", 5] }),
		).toThrow();
	});

	it("rejects an empty required section", () => {
		expect(() =>
			resumeSchema.parse({ ...VALID_RESUME, education: [] }),
		).toThrow();
	});

	it("rejects an entry missing a required field", () => {
		const [first, ...rest] = VALID_RESUME.education;
		const { title: _title, ...withoutTitle } = first;
		expect(() =>
			resumeSchema.parse({
				...VALID_RESUME,
				education: [withoutTitle, ...rest],
			}),
		).toThrow();
		const [firstExperience, ...restExperience] = VALID_RESUME.experience;
		const { details: _details, ...withoutDetails } = firstExperience;
		expect(() =>
			resumeSchema.parse({
				...VALID_RESUME,
				experience: [withoutDetails, ...restExperience],
			}),
		).toThrow();
	});
});
