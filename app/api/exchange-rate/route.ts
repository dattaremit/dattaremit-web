import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const revalidate = 60;

const WISE_API_URL = process.env.WISE_API_URL ?? "https://api.wise.com";
const WISE_API_KEY = process.env.WISE_API_KEY;

interface WiseRate {
  rate: number;
  source: string;
  target: string;
  time: string;
}

/**
 * USD → INR mid-market rate, fetched directly from Wise. The Personal API
 * token lives in `WISE_API_KEY` (server-only — must never be exposed to the
 * client bundle). Edge-cached for 60s with a 5-minute stale-while-revalidate
 * so a single Wise outage doesn't blank the homepage rate card.
 */
export async function GET() {
  if (!WISE_API_KEY) {
    logger.error("WISE_API_KEY not configured for /api/exchange-rate");
    return NextResponse.json({ success: false, message: "Rate unavailable" }, { status: 502 });
  }

  try {
    const upstream = await fetch(`${WISE_API_URL}/v1/rates?source=USD&target=INR`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10_000),
      headers: {
        Authorization: `Bearer ${WISE_API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!upstream.ok) {
      logger.warn("Wise rate upstream non-OK", { status: upstream.status });
      return NextResponse.json({ success: false, message: "Rate unavailable" }, { status: 502 });
    }

    const body = (await upstream.json()) as WiseRate[];
    const rate = body?.[0];
    if (!rate || typeof rate.rate !== "number") {
      return NextResponse.json({ success: false, message: "Rate unavailable" }, { status: 502 });
    }

    // Mark the rate stale if Wise's own timestamp is older than 30 minutes so
    // the card can render a freshness hint.
    const ageMs = Date.now() - new Date(rate.time).getTime();
    const stale = !Number.isFinite(ageMs) || ageMs > 30 * 60 * 1000;

    return NextResponse.json(
      {
        success: true,
        data: {
          rate: rate.rate,
          updatedAt: rate.time,
          stale,
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
    logger.error("Failed to fetch exchange rate from Wise", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { success: false, message: "Failed to fetch exchange rate" },
      { status: 502 },
    );
  }
}
