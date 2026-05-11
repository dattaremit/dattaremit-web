"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, Mail, ShieldCheck } from "lucide-react";

import { queryKeys } from "@/constants/query-keys";
import { ROUTES } from "@/constants/routes";
import {
  ACCOUNT_STATUS_META,
  INDIAN_KYC_STATUS_LABEL,
  getIndianKycStatusVariant,
} from "@/constants/status-meta";
import { requestOnboardingKyc } from "@/services/api";
import { useAccount } from "@/hooks/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";

export default function KycPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: account, isLoading } = useAccount();
  const [modalOpen, setModalOpen] = useState(false);

  const requestLink = useMutation({
    mutationFn: requestOnboardingKyc,
    onSuccess: () => {
      setModalOpen(true);
    },
  });

  const handleGotIt = async () => {
    setModalOpen(false);
    await queryClient.invalidateQueries({ queryKey: queryKeys.account });
    router.replace(ROUTES.ROOT);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  const status = account?.accountStatus ?? "INITIAL";
  const meta = ACCOUNT_STATUS_META[status] ?? ACCOUNT_STATUS_META.INITIAL;
  const StatusIcon = meta.icon;
  const indianStatus = account?.indianKycStatus ?? "NONE";
  const indianStatusLabel = INDIAN_KYC_STATUS_LABEL[indianStatus] ?? "Not started";
  const canStartPrimary = status === "INITIAL" || status === "REJECTED";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Verification"
        title={
          <>
            Prove it&apos;s <span className="text-brand">you</span>.
          </>
        }
        subtitle="A quick check unlocks transfers across the network."
      />

      <Card variant="elevated" className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-xl text-foreground">Primary KYC</h2>
              <p className="text-sm text-muted-foreground">
                Email-based verification through our partner.
              </p>
            </div>
          </div>
          <Badge variant={meta.variant} className="gap-1">
            <StatusIcon className="size-3" />
            {meta.label}
          </Badge>
        </div>
        <div className="space-y-4 p-6">
          {canStartPrimary ? (
            <>
              <p className="text-sm text-muted-foreground">
                Click below to send a secure verification link to your email.
              </p>
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 p-4">
                <Info className="mt-0.5 size-4 shrink-0 text-brand" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm text-foreground">Verification & limits</p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Add your SSN during verification to send up to $5,000 per day; without it, the
                    daily cap is $2,999.99. The 7-day limit is $15,000 either way.
                  </p>
                </div>
              </div>
            </>
          ) : status === "PENDING" ? (
            <>
              <p className="text-sm text-muted-foreground">
                Your KYC is under review. We&apos;ll email you when a decision is made.
              </p>
              <Button
                variant="outline"
                onClick={() => requestLink.mutate()}
                loading={requestLink.isPending}
              >
                Resend verification link
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Your primary KYC is verified.</p>
          )}
          {requestLink.isError && (
            <p className="text-sm text-destructive">
              {requestLink.error instanceof Error
                ? requestLink.error.message
                : "Something went wrong."}
            </p>
          )}
          <div className="flex gap-2">
            {canStartPrimary && (
              <Button
                variant="brand"
                onClick={() => requestLink.mutate()}
                loading={requestLink.isPending}
              >
                Send verification link
              </Button>
            )}
            {status === "ACTIVE" && (
              <Button variant="brand" onClick={() => router.push(ROUTES.ROOT)}>
                Go to home
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card variant="elevated" className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-xl text-foreground">Indian KYC</h2>
              <p className="text-sm text-muted-foreground">
                Required to receive money into an Indian bank account.
              </p>
            </div>
          </div>
          <Badge variant={getIndianKycStatusVariant(indianStatus)}>{indianStatusLabel}</Badge>
        </div>
        <div className="p-6">
          {indianStatus === "PENDING" ? (
            <p className="text-sm text-muted-foreground">
              Your Indian KYC is being processed. This typically takes 3–5 minutes.
            </p>
          ) : indianStatus === "APPROVED" ? (
            <p className="text-sm text-muted-foreground">
              Indian KYC verified — you can add an Indian bank account.
            </p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Submit your Aadhar and PAN to verify your Indian identity. Data is encrypted in your
                browser before being sent.
              </p>
              <Button asChild variant="brand">
                <Link href={ROUTES.KYC_INDIAN}>
                  {indianStatus === "REJECTED" || indianStatus === "FAILED"
                    ? "Resubmit Indian KYC"
                    : "Start Indian KYC"}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) handleGotIt();
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="items-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-brand/15 text-brand">
              <Mail className="size-9" />
            </div>
            <DialogTitle className="text-center">KYC Link Sent!</DialogTitle>
            <DialogDescription className="text-center">
              Please check your email and complete the KYC verification to get started.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="brand" className="w-full" onClick={handleGotIt}>
              Got It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
