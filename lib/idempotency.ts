/**
 * Generate an RFC 4122 v4 UUID for use as an Idempotency-Key on write requests.
 * Falls back to a time + random pseudo-UUID when crypto.randomUUID is missing
 * (older browsers, insecure contexts) so we never block a transfer.
 */
export function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const rand = Math.random().toString(16).slice(2, 10);
  return `${Date.now().toString(16)}-${rand}`;
}
