import { getViteConfig } from "astro/config";
import { resolve } from "node:path";

// getViteConfig accepts Vite UserConfig, but Vitest adds `test`.
// The spread pattern merges vitest options without type conflicts.
export default getViteConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components"),
      "@layouts": resolve(__dirname, "src/layouts"),
      "@content": resolve(__dirname, "src/content"),
    },
  },
  // @ts-expect-error — `test` is Vitest-specific, not in Vite UserConfig
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
