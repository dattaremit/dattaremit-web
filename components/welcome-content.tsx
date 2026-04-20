"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Minus, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import {
  SEND_AMOUNT,
  COMPETITOR_SPREADS,
  DISCLAIMER_TEXT,
} from "@/constants/welcome";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface ExchangeRateData {
  rate: number;
  updatedAt: string;
  stale: boolean;
}

export function WelcomeContent() {
  const [rateData, setRateData] = useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/exchange-rate")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setRateData(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const midMarketRate = rateData?.rate ?? 83.42;

  const dattaremit = COMPETITOR_SPREADS.find((p) => p.highlight);
  const dattaremitRecipientGets = dattaremit
    ? (SEND_AMOUNT - dattaremit.fee) *
      midMarketRate *
      (1 - dattaremit.spreadPct / 100)
    : SEND_AMOUNT * midMarketRate;

  const competitorMin = Math.min(
    ...COMPETITOR_SPREADS.filter((p) => !p.highlight).map(
      (p) => (SEND_AMOUNT - p.fee) * midMarketRate * (1 - p.spreadPct / 100),
    ),
  );
  const youGetMore = dattaremitRecipientGets - competitorMin;

  return (
    <div className="flex flex-col gap-16 lg:gap-24">
      <section className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
        <Reveal direction="up">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-foreground">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
              </span>
              Live · USD → INR
            </span>
            <h1 className="font-semibold text-5xl leading-[1.02] text-foreground sm:text-6xl lg:text-7xl">
              Money that{" "}
              <span className="text-brand">
                moves
              </span>
              <br />
              the way you do.
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Send to India in under a minute. Real exchange rates, no hidden
              spread, no Monday-morning waiting.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="brand" size="xl">
                <Link href={ROUTES.SIGN_UP}>
                  Open free account
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link href={ROUTES.SIGN_IN}>Sign in</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-success" />
                SOC 2 secured
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-success" />
                140+ corridors
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-success" />
                Settles in 60s
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.15}>
          <RateTile loading={loading} midMarketRate={midMarketRate} />
        </Reveal>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 text-center sm:text-left">
          <span className="inline-flex w-fit items-center gap-2 self-center rounded-full border border-border bg-muted/60 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:self-start">
            The math
          </span>
          <h2 className="font-semibold text-3xl leading-tight text-foreground sm:text-4xl">
            Send ${SEND_AMOUNT.toLocaleString()}.{" "}
            <span className="text-brand">
              Your family gets more.
            </span>
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Same amount sent. Different amount delivered. Numbers refresh as
            the live rate moves.
          </p>
        </div>

        <Card variant="elevated" className="overflow-hidden p-0">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-2 border-b border-border px-5 py-3 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:px-7 sm:text-xs">
            <div>Provider</div>
            <div className="text-right">Rate</div>
            <div className="text-right">Fee</div>
            <div className="text-right">Recipient gets</div>
          </div>

          <Stagger className="divide-y divide-border" staggerChildren={0.05}>
            {COMPETITOR_SPREADS.map((provider) => {
              const effectiveRate =
                midMarketRate * (1 - provider.spreadPct / 100);
              const recipientGets = (SEND_AMOUNT - provider.fee) * effectiveRate;
              return (
                <StaggerItem key={provider.name}>
                  <div
                    className={cn(
                      "grid grid-cols-[1.4fr_1fr_1fr_1.2fr] items-center gap-2 px-5 py-4 text-sm transition-colors sm:px-7",
                      provider.highlight &&
                        "bg-gradient-to-r from-brand-soft/40 via-card to-card",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-semibold text-base sm:text-lg",
                          provider.highlight
                            ? "text-foreground"
                            : "text-foreground/80",
                        )}
                      >
                        {provider.name}
                      </span>
                      {provider.highlight && (
                        <span className="rounded-full bg-brand px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-foreground">
                          Best
                        </span>
                      )}
                    </div>
                    <div className="text-right tabular text-foreground/80">
                      {loading ? (
                        <Skeleton className="ml-auto h-4 w-14" />
                      ) : (
                        effectiveRate.toFixed(2)
                      )}
                    </div>
                    <div className="text-right tabular">
                      {provider.fee === 0 ? (
                        <span className="inline-flex items-center gap-1 text-success">
                          <Check className="size-3.5" />
                          Free
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          ${provider.fee.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="text-right tabular">
                      {loading ? (
                        <Skeleton className="ml-auto h-5 w-20" />
                      ) : (
                        <span
                          className={cn(
                            "font-semibold text-lg sm:text-xl",
                            provider.highlight
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          ₹
                          {recipientGets.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>

          <div className="border-t border-border bg-muted/30 px-5 py-4 sm:px-7">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {DISCLAIMER_TEXT}
            </p>
          </div>
        </Card>

        {!loading && youGetMore > 0 && (
          <Reveal direction="up" delay={0.1}>
            <p className="text-center font-semibold text-2xl text-foreground sm:text-3xl">
              That&apos;s{" "}
              <span className="text-brand">
                ₹
                {youGetMore.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>{" "}
              more in their pocket.
            </p>
          </Reveal>
        )}
      </section>

      <section className="flex flex-col items-center gap-5 rounded-3xl border border-brand/15 bg-gradient-to-br from-brand-soft/30 via-card to-card p-10 text-center shadow-soft sm:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
        />
        <Sparkles className="size-6 text-brand" />
        <h2 className="font-semibold text-3xl leading-tight text-foreground sm:text-5xl">
          Open an account in{" "}
          <span className="text-brand">
            two minutes
          </span>
          .
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          No paperwork. No hidden fees. Send your first transfer the same day.
        </p>
        <Button asChild variant="brand" size="xl" className="mt-2">
          <Link href={ROUTES.SIGN_UP}>
            Get started
            <ArrowRight />
          </Link>
        </Button>
      </section>
    </div>
  );
}

function RateTile({
  loading,
  midMarketRate,
}: {
  loading: boolean;
  midMarketRate: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-lift">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-brand/20 blur-3xl"
      />
      <div className="relative space-y-7">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Mid-market rate
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Minus className="size-3" />
            zero spread
          </span>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="font-semibold text-base text-muted-foreground">
            1 USD =
          </span>
          {loading ? (
            <Skeleton className="h-12 w-32" />
          ) : (
            <motion.span
              key={midMarketRate}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="font-semibold text-5xl leading-none tabular text-foreground sm:text-6xl"
            >
              ₹{midMarketRate.toFixed(2)}
            </motion.span>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">You send</span>
            <span className="font-semibold text-xl tabular text-foreground">
              $1,000
            </span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">They receive</span>
            <span className="font-semibold text-xl tabular text-brand">
              ₹{(1000 * midMarketRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Settlement</span>
          <span className="font-semibold text-base text-foreground">
            ~60 seconds
          </span>
        </div>
      </div>
    </div>
  );
}
