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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlaidLinkButton } from "@/components/plaid-link-button";
import {
  useFundingAccount,
  useCreateFundingAccount,
} from "@/hooks/api";
import { ApiError } from "@/services/api";

export default function LinkBankPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    data: fundingAccount,
    isLoading,
    error,
  } = useFundingAccount();
  const createFunding = useCreateFundingAccount();

  const noFundingAccount =
    error instanceof ApiError && error.status === 400;

  function handlePlaidSuccess() {
    createFunding.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.fundingAccount });
        queryClient.invalidateQueries({ queryKey: queryKeys.account });
        toast.success("Bank account linked successfully!");
      },
      onError: (err) => {
        toast.error(
          err instanceof ApiError
            ? err.message
            : "Failed to create funding account"
        );
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (fundingAccount && !noFundingAccount) {
    const last4 = fundingAccount.accountInfo.bank_account_number.slice(-4);

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
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Bank</span>
                <span className="text-sm font-medium">
                  {fundingAccount.accountInfo.bank_name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Account</span>
                <span className="text-sm font-medium">****{last4}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant={
                    fundingAccount.status === "active" ? "default" : "secondary"
                  }
                >
                  {fundingAccount.status}
                </Badge>
              </div>
            </div>
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
          {createFunding.isPending ? (
            <Button disabled size="lg">
              <Loader2 className="animate-spin" />
              Setting up account...
            </Button>
          ) : (
            <PlaidLinkButton onSuccess={handlePlaidSuccess} />
          )}
          {createFunding.isError && (
            <p className="text-sm text-destructive">
              {createFunding.error instanceof ApiError
                ? createFunding.error.message
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
