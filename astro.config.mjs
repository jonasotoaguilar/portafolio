// @ts-check

import react from "@astrojs/react";
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
		// Renders the developer-icons technology band on /projects as static
		// SSR markup (no client directive: zero hydrated islands, zero
		// client-side React on the route).
		react(),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
