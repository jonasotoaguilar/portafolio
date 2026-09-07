import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("MOTION token seam — balanced visible motion package", () => {
  it("exports MOTION with exact admitted numbers", async () => {
    const { MOTION } = await import("./motion-tokens.js");
    expect(MOTION.routeFade).toBe("250ms");
    expect(MOTION.entranceY).toBe(24);
    expect(MOTION.entranceDuration).toBe(0.62);
    expect(MOTION.entranceStagger).toBe(0.08);
    expect(MOTION.ease).toBe("power3.out");
    expect(MOTION.ambientReentry).toBe(0.25);
    expect(MOTION.cardLift).toBe(-2);
    expect(MOTION.cardLiftMs).toBe(150);
  });

  it("distinguishes from plausible stale literals 18 / 0.55 / 0.06 / 14px", async () => {
    const { MOTION } = await import("./motion-tokens.js");
    expect(MOTION.entranceY, "entranceY must be 24 not legacy 18").not.toBe(18);
    expect(MOTION.entranceY, "entranceY must be 24 not legacy 14").not.toBe(14);
    expect(MOTION.entranceDuration, "duration must be 0.62 not legacy 0.55").not.toBe(0.55);
    expect(MOTION.entranceDuration).not.toBe(0.9);
    expect(MOTION.entranceStagger, "stagger must be 0.08 not legacy 0.06").not.toBe(0.06);
    expect(MOTION.routeFade).not.toBe("180ms");
    expect(MOTION.cardLift).not.toBe(0);
  });

  it("motion.ts consumes MOTION and no longer hardcodes legacy literals", () => {
    const motionPath = path.resolve("src/scripts/motion.ts");
    const content = fs.readFileSync(motionPath, "utf8");
    expect(content, "motion.ts must import MOTION seam").toMatch(
      /from\s+["']\.\/motion-tokens["']/,
    );
    expect(content, "must reference MOTION.entranceY instead of y: 18").toMatch(
      /MOTION\.entranceY/,
    );
    expect(content, "must reference MOTION.entranceDuration").toMatch(/MOTION\.entranceDuration/);
    expect(content, "must reference MOTION.entranceStagger").toMatch(/MOTION\.entranceStagger/);
    expect(content, "must reference MOTION.ease").toMatch(/MOTION\.ease/);
    // Hardcoded legacy literals should be gone
    expect(content, "legacy y: 18 should be removed").not.toMatch(/\by:\s*18\b/);
    // allow y: 0 as target, but not the old from tuple
    expect(content, "legacy duration 0.55 should be removed").not.toMatch(/duration:\s*0\.55/);
    expect(content, "legacy stagger 0.06 should be removed").not.toMatch(/stagger:\s*0\.06/);
  });

  it("global.css entrance uses tokens and no longer hardcodes 14px", () => {
    const cssPath = path.resolve("src/styles/global.css");
    const css = fs.readFileSync(cssPath, "utf8");
    // entrance baseline must be 24px after migration
    expect(css, "global.css must contain 24px entrance").toMatch(/translateY\(24px\)/);
    expect(css, "legacy 14px entrance must be removed").not.toMatch(/translateY\(14px\)/);
  });

  it("MOTION object is frozen shape with exactly expected keys", async () => {
    const { MOTION } = await import("./motion-tokens.js");
    const keys = Object.keys(MOTION).sort();
    expect(keys).toEqual(
      [
        "ambientReentry",
        "cardLift",
        "cardLiftMs",
        "ease",
        "entranceDuration",
        "entranceStagger",
        "entranceY",
        "routeFade",
      ].sort(),
    );
  });
});

describe("transition remediation — navigation has one owner (Astro 250ms fade)", () => {
  const motionPath = path.resolve("src/scripts/motion.ts");
  const content = fs.readFileSync(motionPath, "utf8");

  it("branches page-load on a client-navigation flag set at after-swap", () => {
    expect(content, "must listen for astro:after-swap (pre-paint finalize)").toMatch(
      /astro:after-swap/,
    );
    expect(content, "must keep a pending navigation flag").toMatch(/pendingClientNav/);
    expect(content, "after-swap handler must set the flag").toMatch(
      /function handleAfterSwap[\s\S]*?pendingClientNav = true/,
    );
    expect(content, "page-load entry must consume the flag").toMatch(/if \(pendingClientNav\)/);
  });

  it("finalizes incoming entrances visible with no post-paint GSAP on navigation", () => {
    expect(content, "navigated path must finalize entrances visible").toMatch(
      /function finalizeEntrancesVisible[\s\S]*?is-entrance-visible/,
    );
    expect(content, "navigated path must exist and skip the timeline").toMatch(
      /function runNavigated[\s\S]*?finalizeEntrancesVisible\(\)/,
    );
    expect(
      content.match(/createEntranceTimeline\(/g)?.length ?? 0,
      "GSAP entrance timeline must have exactly one call site (initial load only; plus its definition)",
    ).toBe(2);
  });

  it("detects persist ownership on host nodes, never on animated children", () => {
    expect(content, "must check the water-field persist host").toMatch(
      /data-astro-transition-persist="water-field"/,
    );
    expect(content, "must check the bg-words persist host").toMatch(
      /data-astro-transition-persist="bg-words"/,
    );
    expect(content, "must not check persist on the animated child").not.toMatch(
      /waterImg\?\.hasAttribute\("data-astro-transition-persist"\)/,
    );
  });

  it("keeps the initial entrance authored (24px / 620ms) and never reanimates ambient on nav", () => {
    expect(content, "navigated path must stabilize ambient, not animate it").toMatch(
      /function runNavigated[\s\S]*?finalizePersistedAmbient\(ambient\)/,
    );
    expect(content, "dead persisted re-entry tween must be gone").not.toMatch(
      /animatePersistedReentry/,
    );
    expect(content, "root fade duration must stay Astro-owned in tokens").toMatch(
      /MOTION\.entranceY[\s\S]*?MOTION\.entranceDuration/,
    );
  });

  it("bg-word initial GSAP settle matches navigated finalize per variant (no route jump)", () => {
    const initial = content.slice(
      content.indexOf("function animateAmbientVisible"),
      content.indexOf("function finalizePersistedAmbient"),
    );
    const navigated = content.slice(content.indexOf("function finalizePersistedAmbient"));
    // Initial entrance must settle both variants, not drive all words to one value.
    expect(initial, "initial must settle normal words at 0.045").toMatch(/opacity: 0\.045/);
    expect(initial, "initial must settle cyan words at 0.07").toMatch(/opacity: 0\.07/);
    expect(initial, "initial must split cyan targets").toMatch(/bg-word--cyan/);
    // Entrance shape unchanged: x from -18, same timings.
    expect(initial, "initial must keep x -18 entrance").toMatch(/x: -18/);
    expect(initial, "initial must keep 0.7s stagger timings").toMatch(
      /duration: 0\.7, stagger: 0\.08/,
    );
    // Navigated finalize contract both variants must agree with initial.
    expect(navigated, "navigated must keep cyan 0.07 / normal 0.045").toMatch(
      /bg-word--cyan.*0\.07.*0\.045|0\.07.*0\.045/,
    );
  });

  it("uses exact public attribution wording, never sole-author", () => {
    const experience = fs.readFileSync(path.resolve("src/data/experience.ts"), "utf8");
    const about = fs.readFileSync(path.resolve("src/pages/about.astro"), "utf8");
    const prd = fs.readFileSync(path.resolve("PRD.md"), "utf8");
    for (const [name, text] of Object.entries({ experience, about, prd })) {
      expect(text, `${name} must carry exact wording Author Jonathan Soto`).toMatch(
        /Author Jonathan Soto/,
      );
      expect(text, `${name} must not use sole author wording`).not.toMatch(/sole author/i);
      expect(text, `${name} must not use sole-author wording`).not.toMatch(/sole-author/i);
    }
  });
});
