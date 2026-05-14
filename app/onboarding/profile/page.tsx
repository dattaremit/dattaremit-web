"use client";

import { Suspense } from "react";
import { PersonalInfoForm } from "@/components/personal-info-form";
import { OnboardingFormFallback } from "@/components/ui/onboarding-form-fallback";
import { useOnboardingRouter } from "@/hooks/use-onboarding-router";

export default function OnboardingProfilePage() {
  const { goToNext } = useOnboardingRouter();
  return (
    <Suspense fallback={<OnboardingFormFallback />}>
      <PersonalInfoForm
        chromeless
        title="Tell us about you"
        description="A few basics to set up your account. We'll never share these."
        submitLabel={{ create: "Continue", update: "Save & continue" }}
        onAfterSubmit={() => goToNext()}
      />
    </Suspense>
  );
}
