"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AccountStatus } from "@/types/api";

interface KycGateProps {
  accountStatus?: AccountStatus | string;
  feature?: string;
}

export function KycGate({ accountStatus, feature = "this feature" }: KycGateProps) {
  const router = useRouter();
  const isPending = accountStatus === "PENDING";

  return (
    <Card variant="elevated" className="mx-auto max-w-lg p-8 text-center">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
        <ShieldCheck className="size-6" />
      </div>
      <h2 className="font-semibold text-2xl text-foreground">
        Verify your identity first
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {isPending
          ? `Your KYC is under review. You'll be able to use ${feature} once it's approved.`
          : `Complete KYC to unlock ${feature}.`}
      </p>
      {!isPending && (
        <Button
          variant="brand"
          className="mt-5"
          onClick={() => router.push("/kyc")}
        >
          Complete KYC
          <ArrowRight />
        </Button>
      )}
    </Card>
  );
}
