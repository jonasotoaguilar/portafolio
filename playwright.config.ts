import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "functional",
      testIgnore: /scroll-trace\.spec\.ts/,
    },
    {
      // Perf trace runs alone after functional completes so rAF FPS is not
      // measured under concurrent worker load. Narrowest project scheduling;
      // fullyParallel and every threshold stay unchanged.
      name: "perf",
      testMatch: /scroll-trace\.spec\.ts/,
      dependencies: ["functional"],
    },
  ],
  webServer: {
    command: "pnpm build && pnpm preview --port 4321 --host 127.0.0.1",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
