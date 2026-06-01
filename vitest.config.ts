import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components"),
      "@layouts": resolve(__dirname, "src/layouts"),
      "@content": resolve(__dirname, "src/content"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
