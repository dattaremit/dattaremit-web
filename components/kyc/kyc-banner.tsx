"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Clock, ShieldAlert } from "lucide-react";

import { useAccount } from "@/hooks/api";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import type { AccountStatus } from "@/types/api";

export function KycBanner() {
  const pathname = usePathname();
  const { data: account } = useAccount();

  if (!account) return null;
  if (pathname.startsWith(ROUTES.KYC)) return null;

  const status = (account.accountStatus ?? "INITIAL") as AccountStatus | string;

  if (status === "ACTIVE") return null;

  if (status === "PENDING") {
    return (
      <div
        role="status"
        className="mb-6 flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-warning sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-warning/20">
            <Clock className="size-4.5" />
          </div>
          <div className="space-y-0.5">
            <p className="font-semibold text-sm text-foreground">Verification in progress</p>
            <p className="text-xs text-muted-foreground sm:text-sm">
              We&apos;re reviewing your identity. We&apos;ll email you the moment it&apos;s
              approved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isResubmit = status === "REJECTED";

  return (
    <div
      role="alert"
      className="mb-6 flex flex-col gap-3 rounded-2xl border border-brand/30 bg-brand/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/20 text-brand">
          <ShieldAlert className="size-4.5" />
        </div>
        <div className="space-y-0.5">
          <p className="font-semibold text-sm text-foreground">
            {isResubmit ? "Verification needs another try" : "Verify your identity"}
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Complete KYC to send money and unlock the full account.
          </p>
        </div>
      </div>
      <Button asChild variant="brand" size="sm" className="self-start sm:self-auto">
        <Link href={ROUTES.KYC}>
          Start KYC
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
