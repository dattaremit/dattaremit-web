"use client";

import { Suspense } from "react";
import { AddressForm } from "@/components/address-form";
import { COUNTRIES } from "@/constants/countries";
import { Skeleton } from "@/components/ui/skeleton";
import { useOnboardingRouter } from "@/hooks/use-onboarding-router";

function Fallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-72" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full" />
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
        description="We need your address to comply with money-transmission regulations."
        submitLabel={{ create: "Continue", update: "Save & continue" }}
        onAfterSubmit={() => goToNext()}
        countries={COUNTRIES.filter((c) => c.code === "US")}
      />
    </Suspense>
  );
}
