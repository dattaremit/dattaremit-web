"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { reserveReferralCode, validateReferralCode, ApiError } from "@/services/api";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { ROUTES } from "@/constants/routes";
import { isValidReferralCode } from "@/schemas/referral.schema";

const STORAGE_KEY = STORAGE_KEYS.REFERRAL_CODE;

export default function OnboardingReferralPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToProfile = () => router.replace(ROUTES.ONBOARDING.PROFILE);

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter a referral code");
      return;
    }
    if (!isValidReferralCode(trimmed)) {
      setError("Referral codes are 4–20 letters and numbers");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await validateReferralCode(trimmed);
      if (result?.valid) {
        await reserveReferralCode(trimmed);
        localStorage.removeItem(STORAGE_KEY);
        goToProfile();
      } else {
        setError("Invalid referral code. Please check and try again.");
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Invalid referral code. Please check and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.removeItem(STORAGE_KEY);
    goToProfile();
  };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Referral"
        title={
          <>
            Got a <span className="text-brand">referral code</span>?
          </>
        }
        subtitle="Enter a code to claim the bonus, or skip this step."
      />

      <div className="space-y-4">
        <div className="relative">
          <Gift className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
            placeholder="Enter referral code"
            autoCapitalize="characters"
            className="pl-10"
            aria-label="Referral code"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <Button variant="brand" size="lg" onClick={handleApply} loading={loading}>
            Apply
          </Button>
          <Button variant="outline" size="lg" onClick={handleSkip} disabled={loading}>
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}
