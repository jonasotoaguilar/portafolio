export type ExperienceItem = {
  org: string;
  role: string;
  period: string;
  location: string;
  detail: string;
  bullets: string[];
};

export const experiences: ExperienceItem[] = [
  {
    org: "Productos Barber Chile",
    role: "Vendedor / Atención al Cliente",
    period: "2020 — 2026",
    location: "Santiago, Chile",
    detail: "Customer-facing sales and service in retail operations — continuity through studies.",
    bullets: [
      "Client advisory and post-sale follow-up",
      "Stock coordination and point-of-sale handling",
    ],
  },
  {
    org: "Policomp",
    role: "Práctica — Soporte TI",
    period: "Jan 2020 — Mar 2020",
    location: "Santiago, Chile",
    detail: "Technical support internship — hardware/software assistance and user support.",
    bullets: ["Workstation setup and troubleshooting", "User support and maintenance tasks"],
  },
];

export const education = {
  school: "Universidad de Santiago de Chile (USACH)",
  program: "Ing. Ejecución en Computación e Informática",
  period: "Mar 2020 — Apr 2025",
  thesis: {
    title: "WealthQuest — Blended Games",
    note: "Blended-games thesis; Author Jonathan Soto",
  },
  languages: [
    { name: "Spanish", level: "Native" },
    { name: "English", level: "Basic — technical reading" },
  ],
} as const;
