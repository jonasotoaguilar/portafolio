import { describe, expect, it } from "vitest";
import { containsDenied, DENY_PATTERNS, findDenied } from "./copy-deny";

describe("copy-deny — finished-product deny-list seam (test-only)", () => {
  it("exposes deny patterns as RegExp array including core tokens", () => {
    expect(Array.isArray(DENY_PATTERNS)).toBe(true);
    expect(DENY_PATTERNS.length).toBeGreaterThan(10);
    for (const re of DENY_PATTERNS) expect(re).toBeInstanceOf(RegExp);
    const sources = DENY_PATTERNS.map((r) => r.source);
    // core tokens from task 1.1
    expect(sources.join("|")).toMatch(/\\bCV\\b/);
    expect(sources.join("|").toLowerCase()).toMatch(/tel:/);
    expect(sources.join("|")).toMatch(/8894/);
    expect(sources.join("|")).toMatch(/2050/);
    expect(sources.join("|")).toMatch(/\+56/);
  });

  it("flags denied CV word-boundary but not substrings", () => {
    expect(containsDenied("My CV is available")).toBe(true);
    expect(containsDenied("As stated in CV — automation")).toBe(true);
    expect(containsDenied("cover letter")).toBe(false);
    expect(containsDenied("CVS pharmacy")).toBe(false);
    expect(containsDenied("Backend Engineer — open to remote")).toBe(false);
  });

  it("flags phone and tel tokens", () => {
    expect(containsDenied("tel:+56 9 8894 2050")).toBe(true);
    expect(containsDenied("call tel: 123")).toBe(true);
    expect(containsDenied("telephone: 123")).toBe(true);
    expect(containsDenied("8894")).toBe(true);
    expect(containsDenied("2050")).toBe(true);
    expect(containsDenied("+56 9 1234 5678")).toBe(true);
    // clean
    expect(containsDenied("Contact via email")).toBe(false);
  });

  it("flags provenance teaching copy", () => {
    expect(containsDenied("view source to verify")).toBe(true);
    expect(containsDenied("owner-authorized CV")).toBe(true);
    expect(containsDenied("privacy by omission — not by obfuscation")).toBe(true);
    expect(containsDenied("JSON-LD Person")).toBe(true);
    expect(containsDenied("No fabricated URL is shipped")).toBe(true);
    expect(containsDenied("text-only until a verified URL is confirmed")).toBe(true);
    expect(containsDenied("No form provider, no storage")).toBe(true);
    expect(containsDenied("facts-only from public GitHub")).toBe(true);
    expect(containsDenied("as verified from the CV")).toBe(true);
    expect(containsDenied("facts trace to the CV")).toBe(true); // CV word-boundary alone denies
    expect(containsDenied("from CV and GitHub")).toBe(true);
    // clean product copy does not flag
    expect(containsDenied("Reach out directly — email or GitHub. Response within a day.")).toBe(
      false,
    );
    expect(containsDenied("Projects link to public repos with clear shipped status.")).toBe(false);
  });

  it("findDenied returns matching pattern sources", () => {
    const hits = findDenied("My CV and tel: 8894");
    expect(hits.length).toBeGreaterThanOrEqual(2);
    expect(hits.join("|")).toMatch(/CV/);
    expect(hits.join("|")).toMatch(/tel/);
    expect(findDenied("Clean product copy — Backend Engineer in Santiago")).toEqual([]);
  });

  it("distinguishes from plausible wrong impl that checks only lowercase", () => {
    // DENY must be case-insensitive for phrases like view source
    expect(containsDenied("VIEW SOURCE to verify")).toBe(true);
    expect(containsDenied("View Source")).toBe(true);
    expect(containsDenied("Privacy By Omission")).toBe(true);
  });

  it("does not allow product pages to import test-only seam (static check)", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const pagesDir = path.resolve("src/pages");
    const entries: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.isFile() && (p.endsWith(".astro") || p.endsWith(".ts"))) entries.push(p);
      }
    };
    if (fs.existsSync(pagesDir)) walk(pagesDir);
    // also check components and data that are product code
    const productDirs = ["src/components", "src/data", "src/layouts"];
    for (const d of productDirs) {
      const abs = path.resolve(d);
      if (fs.existsSync(abs)) walk(abs);
    }
    const offenders: string[] = [];
    for (const file of entries) {
      const content = fs.readFileSync(file, "utf8");
      if (content.includes("copy-deny")) offenders.push(file);
    }
    expect(offenders, `product files must not import copy-deny: ${offenders.join(", ")}`).toEqual(
      [],
    );
  });
});
