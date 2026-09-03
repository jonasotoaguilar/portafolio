export const site = {
  name: "Jonathan Soto",
  title: "Backend Engineer — Jonathan Soto",
  shortTitle: "Jonathan Soto — Backend Engineer",
  description:
    "Backend Engineer in Santiago, Chile — open to remote. Python, TypeScript, Java. Shipped projects, verifiable experience, direct contact.",
  email: "jonathansoto.dev@gmail.com",
  github: "https://github.com/jonasotoaguilar",
  githubHandle: "jonasotoaguilar",
  linkedinHandle: "jonathan-soto-dev",
  // LinkedIn URL constructed from handle — not externally fetched; rel="me" signals ownership
  linkedinUrl: "https://www.linkedin.com/in/jonathan-soto-dev",
  location: "Santiago, Chile",
  availability: "Open to remote",
  locale: "en",
} as const;

export type Site = typeof site;
