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
  // Public URL remains unverified; do not fabricate href from handle
  location: "Santiago, Chile",
  availability: "Open to remote",
  locale: "en",
} as const;

export type Site = typeof site;
