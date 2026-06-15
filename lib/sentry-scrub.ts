import type { ErrorEvent } from "@sentry/nextjs";

// Header / field names that carry authentication credentials. We never want
// these reaching Sentry. Compared case-insensitively.
const AUTH_KEYS = new Set(["authorization", "cookie", "set-cookie", "x-auth-token"]);

function isAuthKey(key: string): boolean {
  return AUTH_KEYS.has(key.toLowerCase());
}

// Remove the auth credential keys from a plain headers-like object, mutating in place.
function stripAuthFromHeaders(headers: Record<string, unknown>): void {
  for (const key of Object.keys(headers)) {
    if (isAuthKey(key)) delete headers[key];
  }
}

// Recursively walk a serialized value (e.g. an AxiosError's `config` / `request`
// that Sentry may serialize into `event.extra` / `event.contexts`) and remove
// request headers + standalone auth credential fields. Everything else
// (config.data, url, method, status, response body, etc.) is left untouched.
function scrubValue(value: unknown, depth: number): void {
  if (depth > 6 || value === null || typeof value !== "object") return;

  if (Array.isArray(value)) {
    for (const item of value) scrubValue(item, depth + 1);
    return;
  }

  const obj = value as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    // Drop the request `headers` object wholesale — it holds x-auth-token.
    if (key.toLowerCase() === "headers" && obj[key] && typeof obj[key] === "object") {
      delete obj[key];
      continue;
    }
    // Drop any standalone auth credential field.
    if (isAuthKey(key)) {
      delete obj[key];
      continue;
    }
    scrubValue(obj[key], depth + 1);
  }
}

/**
 * Sentry `beforeSend` hook. Strips ONLY request headers and authorization
 * credentials from every outbound event, leaving all other diagnostic context
 * (request body, url, method, status, response, tags, contexts) intact.
 *
 * This addresses SECURITY_FINDINGS.md #1: the network-error branch in
 * services/api.ts captures a raw AxiosError whose `config.headers` carries the
 * `x-auth-token` auth credential. Filtering here keeps that token out of Sentry
 * without changing the capture call sites.
 */
export function scrubAuthFromSentryEvent(event: ErrorEvent): ErrorEvent {
  if (event.request?.headers) {
    stripAuthFromHeaders(event.request.headers as Record<string, unknown>);
  }
  if (event.contexts) scrubValue(event.contexts, 0);
  if (event.extra) scrubValue(event.extra, 0);
  return event;
}
