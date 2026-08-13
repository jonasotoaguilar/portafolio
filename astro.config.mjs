// @ts-check

import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import { isSitemapEligible } from "./src/lib/seo/sitemap";
import { SITE_URL } from "./src/lib/seo/titles";

// https://astro.build/config
export default defineConfig({
	site: SITE_URL,
	integrations: [
		sitemap({
			filter: isSitemapEligible,
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
