import { Suspense } from "react";
import { PersonalInfoForm } from "@/components/personal-info-form";
import { Skeleton } from "@/components/ui/skeleton";

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
  return (
    <Suspense fallback={<Fallback />}>
      <PersonalInfoForm
        chromeless
        title="Tell us about yourself"
        description="We'll use this to set up your account."
        nextHrefOnCreate="/onboarding/address"
        nextHrefOnUpdate="/onboarding/address"
        submitLabel={{ create: "Continue", update: "Continue" }}
      />
    </Suspense>
  );
}
