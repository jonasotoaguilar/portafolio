import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Site domain is intentionally unresolved — do not fabricate a production URL.
// Design/Product/PRD list LinkedIn URL and pnpm pin as unresolved; SITE env follows same rule.
// Provide SITE via environment when deploying (e.g., SITE=https://example.com).
// Sitemap integration requires `site` — it is enabled only when SITE is set.
const site = process.env.SITE?.trim() || undefined;

// Conditionally load sitemap only when site is known. This keeps the dependency
// installed (per PRD/R18) while avoiding a build-time error from fabricating a domain.
const integrations = [];
if (site) {
  const { default: sitemap } = await import("@astrojs/sitemap");
  integrations.push(sitemap());
}

export default defineConfig({
  // Static output — portfolio has no runtime backend (PRODUCT.md / PRD R16).
  output: "static",
  ...(site ? { site } : {}),
  integrations,
  vite: {
    plugins: [tailwindcss()],
  },
});
