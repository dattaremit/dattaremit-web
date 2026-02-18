"use client";

import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, Loader2 } from "lucide-react";
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

  if (user?.zynkExternalAccountId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Bank Account Linked</CardTitle>
            <CardDescription>
              Your bank account is connected and ready to use.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push("/")}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Link Your Bank Account</CardTitle>
          <CardDescription>
            Connect your bank account securely through Plaid to enable
            transfers and deposits.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {addExternal.isPending ? (
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
          <p className="text-xs text-muted-foreground text-center">
            Your banking credentials are never stored on our servers. Plaid
            uses bank-level encryption to keep your data safe.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
