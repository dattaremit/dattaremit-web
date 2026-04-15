"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  Send,
  Users,
  Sparkles,
  Landmark,
} from "lucide-react";
import { useAccount } from "@/hooks/api";
import { ApiError } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export default function HomePage() {
  const { data: account, isLoading, error, refetch } = useAccount();
  const user = account?.user;
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/exchange-rate")
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && typeof json.data?.rate === "number") {
          setRate(json.data.rate);
        }
      })
      .catch(() => {});
  }, []);

  const needsProfile = error instanceof ApiError && error.status === 404;
  const realError =
    error && !needsProfile
      ? error instanceof Error
        ? error.message
        : "Failed to load data"
      : null;

  const hasSendAccount = !!user?.zynkExternalAccountId;
  const hasReceiveAccount = !!user?.zynkDepositAccountId;
  const bothLinked = hasSendAccount && hasReceiveAccount;

  if (isLoading || needsProfile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-5 w-96" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (realError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="mb-4 text-destructive">{realError}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const greeting = getGreeting();

  return (
    <div className="space-y-10">
      <Reveal>
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {greeting}
          </span>
          <h1 className="font-semibold text-4xl leading-[1.05] text-foreground sm:text-5xl">
            {user?.firstName ? (
              <>
                Welcome back,{" "}
                <span className="text-brand">
                  {user.firstName}
                </span>
                .
              </>
            ) : (
              "Welcome."
            )}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {bothLinked
              ? "Your accounts are connected. Send to anyone, anywhere — in minutes."
              : "Finish setting up to start sending money across borders."}
          </p>
        </div>
      </Reveal>

      <Stagger className="grid gap-4 sm:grid-cols-3">
        <StaggerItem>
          <StatCard
            label="Live rate"
            value={
              <>
                ₹
                <span className="text-brand">
                  {rate ? rate.toFixed(2) : "—"}
                </span>
              </>
            }
            hint="USD → INR · live from Yahoo Finance"
            accent
            icon={<Sparkles className="size-4" />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Settlement"
            value="60s"
            hint="Median ACH push speed"
            icon={<Send className="size-4" />}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Network"
            value="140+"
            hint="Countries supported"
            icon={<Users className="size-4" />}
          />
        </StaggerItem>
      </Stagger>

      {!bothLinked && (
        <Reveal direction="up" delay={0.05}>
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickAction
              icon={<Send className="size-5" />}
              label="Send money"
              href="/send"
              tint="brand"
            />
            <QuickAction
              icon={
                hasSendAccount ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <Landmark className="size-5" />
                )
              }
              label={hasSendAccount ? "Bank connected" : "Connect bank"}
              href="/link-bank"
              tint={hasSendAccount ? "success" : "warning"}
            />
          </div>
        </Reveal>
      )}

      {account?.accountStatus === "ACTIVE" && !bothLinked && (
        <Reveal direction="up" delay={0.1}>
          <Card
            variant="elevated"
            className="relative overflow-hidden border-brand/20"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-brand/15 blur-3xl"
            />
            <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
                  <Building2 className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="font-semibold text-2xl text-foreground">
                    Link your bank
                  </h2>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Connect a US account and add your Indian bank to receive
                    funds. Two minutes, then you&apos;re sending.
                  </p>
                </div>
              </div>
              <Button asChild variant="brand" size="lg">
                <Link href="/link-bank">
                  Get started
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </Card>
        </Reveal>
      )}

      {bothLinked && (
        <Reveal direction="up" delay={0.1}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card variant="elevated" className="relative overflow-hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-success/15 blur-3xl"
              />
              <div className="relative flex flex-col gap-4 p-6">
                <div className="flex size-11 items-center justify-center rounded-xl bg-success/15 text-success">
                  <CheckCircle2 className="size-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-xl text-foreground">
                    Accounts linked
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Send and receive accounts are connected and ready.
                  </p>
                </div>
              </div>
            </Card>
            <Card
              variant="elevated"
              className="relative overflow-hidden border-brand/20"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-brand/20 blur-3xl"
              />
              <div className="relative flex h-full flex-col justify-between gap-4 p-6">
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-xl text-foreground">
                    Ready to send?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Pick a recipient and we&apos;ll do the rest.
                  </p>
                </div>
                <Button asChild variant="brand" className="w-fit">
                  <Link href="/send">
                    Send money
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </Reveal>
      )}
    </div>
  );
}

function QuickAction({
  icon,
  label,
  href,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  tint: "brand" | "success" | "warning";
}) {
  const tintClass = {
    brand: "bg-brand/15 text-brand ring-brand/20",
    success: "bg-success/15 text-success ring-success/20",
    warning: "bg-warning/15 text-warning ring-warning/20",
  }[tint];

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:border-foreground/20 hover:shadow-lift"
    >
      <div
        className={`flex size-11 items-center justify-center rounded-xl ring-1 ${tintClass}`}
      >
        {icon}
      </div>
      <span className="flex-1 text-left font-semibold text-foreground">
        {label}
      </span>
      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good evening";
}
