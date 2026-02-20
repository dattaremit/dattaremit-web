"use client";

import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, Loader2, ArrowRight, Landmark } from "lucide-react";
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
import { PlaidLinkButton } from "@/components/plaid-link-button";
import { useAccount, useAddExternalAccount } from "@/hooks/api";
import { ApiError } from "@/services/api";

export default function LinkBankPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: account } = useAccount();
  const user = account?.user;
  const addExternal = useAddExternalAccount();

  const userCountry =
    account?.addresses?.find((addr) => addr.isDefault)?.country ||
    account?.addresses?.[0]?.country;
  const isUSUser = userCountry === "US";

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
        paymentRail: "ach_pull",
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

  const allLinked = isUSUser
    ? !!user?.zynkExternalAccountId && !!user?.zynkDepositAccountId
    : !!user?.zynkDepositAccountId;

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="w-full max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-center">Link Bank Accounts</h1>
        <p className="text-center text-muted-foreground">
          {isUSUser
            ? "Connect your bank accounts to send and receive money."
            : "Add your bank details to receive money."}
        </p>

        <div className={`grid gap-4 ${isUSUser ? "sm:grid-cols-2" : ""}`}>
          {/* Send Money Card – US users only */}
          {isUSUser && (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  {user?.zynkExternalAccountId ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <Building2 className="h-6 w-6 text-primary" />
                  )}
                </div>
                <CardTitle className="text-lg">Send Money</CardTitle>
                <CardDescription>
                  Link your US bank account via Plaid to send money.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-3">
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
          )}

          {/* Receive Money Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                {user?.zynkDepositAccountId ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Landmark className="h-6 w-6 text-primary" />
                )}
              </div>
              <CardTitle className="text-lg">
                {isUSUser ? "Receive Money" : "Add Bank Account"}
              </CardTitle>
              <CardDescription>
                Add your Indian bank details to receive money.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              {user?.zynkDepositAccountId ? (
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Account linked
                </p>
              ) : (
                <Button onClick={() => router.push("/link-bank/receive")}>
                  Add Bank Details
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
