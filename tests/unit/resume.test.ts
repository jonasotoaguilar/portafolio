import { describe, expect, it } from "vitest";
import { resumeSchema } from "../../src/lib/content/schemas";

const VALID_RESUME = {
	degree: {
		institution: "USACH",
		title: "Computer Science and Informatics Engineer",
		period: "Mar 2020–Apr 2025",
	},
	experience: [
		{
			company: "Productos Barber Chile",
			role: "Sales and customer service",
			period: "2020–2026",
			description:
				"Provided sales and customer service, attending to customers and supporting the business's day-to-day commercial operations.",
		},
		{
			company: "Policomp",
			role: "IT Support Intern",
			period: "Jan–Mar 2020",
			description:
				"Provided IT support during a professional internship, assisting with day-to-day technical requests.",
		},
	],
	summary:
		"Junior Backend Developer and Computer Science and Informatics Engineer (USACH), with a foundation in Python, Java, and Spring Boot.",
};

describe("resumeSchema", () => {
	it("parses the verified resume facts", () => {
		const resume = resumeSchema.parse(VALID_RESUME);

		expect(resume.degree).toMatchObject({
			institution: "USACH",
			title: "Computer Science and Informatics Engineer",
			period: "Mar 2020–Apr 2025",
		});
		expect(resume.experience[0]).toMatchObject({
			company: "Productos Barber Chile",
			period: "2020–2026",
		});
		expect(resume.experience[1]).toMatchObject({
			company: "Policomp",
			period: "Jan–Mar 2020",
		});
		expect(resume.summary).toContain("Junior Backend Developer");
	});

	it("rejects project and skill sections: they have their own views", () => {
		expect(() =>
			resumeSchema.parse({
				...VALID_RESUME,
				projects: [{ name: "ServiceFlow", description: "Tickets." }],
			}),
		).toThrow();
		expect(() =>
			resumeSchema.parse({
				...VALID_RESUME,
				skills: ["Python"],
			}),
		).toThrow();
		expect(() =>
			resumeSchema.parse({
				...VALID_RESUME,
				languages: [{ name: "Spanish", proficiency: "native" }],
			}),
		).toThrow();
	});

	it("rejects an experience entry carrying a rank or metric key", () => {
		expect(() =>
			resumeSchema.parse({
				...VALID_RESUME,
				experience: [
					{
						...VALID_RESUME.experience[0],
						rank: "Senior",
					},
				],
			}),
		).toThrow();
		expect(() =>
			resumeSchema.parse({
				...VALID_RESUME,
				experience: [
					{
						...VALID_RESUME.experience[0],
						years: 5,
					},
				],
			}),
		).toThrow();
	});

	it("rejects metric keys at the top level", () => {
		expect(() =>
			resumeSchema.parse({ ...VALID_RESUME, yearsOfExperience: 5 }),
		).toThrow();
	});

	it("rejects an experience entry without a description", () => {
		const [first, ...rest] = VALID_RESUME.experience;
		const { description: _description, ...withoutDescription } = first;
		expect(() =>
			resumeSchema.parse({
				...VALID_RESUME,
				experience: [withoutDescription, ...rest],
			}),
		).toThrow();
	});

	it("rejects an empty required section", () => {
		expect(() =>
			resumeSchema.parse({ ...VALID_RESUME, experience: [] }),
		).toThrow();
	});

	it("rejects an entry missing a required field", () => {
		const { period: _period, ...withoutPeriod } = VALID_RESUME.degree;
		expect(() =>
			resumeSchema.parse({ ...VALID_RESUME, degree: withoutPeriod }),
		).toThrow();
	});
});
