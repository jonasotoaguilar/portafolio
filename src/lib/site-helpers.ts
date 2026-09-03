export function canonicalUrl(site: string | undefined, path: string): string | undefined {
  if (!site) return undefined;
  const base = site.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export function ogImageUrl(site: string | undefined): string | undefined {
  if (!site) return undefined;
  return `${site.replace(/\/$/, "")}/og.png`;
}
