/**
 * Normalizes API responses that may be either:
 * - A raw array: [...] (no pagination)
 * - A DRF paginated object: { count, next, previous, results: [...] }
 *
 * This ensures the frontend always receives a plain array from list endpoints.
 */
export function normalizeList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data !== null && typeof data === "object" && "results" in data) {
    const results = (data as Record<string, unknown>).results;
    if (Array.isArray(results)) return results as T[];
  }
  return [];
}
