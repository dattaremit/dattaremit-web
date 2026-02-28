"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, Loader2, ArrowRight, Landmark, Zap } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PlaidLinkButton } from "@/components/plaid-link-button";
import { useAccount, useAddExternalAccount } from "@/hooks/api";
import { ApiError } from "@/services/api";

export default function LinkBankPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: account } = useAccount();
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
      accounts?.[0]?.name ||
      meta?.institution?.name ||
      "external_account";

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
              : "Failed to link external account"
          );
        },
      }
    );
  }

  const allLinked =
    !!user?.zynkExternalAccountId && !!user?.zynkDepositAccountId;

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="w-full max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-center">Link Bank Account &amp; Add Beneficiary</h1>
        <p className="text-center text-muted-foreground">
          Connect your bank and add a beneficiary to start sending money.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Link Bank Account Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                {user?.zynkExternalAccountId ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Building2 className="h-6 w-6 text-primary" />
                )}
              </div>
              <CardTitle className="text-lg">Link Bank Account</CardTitle>
              <CardDescription>
                Link your US bank account via Plaid to fund transfers.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              {user?.achPushEnabled && !user?.zynkExternalAccountId && (
                <div className="flex w-full items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <div>
                      <Label htmlFor="fast-transfer" className="text-sm font-medium">
                        Fast Transfer
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {useFastTransfer
                          ? "Instant ACH push"
                          : "Regular ACH pull (1-3 days)"}
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
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Account linked
                </p>
              ) : addExternal.isPending ? (
                <Button disabled size="lg">
                  <Loader2 className="animate-spin" />
                  Setting up account...
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
            </CardContent>
          </Card>

          {/* Add Beneficiary Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                {user?.zynkDepositAccountId ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Landmark className="h-6 w-6 text-primary" />
                )}
              </div>
              <CardTitle className="text-lg">Add Beneficiary</CardTitle>
              <CardDescription>
                Add your recipient&apos;s Indian bank details.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              {user?.zynkDepositAccountId ? (
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Account linked
                </p>
              ) : (
                <Button onClick={() => router.push("/link-bank/receive")}>
                  Add Beneficiary
                  <ArrowRight />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {allLinked && (
          <div className="text-center pt-2">
            <Button onClick={() => router.push("/")}>Go to Dashboard</Button>
          </div>
        )}
      </div>
    </div>
  );
}
