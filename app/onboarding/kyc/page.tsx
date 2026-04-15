"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { useAccount } from "@/hooks/api";
import { requestOnboardingKyc } from "@/services/api";
import { queryKeys } from "@/constants/query-keys";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function OnboardingKycPage() {
  const { data: account, isLoading } = useAccount();
  const queryClient = useQueryClient();
  const requestLink = useMutation({
    mutationFn: requestOnboardingKyc,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account });
    },
  });

  const status = account?.accountStatus;
  const inReview = status === "PENDING";

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="relative flex size-10 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-brand/30" />
          <span className="relative size-2 rounded-full bg-brand" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title={
          <>
            Verify your{" "}
            <span className="text-brand">
              identity
            </span>
            .
          </>
        }
        subtitle="A quick check unlocks every transfer feature."
      />

      {inReview ? (
        <StatusBlock
          icon={<Clock className="size-6" />}
          title="Verification in progress"
          description="We're reviewing your information. This usually completes in a few minutes — you'll be redirected automatically once it's approved."
        />
      ) : requestLink.isSuccess ? (
        <StatusBlock
          icon={<Mail className="size-6" />}
          title="Check your inbox"
          description="We sent you a secure verification link. Open it to complete KYC, then come back here."
          accent
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => requestLink.reset()}
            >
              <RefreshCw className="size-4" />
              Resend link
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" />
            <div className="text-sm">
              <p className="font-medium text-foreground">
                Encrypted &amp; private
              </p>
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
            loading={requestLink.isPending}
            variant="brand"
            size="lg"
            className="w-full"
          >
            Send verification link
          </Button>
        </div>
      )}
    </div>
  );
}

function StatusBlock({
  icon,
  title,
  description,
  action,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/30 px-6 py-10 text-center">
      {accent && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 left-1/2 size-48 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl"
        />
      )}
      <div className="relative flex flex-col items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-brand/15 text-brand">
          {icon}
        </div>
        <p className="font-semibold text-2xl text-foreground">{title}</p>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
