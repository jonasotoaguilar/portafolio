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
