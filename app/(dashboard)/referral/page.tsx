"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gift } from "lucide-react";
import { toast } from "sonner";

import { useValidateReferral } from "@/hooks/api";
import { reserveReferralCode } from "@/services/api";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { ROUTES } from "@/constants/routes";
import { isValidReferralCode } from "@/schemas/referral.schema";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";

export default function ReferralPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const validateMutation = useValidateReferral();

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      toast.error("Please enter a referral code");
      return;
    }
    if (!isValidReferralCode(trimmed)) {
      toast.error("Referral codes are 4–20 letters and numbers");
      return;
    }

    try {
      await validateMutation.mutateAsync(trimmed);
      await reserveReferralCode(trimmed);
      localStorage.removeItem(STORAGE_KEYS.REFERRAL_CODE);
      toast.success("Referral code applied!");
      router.push(ROUTES.EDIT_PROFILE);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid referral code";
      toast.error(message);
    }
  };

  const handleSkip = () => {
    localStorage.removeItem(STORAGE_KEYS.REFERRAL_CODE);
    router.push("/edit-profile");
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <Card variant="elevated" className="relative overflow-hidden p-8 sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
        />

        <div className="relative flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-brand/15 text-brand">
            <Gift className="size-6" />
          </div>
          <h1 className="font-semibold text-3xl leading-tight text-foreground">
            Got a <span className="text-brand">code</span>?
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Enter it now to claim your bonus when you complete sign up.
          </p>
        </div>

        <div className="relative mt-7 space-y-4">
          <Field>
            <FieldLabel htmlFor="referral-code">Referral code</FieldLabel>
            <Input
              id="referral-code"
              placeholder="DATTAFRIEND"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={validateMutation.isPending}
              className="text-center font-semibold text-lg tracking-[0.3em]"
            />
          </Field>

          {validateMutation.isError && (
            <p className="text-center text-sm text-destructive">
              {validateMutation.error instanceof Error
                ? validateMutation.error.message
                : "Invalid referral code. Please try again."}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Button
              variant="brand"
              size="lg"
              className="w-full"
              loading={validateMutation.isPending}
              disabled={!code.trim()}
              onClick={handleApply}
            >
              Apply code
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={handleSkip}
              disabled={validateMutation.isPending}
            >
              Skip for now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
