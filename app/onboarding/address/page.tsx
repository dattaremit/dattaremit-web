"use client";

import { Suspense } from "react";
import { AddressForm } from "@/components/address-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useOnboardingRouter } from "@/hooks/use-onboarding-router";

function Fallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export default function OnboardingAddressPage() {
  const { goToNext } = useOnboardingRouter();
  return (
    <Suspense fallback={<Fallback />}>
      <AddressForm
        chromeless
        title="Where do you live?"
        description="We need your address to comply with regulations."
        submitLabel={{ create: "Continue", update: "Save & continue" }}
        onAfterSubmit={() => goToNext()}
      />
    </Suspense>
  );
}
