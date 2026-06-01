import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

/**
 * Validates the actual production content files against the expected
 * schema structure defined in src/content.config.ts.
 *
 * This test reads REAL MD content files from the filesystem —
 * the same files that Astro's content collections load at build time.
 * It does NOT duplicate the schema definition; it verifies that the
 * actual data on disk conforms to the expected structure.
 *
 * This is a behavioral test: if someone changes content.config.ts
 * without updating the content files, this test reflects reality.
 */

interface ProjectFrontmatter {
  title?: string;
  description?: string;
  liveUrl?: string;
  repoUrl?: string;
  thesisUrl?: string;
  category?: string;
  tags?: string[];
  featured?: boolean | string;
  date?: string | Date;
  image?: string;
  imageAlt?: string;
  [key: string]: unknown;
}

function parseFrontmatter(raw: string): ProjectFrontmatter {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yamlStr = match[1] ?? "";
  const result: Record<string, unknown> = {};

  // Simple YAML key-value parser (handles string, date, and > folded scalars)
  const lines = yamlStr.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line === undefined) {
      i++;
      continue;
    }
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kvMatch) {
      const key = kvMatch[1] ?? "";
      let value = (kvMatch[2] ?? "").trim();

      // Handle > (folded block scalar)
      if (value === ">" || value === ">-") {
        i++;
        const foldedLines: string[] = [];
        while (i < lines.length && (lines[i] ?? "").startsWith("  ")) {
          foldedLines.push((lines[i] ?? "").trim());
          i++;
        }
        value = foldedLines.join(" ");
        i--; // compensate for loop increment
      }

      // Strip quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // Parse arrays
      if (value.startsWith("[") && value.endsWith("]")) {
        result[key] = value;
        i++;
        continue;
      }

      result[key] = value || true;
    }
    i++;
  }

  return result as ProjectFrontmatter;
}

function getContentFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && (e.name.endsWith(".mdx") || e.name.endsWith(".md")))
    .map((e) => join(dir, e.name));
}

const projectsDir = resolve(import.meta.dirname, "../src/content/projects");

describe("Production content — projects collection", () => {
  const files = getContentFiles(projectsDir);

  it("has at least 4 project entries", () => {
    expect(files.length).toBeGreaterThanOrEqual(4);
  });

  const entries = files.map((f) => {
    const raw = readFileSync(f, "utf-8");
    return { path: f, fm: parseFrontmatter(raw) };
  });

  it("every project has a title", () => {
    for (const entry of entries) {
      expect(entry.fm.title, `${entry.path}: missing title`).toBeTruthy();
    }
  });

  it("every project has a description", () => {
    for (const entry of entries) {
      expect(entry.fm.description, `${entry.path}: missing description`).toBeTruthy();
    }
  });

  it("all project URLs are under a verified domain", () => {
    const allowedDomains =
      /(?:github\.com\/(jonasotoaguilar|BlendedGames-bGames)|jonasotoaguilar\.itch\.io|jonasotoaguilar\.space|usach\.primo\.exlibrisgroup\.com)/;
    for (const entry of entries) {
      for (const field of ["liveUrl", "repoUrl", "thesisUrl"] as const) {
        const url = entry.fm[field];
        if (url) {
          expect(url, `${entry.path}: ${field} not under verified domain`).toMatch(allowedDomains);
        }
      }
    }
  });

  it("every project has at least one link (repoUrl, liveUrl, or thesisUrl)", () => {
    for (const entry of entries) {
      const hasLink = entry.fm.repoUrl || entry.fm.liveUrl || entry.fm.thesisUrl;
      expect(hasLink, `${entry.path}: must have at least one link field`).toBeTruthy();
    }
  });

  it("at least one project is featured", () => {
    const featured = entries.filter((e) => e.fm.featured === true || e.fm.featured === "true");
    expect(featured.length, "must have ≥1 featured project").toBeGreaterThanOrEqual(1);
  });

  it("no project has placeholder title or description", () => {
    for (const entry of entries) {
      expect(entry.fm.title?.toLowerCase(), `${entry.path}: placeholder title`).not.toContain(
        "placeholder",
      );
      expect(entry.fm.description?.toLowerCase(), `${entry.path}: placeholder desc`).not.toContain(
        "placeholder",
      );
    }
  });

  it("every project has a category label", () => {
    for (const entry of entries) {
      expect(entry.fm.category, `${entry.path}: missing category`).toBeTruthy();
    }
  });

  it("projects with images have imageAlt for accessibility", () => {
    for (const entry of entries) {
      if (entry.fm.image) {
        expect(entry.fm.imageAlt, `${entry.path}: image present but missing imageAlt`).toBeTruthy();
      }
    }
  });
});
