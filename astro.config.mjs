import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://jonathansoto.dev",
  integrations: [
    mdx(),
    sitemap({
      lastmod: new Date(),
      changefreq: "monthly",
      priority: 0.7,
    }),
  ],
  prefetch: {
    prefetchAll: true,
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: "lightningcss",
    },
  },
});
