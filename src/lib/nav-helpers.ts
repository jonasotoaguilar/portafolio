/**
 * Pure helpers for keyboard-first menu navigation.
 * Used by SiteNav vanilla script; unit-tested in isolation.
 */
export type NavKey = "ArrowRight" | "ArrowLeft" | "ArrowDown" | "ArrowUp" | "Home" | "End";

export function getNextIndex(current: number, total: number, key: NavKey): number {
  if (total <= 0) return 0;
  const last = total - 1;
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return current >= last ? 0 : current + 1;
    case "ArrowLeft":
    case "ArrowUp":
      return current <= 0 ? last : current - 1;
    case "Home":
      return 0;
    case "End":
      return last;
    default:
      return current;
  }
}

/**
 * Normalizes a keyboard event key for nav traversal.
 * Returns null when the key is not a nav key we handle.
 */
export function toNavKey(key: string): NavKey | null {
  if (
    key === "ArrowRight" ||
    key === "ArrowLeft" ||
    key === "ArrowDown" ||
    key === "ArrowUp" ||
    key === "Home" ||
    key === "End"
  ) {
    return key as NavKey;
  }
  return null;
}
