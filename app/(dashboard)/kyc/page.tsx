"use client";

import { useStartKyc } from "@/hooks/api";
import { Loader2, ExternalLink, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function KycPage() {
  const kycMutation = useStartKyc();
  const kycData = kycMutation.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Identity Verification</CardTitle>
        <CardDescription>
          Complete your KYC verification to activate your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!kycData ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <ShieldCheck className="h-16 w-16 text-muted-foreground" />
            <p className="text-center text-sm text-muted-foreground">
              Click the button below to start the identity verification process.
            </p>
            {kycMutation.isError && (
              <p className="text-center text-sm text-destructive">
                {kycMutation.error instanceof Error
                  ? kycMutation.error.message
                  : "Something went wrong. Please try again."}
              </p>
            )}
            <Button
              className="w-full max-w-xs"
              onClick={() => kycMutation.mutate()}
              disabled={kycMutation.isPending}
            >
              {kycMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Start KYC
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8">
            <ShieldCheck className="h-16 w-16 text-green-500" />
            <p className="text-center text-sm text-muted-foreground">
              Your verification link is ready.{" "}
              {kycData.tosLink
                ? "Please review the Terms of Service first, then complete KYC."
                : "Please complete the KYC process."}
            </p>
            <div className="flex w-full max-w-xs flex-col gap-3">
              {kycData.tosLink && (
                <Button asChild variant="outline" className="w-full">
                  <a
                    href={kycData.tosLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Review Terms of Service
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
              <Button asChild className="w-full">
                <a
                  href={kycData.kycLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Complete KYC
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
