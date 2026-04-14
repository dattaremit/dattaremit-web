"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  Loader2,
  Pencil,
  RefreshCw,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useRecipient, useResendRecipientKyc } from "@/hooks/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !recipient) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/recipients">
            <ArrowLeft />
            Back
          </Link>
        </Button>
        <p className="text-destructive">
          {error instanceof Error ? error.message : "Recipient not found."}
        </p>
      </div>
    );
  }

  const kycApproved = recipient.kycStatus === "APPROVED";
  const canSend = kycApproved && recipient.hasBankAccount;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/recipients">
          <ArrowLeft />
          Back
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">
                {recipient.firstName} {recipient.lastName}
              </CardTitle>
              <CardDescription>{recipient.email}</CardDescription>
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
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <Detail label="Phone">
              {recipient.phoneNumberPrefix} {recipient.phoneNumber}
            </Detail>
            <Detail label="Date of birth">{recipient.dateOfBirth}</Detail>
            <Detail label="Nationality">{recipient.nationality}</Detail>
          </div>
          <Separator />
          <Detail label="Address">
            {recipient.addressLine1}
            {recipient.addressLine2 ? `, ${recipient.addressLine2}` : ""}
            <br />
            {recipient.city}, {recipient.state} {recipient.postalCode}
            <br />
            {recipient.country}
          </Detail>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/recipients/${recipient.id}/edit`}>
                <Pencil />
                Edit
              </Link>
            </Button>
            {!kycApproved && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResend}
                disabled={resendKyc.isPending}
              >
                {resendKyc.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <RefreshCw />
                )}
                Resend KYC
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Banknote className="h-4 w-4" />
            Bank account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {recipient.hasBankAccount ? (
            <>
              <Detail label="Bank">{recipient.bankName}</Detail>
              <Detail label="Account">
                {recipient.bankAccountNumberMasked}
              </Detail>
              <Detail label="IFSC">{recipient.bankIfsc}</Detail>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/recipients/${recipient.id}/bank`}>
                  <Pencil />
                  Update bank
                </Link>
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                No bank account linked yet.
              </p>
              <Button asChild size="sm">
                <Link href={`/recipients/${recipient.id}/bank`}>
                  Add bank account
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Button
        className="w-full"
        disabled={!canSend}
        onClick={() => router.push(`/send?recipient=${recipient.id}`)}
      >
        <Send />
        Send money
      </Button>
      {!canSend && (
        <p className="-mt-3 text-center text-xs text-muted-foreground">
          {kycApproved
            ? "Add a bank account to send money."
            : "Recipient must complete KYC before you can send money."}
        </p>
      )}
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
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
