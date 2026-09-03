import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const raw = site?.toString() ?? process.env.SITE;
  const origin = raw?.trim() ? raw.trim().replace(/\/$/, "") : undefined;
  const lines = ["User-agent: *", "Allow: /"];
  if (origin) {
    lines.push(`Sitemap: ${origin}/sitemap-index.xml`);
  }
  return new Response(lines.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
