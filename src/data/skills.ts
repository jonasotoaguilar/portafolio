export type SkillGroup = {
  label: string;
  kicker: string;
  items: string[];
  note?: string;
};

export const skillGroups: SkillGroup[] = [
  {
    kicker: "01",
    label: "Languages",
    items: ["Python", "TypeScript", "JavaScript", "Java", "SQL"],
  },
  {
    kicker: "02",
    label: "Frameworks",
    items: ["Spring Boot", "Node.js", "Next.js", "React (basic–mid)"],
  },
  {
    kicker: "03",
    label: "Data",
    items: ["PostgreSQL", "MySQL", "NoSQL", "Redis (basic)", "pgvector"],
  },
  {
    kicker: "04",
    label: "APIs & Quality",
    items: ["REST", "Testing", "TDD", "Zod", "Vitest", "Pytest"],
  },
  {
    kicker: "05",
    label: "DevOps",
    items: ["Docker & Compose", "GitHub Actions", "Linux", "Nginx (basic)"],
  },
  {
    kicker: "06",
    label: "Cloud & Deploy",
    items: ["Dokploy", "DigitalOcean (fundamentals)", "MinIO / S3"],
  },
  {
    kicker: "07",
    label: "AI-Assisted Workflows",
    items: [
      "OpenCode / AI tooling",
      "Prompt-aware generation (from CV)",
      "Evaluation harness mindset",
    ],
    note: "As stated in CV — automation to amplify, not replace, engineering judgment.",
  },
];

export const positioning = {
  primary: ["Python", "TypeScript", "Java"],
  statement: "Backend range grounded in shipped repos and verified roles — no inflated seniority.",
};
