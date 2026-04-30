/**
 * Generate an RFC 4122 v4 UUID for use as an Idempotency-Key on write requests.
 * Requires a secure context (HTTPS or localhost) so the Web Crypto API is
 * available. We deliberately fail loudly rather than fall back to Math.random
 * — predictable keys on a financial endpoint could collide and silently
 * deduplicate distinct transfers.
 */
export function generateIdempotencyKey(): string {
  if (typeof crypto === "undefined" || typeof crypto.randomUUID !== "function") {
    throw new Error("crypto.randomUUID is unavailable. A secure context (HTTPS) is required.");
  }
  return crypto.randomUUID();
}
