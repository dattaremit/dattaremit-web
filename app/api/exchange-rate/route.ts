import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

export const revalidate = 60;

const yahooFinance = new YahooFinance();

export async function GET() {
  try {
    const quote = (await yahooFinance.quote("USDINR=X", {})) as {
      regularMarketPrice?: number;
      regularMarketTime?: Date | number;
    };
    const rate = quote?.regularMarketPrice;

    if (typeof rate !== "number" || !isFinite(rate) || rate <= 0) {
      return NextResponse.json(
        { success: false, message: "Rate unavailable" },
        { status: 502 },
      );
    }

    const marketTime = quote.regularMarketTime;
    const updatedAt = marketTime
      ? new Date(
          typeof marketTime === "number" ? marketTime * 1000 : marketTime,
        ).toISOString()
      : new Date().toISOString();

    return NextResponse.json(
      {
        success: true,
        data: {
          rate,
          updatedAt,
          stale: false,
          source: "yahoo-finance",
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch exchange rate" },
      { status: 502 },
    );
  }
}
