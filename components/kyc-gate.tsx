"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Clock, RefreshCw, ShieldCheck } from "lucide-react";
import { queryKeys } from "@/constants/query-keys";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AccountStatus } from "@/types/api";

interface KycGateProps {
  accountStatus?: AccountStatus | string;
  feature?: string;
}

export function KycGate({ accountStatus, feature = "this feature" }: KycGateProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isPending = accountStatus === "PENDING";

  if (isPending) {
    return (
      <Card variant="elevated" className="mx-auto max-w-lg p-8 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-warning/15 text-warning">
          <Clock className="size-6" />
        </div>
        <h2 className="font-semibold text-2xl text-foreground">
          Account is not approved yet
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ll unlock everything as soon as your verification goes
          through.
        </p>
        <Button
          variant="outline"
          className="mt-5"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: queryKeys.account })
          }
        >
          <RefreshCw />
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="mx-auto max-w-lg p-8 text-center">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
        <ShieldCheck className="size-6" />
      </div>
      <h2 className="font-semibold text-2xl text-foreground">
        Verify your identity first
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Complete KYC to unlock {feature}.
      </p>
      <Button
        variant="brand"
        className="mt-5"
        onClick={() => router.push(ROUTES.KYC)}
      >
        Complete KYC
        <ArrowRight />
      </Button>
    </Card>
  );
}
