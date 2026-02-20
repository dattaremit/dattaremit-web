"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SEND_AMOUNT, COMPETITOR_SPREADS, DISCLAIMER_TEXT } from "@/constants/welcome";

interface ExchangeRateData {
  rate: number;
  updatedAt: string;
  stale: boolean;
}

export function WelcomeContent() {
  const [rateData, setRateData] = useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

    fetch(`${apiBase}/exchange-rate`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setRateData(json.data);
        }
      })
      .catch(() => {
        // Silently fail — UI shows skeleton then placeholder
      })
      .finally(() => setLoading(false));
  }, []);

  const midMarketRate = rateData?.rate ?? 0;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Live rate badge */}
      <div className="flex flex-col items-center gap-2">
        {loading ? (
          <Skeleton className="h-8 w-48" />
        ) : midMarketRate > 0 ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            1 USD = {midMarketRate.toFixed(2)} INR
            {rateData?.stale && (
              <span className="text-xs text-muted-foreground">(cached)</span>
            )}
          </div>
        ) : null}
      </div>

      {/* Promo headline */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          You&apos;re getting more with Dattaremit
        </h1>
        <p className="mt-3 text-muted-foreground">
          Send money to India at the real exchange rate with zero fees.
          See how much more your family receives.
        </p>
      </div>

      {/* Comparison card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">
            Sending ${SEND_AMOUNT.toLocaleString()} USD to India
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Header row */}
            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
              <div>Provider</div>
              <div className="text-right">Rate</div>
              <div className="text-right">Fee</div>
              <div className="text-right">Recipient gets</div>
            </div>

            {/* Data rows */}
            {COMPETITOR_SPREADS.map((provider) => {
              const effectiveRate = midMarketRate * (1 - provider.spreadPct / 100);
              const recipientGets = (SEND_AMOUNT - provider.fee) * effectiveRate;

              return (
                <div
                  key={provider.name}
                  className={`grid grid-cols-4 gap-2 items-center rounded-lg px-3 py-2.5 text-sm ${
                    provider.highlight
                      ? "bg-primary/5 font-semibold ring-1 ring-primary/20"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {provider.name}
                    {provider.highlight && (
                      <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                        BEST
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    {loading ? (
                      <Skeleton className="ml-auto h-4 w-16" />
                    ) : midMarketRate > 0 ? (
                      effectiveRate.toFixed(2)
                    ) : (
                      "—"
                    )}
                  </div>
                  <div className="text-right">
                    {provider.fee === 0 ? (
                      <span className="text-green-600 dark:text-green-400">Free</span>
                    ) : (
                      `$${provider.fee.toFixed(2)}`
                    )}
                  </div>
                  <div className="text-right">
                    {loading ? (
                      <Skeleton className="ml-auto h-4 w-20" />
                    ) : midMarketRate > 0 ? (
                      <span className={provider.highlight ? "text-green-600 dark:text-green-400" : ""}>
                        ₹{recipientGets.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    ) : (
                      "—"
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-[11px] text-muted-foreground">
            {DISCLAIMER_TEXT}
          </p>
        </CardContent>
      </Card>

      {/* CTA buttons */}
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg" className="sm:min-w-[180px]">
          <Link href="/sign-up">Create Account</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="sm:min-w-[180px]">
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}
