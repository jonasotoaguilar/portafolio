import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "tests/e2e",
	reporter: "list",
	use: {
		baseURL: "http://localhost:4321",
	},
	webServer: {
		command: "pnpm dev",
		url: "http://localhost:4321",
		reuseExistingServer: !process.env.CI,
	},
});
