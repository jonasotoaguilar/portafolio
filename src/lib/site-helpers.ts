export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export function canonicalUrl(site: string | undefined, path: string): string | undefined {
  if (!site) return undefined;
  const trimmed = site.trim();
  if (!trimmed) return undefined;
  const base = trimmed.replace(/\/$/, "");
  if (!base) return undefined;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export function ogImageUrl(site: string | undefined): string | undefined {
  if (!site) return undefined;
  const trimmed = site.trim();
  if (!trimmed) return undefined;
  return `${trimmed.replace(/\/$/, "")}/og.png`;
}

export function ogImageDimensions(): { width: number; height: number } {
  return { width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT };
}
