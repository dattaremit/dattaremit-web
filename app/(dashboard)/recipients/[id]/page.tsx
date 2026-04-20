"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Pencil,
  RefreshCw,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { useRecipient, useResendRecipientKyc } from "@/hooks/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { BackLink } from "@/components/ui/back-link";
import { ROUTES } from "@/constants/routes";

export default function RecipientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: recipient, isLoading, error } = useRecipient(id);
  const resendKyc = useResendRecipientKyc();

  const handleResend = async () => {
    try {
      await resendKyc.mutateAsync(id);
      toast.success("KYC email resent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !recipient) {
    return (
      <div className="space-y-4">
        <BackLink href={ROUTES.RECIPIENTS} />
        <p className="text-destructive">
          {error instanceof Error ? error.message : "Recipient not found."}
        </p>
      </div>
    );
  }

  const kycApproved = recipient.kycStatus === "APPROVED";
  const canSend = kycApproved && recipient.hasBankAccount;
  const initials = `${recipient.firstName[0] ?? ""}${recipient.lastName[0] ?? ""}`;

  return (
    <div className="space-y-7">
      <BackLink href={ROUTES.RECIPIENTS} />

      <Card
        variant="elevated"
        className="relative overflow-hidden p-6 sm:p-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-brand/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand/30 to-brand-soft/40 font-semibold text-xl text-foreground">
              {initials}
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="font-semibold text-3xl leading-tight text-foreground">
                {recipient.firstName} {recipient.lastName}
              </h1>
              <p className="text-sm text-muted-foreground">{recipient.email}</p>
            </div>
          </div>
          <Badge
            variant={
              kycApproved
                ? "default"
                : recipient.kycStatus === "PENDING"
                  ? "secondary"
                  : "destructive"
            }
          >
            {recipient.kycStatus}
          </Badge>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <Detail label="Phone">
            {recipient.phoneNumberPrefix} {recipient.phoneNumber}
          </Detail>
          <Detail label="Nationality">{recipient.nationality}</Detail>
        </div>

        <Separator className="my-6" />

        <Detail label="Address">
          {recipient.addressLine1}
          <br />
          {recipient.city}, {recipient.state} {recipient.postalCode}
          <br />
          {recipient.country}
        </Detail>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/recipients/${recipient.id}/edit`}>
              <Pencil />
              Edit details
            </a>
          </Button>
          {!kycApproved && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              loading={resendKyc.isPending}
            >
              {!resendKyc.isPending && <RefreshCw />}
              Resend KYC
            </Button>
          )}
        </div>
      </Card>

      <Card variant="elevated" className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border p-6">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
            <Banknote className="size-5" />
          </div>
          <div>
            <h2 className="font-semibold text-xl text-foreground">
              Bank account
            </h2>
            <p className="text-sm text-muted-foreground">
              Where funds are delivered.
            </p>
          </div>
        </div>
        <div className="space-y-4 p-6 text-sm">
          {recipient.hasBankAccount ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <Detail label="Bank">{recipient.bankName}</Detail>
                <Detail label="Account">
                  {recipient.bankAccountNumberMasked}
                </Detail>
                <Detail label="IFSC">{recipient.bankIfsc}</Detail>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={`/recipients/${recipient.id}/bank`}>
                  <Pencil />
                  Update bank
                </a>
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                No bank account linked yet.
              </p>
              <Button variant="brand" size="sm" asChild>
                <a href={`/recipients/${recipient.id}/bank`}>
                  Add bank account
                </a>
              </Button>
            </>
          )}
        </div>
      </Card>

      <div className="flex flex-col gap-2">
        <Button
          variant="brand"
          size="lg"
          className="w-full"
          disabled={!canSend}
          onClick={() => router.push(`/send?recipient=${recipient.id}`)}
        >
          <Send />
          Send money
        </Button>
        {!canSend && (
          <p className="text-center text-xs text-muted-foreground">
            {kycApproved
              ? "Add a bank account to send money."
              : "Recipient must complete KYC before you can send money."}
          </p>
        )}
      </div>
    </div>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-foreground">{children}</div>
    </div>
  );
}
