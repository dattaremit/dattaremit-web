import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const revalidate = 60;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface ServerRateResponse {
  success: boolean;
  message?: string;
  data?: { rate: number; updatedAt: string; stale: boolean };
}

/**
 * Proxies the backend's /exchange-rate endpoint so the entire product
 * (web, mobile via Zynk quotes, server-computed developer fee) reads
 * from a single source — Wise's mid-market rate, configured server-side.
 * Edge-cached for 60s to absorb burst traffic without re-hitting the
 * backend; the server's own cache window is much longer (3h).
 */
export async function GET() {
  if (!API_BASE_URL) {
    logger.error("NEXT_PUBLIC_API_URL not configured for /api/exchange-rate proxy");
    return NextResponse.json({ success: false, message: "Rate unavailable" }, { status: 502 });
  }

  try {
    const upstream = await fetch(`${API_BASE_URL}/exchange-rate`, {
      // Backend already caches; honor that on this hop too.
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10_000),
      headers: {
        // Cloudflare in front of api.dattaremit.com bot-blocks Node's
        // default User-Agent and returns 403. The longer-term fix is a
        // Cloudflare WAF skip rule for our own web egress; for now we
        // pass a generic browser UA so the request isn't dropped.
        "User-Agent": "Mozilla/5.0 (compatible; DattaremitWebProxy/1.0)",
        Accept: "application/json",
      },
    });

    if (!upstream.ok) {
      logger.warn("Exchange rate upstream non-OK", { status: upstream.status });
      return NextResponse.json({ success: false, message: "Rate unavailable" }, { status: 502 });
    }

    const body = (await upstream.json()) as ServerRateResponse;
    if (!body?.success || !body.data || typeof body.data.rate !== "number") {
      return NextResponse.json({ success: false, message: "Rate unavailable" }, { status: 502 });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          rate: body.data.rate,
          updatedAt: body.data.updatedAt,
          stale: body.data.stale,
          source: "wise",
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (err) {
    logger.error("Failed to fetch exchange rate from backend", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, message: "Failed to fetch exchange rate" },
      { status: 502 },
    );
  }
}
