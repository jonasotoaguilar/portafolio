import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const distDir = resolve(import.meta.dirname, "../dist");

describe("Build output", () => {
  it("generates index.html", () => {
    const indexPath = resolve(distDir, "index.html");
    expect(existsSync(indexPath)).toBe(true);
    const content = readFileSync(indexPath, "utf-8");
    expect(content).toContain("Jonathan Soto");
    expect(content.toLowerCase()).toContain("<!doctype html>");
  });

  it("generates 404.html", () => {
    const path404 = resolve(distDir, "404.html");
    expect(existsSync(path404)).toBe(true);
  });

  it("generates sitemap", () => {
    const sitemapPath = resolve(distDir, "sitemap-index.xml");
    expect(existsSync(sitemapPath)).toBe(true);
  });
});
