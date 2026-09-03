import { describe, expect, it } from "vitest";
import { canonicalUrl, ogImageUrl } from "./site-helpers";

describe("canonicalUrl — behavioral correctness of canonical generation", () => {
  it("returns undefined when site unresolved (privacy/canonical invariant)", () => {
    expect(canonicalUrl(undefined, "/projects")).toBeUndefined();
    expect(canonicalUrl("", "/projects")).toBeUndefined();
    expect(canonicalUrl(undefined, "/")).toBeUndefined();
  });

  it("joins site + path with leading slash normalization", () => {
    expect(canonicalUrl("https://example.com", "/projects")).toBe("https://example.com/projects");
    expect(canonicalUrl("https://example.com/", "about")).toBe("https://example.com/about");
    expect(canonicalUrl("https://example.com/", "/about")).toBe("https://example.com/about");
  });

  it("strips only single trailing slash from site", () => {
    expect(canonicalUrl("https://example.com/", "/")).toBe("https://example.com/");
    expect(canonicalUrl("https://example.com", "/")).toBe("https://example.com/");
    expect(canonicalUrl("https://example.com///", "/projects")).toBe(
      "https://example.com///projects",
    );
    // actual helper only trims one slash — this documents current observable behavior
    // if double slash existed, it would remain; consumer is SITE env which is trim()ed single.
  });

  it("handles root and nested paths", () => {
    expect(canonicalUrl("https://example.com", "/skills")).toBe("https://example.com/skills");
    expect(canonicalUrl("https://example.com", "/experience")).toBe(
      "https://example.com/experience",
    );
  });

  it("distinguishes from plausible wrong impl that returns empty string", () => {
    const r = canonicalUrl(undefined, "/projects");
    expect(r).not.toBe("");
    expect(r).toBeUndefined();
  });
});

describe("ogImageUrl — sitemap/SEO invariant", () => {
  it("returns undefined when site unresolved", () => {
    expect(ogImageUrl(undefined)).toBeUndefined();
    expect(ogImageUrl("")).toBeUndefined();
  });

  it("builds og path with trailing slash tolerance", () => {
    expect(ogImageUrl("https://example.com")).toBe("https://example.com/og.png");
    expect(ogImageUrl("https://example.com/")).toBe("https://example.com/og.png");
  });

  it("does not fabricate URL when site missing", () => {
    expect(ogImageUrl(undefined)).not.toBe("/og.png");
    expect(ogImageUrl(undefined)).toBeUndefined();
  });
});
