import { describe, expect, it } from "vitest";
import { getNextIndex, toNavKey } from "./nav-helpers";

describe("getNextIndex — roving focus invariant", () => {
  it("wraps ArrowRight/ArrowDown at end to start", () => {
    expect(getNextIndex(5, 6, "ArrowRight")).toBe(0);
    expect(getNextIndex(5, 6, "ArrowDown")).toBe(0);
  });
  it("wraps ArrowLeft/ArrowUp at start to end", () => {
    expect(getNextIndex(0, 6, "ArrowLeft")).toBe(5);
    expect(getNextIndex(0, 6, "ArrowUp")).toBe(5);
  });
  it("moves forward/backward inside bounds", () => {
    expect(getNextIndex(2, 6, "ArrowRight")).toBe(3);
    expect(getNextIndex(2, 6, "ArrowLeft")).toBe(1);
    expect(getNextIndex(1, 6, "ArrowDown")).toBe(2);
    expect(getNextIndex(3, 6, "ArrowUp")).toBe(2);
  });
  it("Home/End jump to edges regardless of current", () => {
    expect(getNextIndex(3, 6, "Home")).toBe(0);
    expect(getNextIndex(0, 6, "End")).toBe(5);
    expect(getNextIndex(5, 6, "Home")).toBe(0);
    expect(getNextIndex(0, 6, "Home")).toBe(0);
  });
  it("handles empty and single-item edge cases", () => {
    expect(getNextIndex(0, 0, "ArrowRight")).toBe(0);
    expect(getNextIndex(0, 1, "ArrowRight")).toBe(0);
    expect(getNextIndex(0, 1, "ArrowLeft")).toBe(0);
    expect(getNextIndex(0, 1, "End")).toBe(0);
    expect(getNextIndex(0, -1, "ArrowRight")).toBe(0);
  });
  it("distinguishes wrap from plausible off-by-one impl", () => {
    // wrong impl would return total instead of 0 or -1 instead of last
    expect(getNextIndex(5, 6, "ArrowRight")).not.toBe(6);
    expect(getNextIndex(0, 6, "ArrowLeft")).not.toBe(-1);
    expect(getNextIndex(0, 6, "ArrowLeft")).toBe(5);
  });
});

describe("toNavKey — key normalization invariant", () => {
  it("accepts all nav keys", () => {
    expect(toNavKey("ArrowRight")).toBe("ArrowRight");
    expect(toNavKey("ArrowLeft")).toBe("ArrowLeft");
    expect(toNavKey("ArrowDown")).toBe("ArrowDown");
    expect(toNavKey("ArrowUp")).toBe("ArrowUp");
    expect(toNavKey("Home")).toBe("Home");
    expect(toNavKey("End")).toBe("End");
  });
  it("rejects non-nav keys including activation keys", () => {
    expect(toNavKey("a")).toBeNull();
    expect(toNavKey("Enter")).toBeNull();
    expect(toNavKey(" ")).toBeNull();
    expect(toNavKey("Escape")).toBeNull();
    expect(toNavKey("Tab")).toBeNull();
    expect(toNavKey("Arrowright")).toBeNull(); // case-sensitive
  });
  it("is the seam for keyboard roving — distinguishes nav from other keys", () => {
    // plausible wrong impl would accept Enter/Space as nav
    expect(toNavKey("Enter")).toBeNull();
    expect(toNavKey(" ")).toBeNull();
    expect(toNavKey("ArrowRight")).not.toBeNull();
  });
});
