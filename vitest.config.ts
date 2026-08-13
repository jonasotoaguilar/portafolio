import { getViteConfig } from "astro/config";
import type { TestUserConfig } from "vitest/config";

const config = {
	test: {
		include: ["tests/unit/**/*.test.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
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
