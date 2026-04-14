"use client";

import { useMutation } from "@tanstack/react-query";
import { Clock, Loader2, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { useAccount } from "@/hooks/api";
import { requestOnboardingKyc } from "@/services/api";
import { Button } from "@/components/ui/button";

export default function OnboardingKycPage() {
  const { data: account, isLoading } = useAccount();
  const requestLink = useMutation({ mutationFn: requestOnboardingKyc });

  const status = account?.accountStatus;
  const inReview = status === "PENDING";

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Verify your identity</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We use a secure email-based verification to confirm who you are.
        </p>
      </div>

      {inReview ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-muted/40 px-6 py-10 text-center">
          <Clock className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">Verification in progress</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            We&apos;re reviewing your information. This usually completes in a
            few minutes — you&apos;ll be redirected automatically once it&apos;s
            approved.
          </p>
        </div>
      ) : requestLink.isSuccess ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-muted/40 px-6 py-10 text-center">
          <Mail className="h-10 w-10 text-green-600" />
          <p className="font-medium">Check your email</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            We sent you a secure verification link. Open it to complete KYC,
            then come back here.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => requestLink.reset()}
            className="mt-2 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Resend link
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border bg-muted/40 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-medium">Encrypted &amp; private</p>
              <p className="text-muted-foreground">
                Your data is encrypted and only used for identity verification.
              </p>
            </div>
          </div>

          {requestLink.isError && (
            <p className="text-sm text-destructive">
              {requestLink.error instanceof Error
                ? requestLink.error.message
                : "Something went wrong. Please try again."}
            </p>
          )}

          <Button
            onClick={() => requestLink.mutate()}
            disabled={requestLink.isPending}
            className="w-full"
            size="lg"
          >
            {requestLink.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Send verification link
          </Button>
        </div>
      )}
    </div>
  );
}
