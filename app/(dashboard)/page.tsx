"use client";

import { useRouter } from "next/navigation";
import { Building2, ArrowRight } from "lucide-react";
import { useAccount, useFundingAccount } from "@/hooks/api";
import { ApiError } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FundingAccountCard } from "@/components/funding-account-card";

export default function HomePage() {
  const router = useRouter();

  const { data: account, isLoading, error, refetch } = useAccount();
  const user = account?.user;

  const {
    data: fundingAccount,
    error: fundingError,
  } = useFundingAccount();

  const needsProfile = error instanceof ApiError && error.status === 404;
  const realError =
    error && !needsProfile
      ? error instanceof Error
        ? error.message
        : "Failed to load data"
      : null;

  const noFundingAccount =
    fundingError instanceof ApiError && fundingError.status === 400;

  // Layout handles redirect for needsProfile and needsProfileInfo cases
  if (isLoading || needsProfile) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-4 w-80" />
      </div>
    );
  }

  if (realError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="mb-4 text-center text-destructive">{realError}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!account?.addresses?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="mb-2 text-center text-xl font-bold">
          Welcome, {user?.firstName || "there"}!
        </h1>
        <p className="mb-6 text-center text-muted-foreground">
          You&apos;re almost there! Add your address to complete your profile.
        </p>
        <Button onClick={() => router.push("/edit-addresses")}>
          Complete Your Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {user?.firstName ? `Welcome back, ${user.firstName}!` : "Welcome!"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your account.
        </p>
      </div>

      {account.accountStatus === "ACTIVE" && noFundingAccount && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">
                Link Your Bank Account
              </CardTitle>
              <CardDescription>
                Connect your bank to start sending and receiving money.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/link-bank")}>
              Get Started
              <ArrowRight />
            </Button>
          </CardContent>
        </Card>
      )}

      {fundingAccount && !noFundingAccount && (
        <FundingAccountCard fundingAccount={fundingAccount} />
      )}
    </div>
  );
}
