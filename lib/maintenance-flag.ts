// Reads the global maintenance flag from the backend's public
// GET /api/maintenance-status endpoint. Used by the edge proxy to gate all
// traffic. Kept edge-runtime safe (plain fetch, no Node APIs).
//
// A module-scoped TTL cache avoids hitting the backend on every request — the
// proxy runs on every navigation. Reads are fail-open: any error, timeout, or
// missing config resolves to "not in maintenance" so a backend hiccup can never
// lock the whole site out.

const CACHE_TTL_MS = 15_000;
const FETCH_TIMEOUT_MS = 2_000;

let cache: { value: boolean; expiresAt: number } | null = null;

function statusUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/maintenance-status`;
}

export async function isMaintenanceEnabled(): Promise<boolean> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.value;

  const url = statusUrl();
  if (!url) return false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`maintenance-status ${res.status}`);
    const body = (await res.json()) as { data?: { enabled?: boolean } };
    const enabled = body?.data?.enabled === true;

    cache = { value: enabled, expiresAt: now + CACHE_TTL_MS };
    return enabled;
  } catch {
    // Fail open — keep the site up if the flag can't be read. Cache the
    // negative briefly so a hard-down backend doesn't get hammered per request.
    cache = { value: false, expiresAt: now + CACHE_TTL_MS };
    return false;
  }
}
