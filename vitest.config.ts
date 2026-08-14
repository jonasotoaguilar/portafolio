import { getViteConfig } from "astro/config";
import type { TestUserConfig } from "vitest/config";

const config = {
	test: {
		include: ["tests/unit/**/*.test.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			// CLI scripts (scripts/**) are exercised by the CI gate/build steps,
			// not by unit tests; excluding them keeps thresholds honest.
			exclude: ["scripts/**"],
			thresholds: {
				statements: 80,
				branches: 70,
				functions: 80,
				lines: 80,
			},
		},
		environment: "node",
		passWithNoTests: true,
	} satisfies TestUserConfig,
};

export default getViteConfig(config);
