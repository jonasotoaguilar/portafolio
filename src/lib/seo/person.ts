import type { SiteConfig } from "../content/schemas";

export interface PersonJsonLd {
	"@context": "https://schema.org";
	"@type": "Person";
	name: string;
	jobTitle: string;
	email: string;
	sameAs: string[];
}

export function buildPersonJsonLd(site: SiteConfig): PersonJsonLd {
	return {
		"@context": "https://schema.org",
		"@type": "Person",
		name: site.name,
		jobTitle: site.role,
		email: site.email,
		sameAs: [site.socials.github, site.socials.wealthquest],
	};
}

/** Serialize JSON-LD so raw `<` cannot break out of the script element. */
export function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}
