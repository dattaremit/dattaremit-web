"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  Landmark,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { PlaidLinkButton } from "@/components/plaid-link-button";
import { KycGate } from "@/components/kyc-gate";
import { useAccount, useAddExternalAccount } from "@/hooks/api";
import { ApiError } from "@/services/api";
import { cn } from "@/lib/utils";

export default function LinkBankPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: account } = useAccount();
  const accountStatus = account?.accountStatus;
  const user = account?.user;
  const addExternal = useAddExternalAccount();
  const [useFastTransfer, setUseFastTransfer] = useState(false);

  function handlePlaidSuccess(publicToken: string, metadata: unknown) {
    const meta = metadata as {
      accounts?: { id: string; name?: string }[];
      institution?: { name?: string };
    };
    const accounts = meta?.accounts;
    const accountId = accounts?.[0]?.id;

    if (!accountId) {
      toast.error("No account selected. Please try again.");
      return;
    }

    const accountName =
      accounts?.[0]?.name || meta?.institution?.name || "external_account";

    addExternal.mutate(
      {
        accountName,
        paymentRail:
          user?.achPushEnabled && useFastTransfer ? "ach_push" : "ach_pull",
        plaidPublicToken: publicToken,
        plaidAccountId: accountId,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.account });
          toast.success("Bank account linked successfully!");
        },
        onError: (err) => {
          toast.error(
            err instanceof ApiError
              ? err.message
              : "Failed to link external account",
          );
        },
      },
    );
  }

  const allLinked =
    !!user?.zynkExternalAccountId && !!user?.zynkDepositAccountId;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Setup"
        title={
          <>
            Link your{" "}
            <span className="text-brand">
              accounts
            </span>
            .
          </>
        }
        subtitle="Connect a US account to fund transfers, and add your Indian bank to receive money to yourself."
      />

      {accountStatus !== "ACTIVE" ? (
        <KycGate accountStatus={accountStatus} feature="bank linking" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <SetupCard
              icon={
                user?.zynkExternalAccountId ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <Building2 className="size-5" />
                )
              }
              done={!!user?.zynkExternalAccountId}
              title="Send account"
              description="Link your US bank via Plaid to fund transfers."
              step="01"
            >
              {user?.achPushEnabled && !user?.zynkExternalAccountId && (
                <div className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 p-3">
                  <div className="flex items-center gap-2.5">
                    <Zap className="size-4 text-brand" />
                    <div>
                      <Label
                        htmlFor="fast-transfer"
                        className="text-sm font-medium"
                      >
                        Fast transfer
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {useFastTransfer
                          ? "Instant ACH push"
                          : "Regular ACH pull (1–3 days)"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="fast-transfer"
                    checked={useFastTransfer}
                    onCheckedChange={setUseFastTransfer}
                  />
                </div>
              )}

              {user?.zynkExternalAccountId ? (
                <p className="text-sm font-medium text-success">
                  Account linked
                </p>
              ) : addExternal.isPending ? (
                <Button variant="brand" size="lg" loading>
                  Setting up account…
                </Button>
              ) : (
                <PlaidLinkButton onSuccess={handlePlaidSuccess} />
              )}

              {addExternal.isError && (
                <p className="text-sm text-destructive">
                  {addExternal.error instanceof ApiError
                    ? addExternal.error.message
                    : "Something went wrong. Please try again."}
                </p>
              )}
            </SetupCard>

            <SetupCard
              icon={
                user?.zynkDepositAccountId ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <Landmark className="size-5" />
                )
              }
              done={!!user?.zynkDepositAccountId}
              title="Your Indian bank"
              description="Add your own Indian bank account so you can send money to yourself."
              step="02"
            >
              {user?.zynkDepositAccountId ? (
                <p className="text-sm font-medium text-success">
                  Account linked
                </p>
              ) : (
                <Button
                  variant="brand"
                  onClick={() => router.push("/link-bank/receive")}
                >
                  Add Indian bank
                  <ArrowRight />
                </Button>
              )}
            </SetupCard>
          </div>

          {allLinked && (
            <div className="text-center">
              <Button variant="brand" size="lg" onClick={() => router.push("/")}>
                Go to dashboard
                <ArrowRight />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SetupCard({
  step,
  icon,
  title,
  description,
  done,
  children,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card
      variant="elevated"
      className={cn(
        "relative overflow-hidden p-6",
        done && "border-success/30",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -right-12 -top-12 size-40 rounded-full blur-3xl",
          done ? "bg-success/15" : "bg-brand/10",
        )}
      />
      <div className="relative flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-xl",
              done ? "bg-success/15 text-success" : "bg-brand/15 text-brand",
            )}
          >
            {icon}
          </div>
          <span className="font-semibold text-xl tabular text-muted-foreground/40">
            {step}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold text-xl text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col items-stretch gap-3">{children}</div>
      </div>
    </Card>
  );
}
