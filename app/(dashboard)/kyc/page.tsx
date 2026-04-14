"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { requestOnboardingKyc } from "@/services/api";
import { useAccount } from "@/hooks/api";
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

const STATUS_META: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive"; icon: React.ComponentType<{ className?: string }> }
> = {
  INITIAL: { label: "Not started", variant: "secondary", icon: ShieldCheck },
  PENDING: { label: "In review", variant: "secondary", icon: Clock },
  ACTIVE: { label: "Verified", variant: "default", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", variant: "destructive", icon: XCircle },
};

export default function KycPage() {
  const router = useRouter();
  const { data: account, isLoading } = useAccount();

  const requestLink = useMutation({ mutationFn: requestOnboardingKyc });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const status = (account?.accountStatus ?? "INITIAL") as keyof typeof STATUS_META;
  const meta = STATUS_META[status] ?? STATUS_META.INITIAL;
  const StatusIcon = meta.icon;
  const indianStatus = account?.indianKycStatus ?? "NONE";
  const canStartPrimary = status === "INITIAL" || status === "REJECTED";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Identity verification</h1>
        <p className="text-muted-foreground">
          Verify your identity to activate your account and send money.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Primary KYC</CardTitle>
              <CardDescription>
                Secure email-based verification through our partner.
              </CardDescription>
            </div>
            <Badge variant={meta.variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {meta.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {requestLink.isSuccess ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <Mail className="h-10 w-10 text-green-600" />
              <p className="text-sm">
                We sent a verification link to your email. Check your inbox to
                complete KYC.
              </p>
              <Button
                variant="outline"
                onClick={() => requestLink.reset()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Resend link
              </Button>
            </div>
          ) : (
            <>
              {canStartPrimary ? (
                <p className="text-sm text-muted-foreground">
                  Click below to send a secure verification link to your email.
                </p>
              ) : status === "PENDING" ? (
                <p className="text-sm text-muted-foreground">
                  Your KYC is under review. We&apos;ll email you when a decision
                  is made.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your primary KYC is verified.
                </p>
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
                    onClick={() => requestLink.mutate()}
                    disabled={requestLink.isPending}
                  >
                    {requestLink.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Send verification link
                  </Button>
                )}
                {status === "ACTIVE" && (
                  <Button onClick={() => router.push("/")}>Go to home</Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Indian KYC</CardTitle>
              <CardDescription>
                Required to receive money into an Indian bank account.
              </CardDescription>
            </div>
            <Badge
              variant={
                indianStatus === "APPROVED"
                  ? "default"
                  : indianStatus === "PENDING"
                    ? "secondary"
                    : indianStatus === "REJECTED" || indianStatus === "FAILED"
                      ? "destructive"
                      : "outline"
              }
            >
              {indianStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {indianStatus === "PENDING" ? (
            <p className="text-sm text-muted-foreground">
              Your Indian KYC is being processed. This typically takes 3–5
              minutes.
            </p>
          ) : indianStatus === "APPROVED" ? (
            <p className="text-sm text-muted-foreground">
              Indian KYC verified — you can add an Indian bank account.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Submit your Aadhar and PAN to verify your Indian identity.
                Data is encrypted in your browser before being sent.
              </p>
              <Button asChild>
                <Link href="/kyc/indian">
                  {indianStatus === "REJECTED" || indianStatus === "FAILED"
                    ? "Resubmit Indian KYC"
                    : "Start Indian KYC"}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
