"use client";

import { Suspense } from "react";
import { PersonalInfoForm } from "@/components/personal-info-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useOnboardingRouter } from "@/hooks/use-onboarding-router";

function Fallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function OnboardingProfilePage() {
  const { goToNext } = useOnboardingRouter();
  return (
    <Suspense fallback={<Fallback />}>
      <PersonalInfoForm
        chromeless
        title="Tell us about yourself"
        description="We'll use this to set up your account."
        submitLabel={{ create: "Continue", update: "Save & continue" }}
        onAfterSubmit={() => goToNext()}
      />
    </Suspense>
  );
}
