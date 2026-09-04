import { describe, expect, it } from "vitest";
import { canonicalUrl, ogImageUrl } from "./site-helpers";
// Slice B RED: helpers must expose deterministic OG dimensions and never fabricate origin
// This import will fail until GREEN creates the seam — guarantees RED
import * as helpers from "./site-helpers";

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

  it("never fabricates origin for canonical when SITE unset", () => {
    // helpers must not invent http://localhost or similar when site undefined
    expect(canonicalUrl(undefined, "/")).toBeUndefined();
    expect(canonicalUrl("", "/about")).toBeUndefined();
    expect(ogImageUrl(undefined)).toBeUndefined();
    expect(ogImageUrl("")).toBeUndefined();
  });
});

describe("seo-discoverability — deterministic helpers, unset SITE returns undefined", () => {
  it("exposes OG dimensions 1200x630 as designed", () => {
    expect((helpers as unknown as { OG_IMAGE_WIDTH: number }).OG_IMAGE_WIDTH).toBe(1200);
    expect((helpers as unknown as { OG_IMAGE_HEIGHT: number }).OG_IMAGE_HEIGHT).toBe(630);
  });

  it("helpers never invent origin — unset SITE yields undefined for all URL helpers", () => {
    // canonicalUrl and ogImageUrl already tested; also verify no helper invents origin via fallback
    expect(canonicalUrl(undefined, "/projects")).toBeUndefined();
    expect(ogImageUrl(undefined)).toBeUndefined();
    // ensure helper does not return '/' or '/og.png' as fabricated relative origin
    expect(canonicalUrl(undefined, "/")).not.toBe("/");
    expect(ogImageUrl(undefined)).not.toBe("/og.png");
    expect(ogImageUrl(undefined)).not.toBe("http://localhost/og.png");
  });

  it("site helpers are pure and deterministic — same inputs produce same outputs", () => {
    const a = canonicalUrl("https://example.test", "/about");
    const b = canonicalUrl("https://example.test", "/about");
    expect(a).toBe(b);
    expect(a).toBe("https://example.test/about");
    const ogA = ogImageUrl("https://example.test");
    const ogB = ogImageUrl("https://example.test");
    expect(ogA).toBe(ogB);
    expect(ogA).toBe("https://example.test/og.png");
  });
});
