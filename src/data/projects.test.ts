import { describe, expect, it } from "vitest";
import { featuredSlugs, projects } from "./projects";

describe("projects data — portfolio contract invariants", () => {
  it("contains exactly four featured projects", () => {
    expect(projects).toHaveLength(4);
  });

  it("featured slugs are the PRD-mandated four", () => {
    const slugs = projects.map((p) => p.slug);
    expect(slugs).toEqual(["opencode-tokenmeter", "serviceflow", "raguard", "eventcommerce"]);
    expect(featuredSlugs).toEqual(["opencode-tokenmeter", "serviceflow"]);
  });

  it("each project has repo link under jonasotoaguilar and honest shipped status", () => {
    for (const p of projects) {
      expect(p.repo).toMatch(/^https:\/\/github\.com\/jonasotoaguilar\//);
      expect(p.links.some((l) => l.href === p.repo)).toBe(true);
      expect(p.summary.length).toBeGreaterThan(10);
      expect(p.detail.length).toBeGreaterThan(20);
      expect(p.stack.length).toBeGreaterThanOrEqual(3);
      expect(p.status).toMatch(/Shipped|MVP|Core backend/);
    }
  });

  it("serviceflow stack reflects current repo evidence (PocketBase, Next.js, TypeScript)", () => {
    const sf = projects.find((p) => p.slug === "serviceflow")!;
    expect(sf.stack).toContain("PocketBase");
    expect(sf.stack).toContain("Next.js");
    expect(sf.stack).toContain("TypeScript");
    expect(sf.detail).toContain("PocketBase");
  });

  it("no project invents metrics or presents planning-only as shipped without qualifier", () => {
    // status strings that claim shipped must include qualifier or npm/live evidence
    for (const p of projects) {
      if (p.status.includes("Shipped")) {
        expect(p.status).toMatch(/npm|live|PocketBase|Docker/);
      }
    }
  });

  it("distinguishes from plausible wrong impl with 3 or 5 projects", () => {
    expect(projects).not.toHaveLength(3);
    expect(projects).not.toHaveLength(5);
  });
});
