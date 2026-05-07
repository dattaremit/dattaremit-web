"use client";

import { Suspense } from "react";
import { AddressForm } from "@/components/address-form";
import { COUNTRIES } from "@/constants/countries";
import { OnboardingFormFallback } from "@/components/ui/onboarding-form-fallback";
import { useOnboardingRouter } from "@/hooks/use-onboarding-router";

export default function OnboardingAddressPage() {
  const { goToNext } = useOnboardingRouter();
  return (
    <Suspense fallback={<OnboardingFormFallback />}>
      <AddressForm
        chromeless
        title="Where do you live?"
        description="We need your address to comply with money-transmission regulations."
        submitLabel={{ create: "Continue", update: "Save & continue" }}
        onAfterSubmit={() => goToNext()}
        countries={COUNTRIES.filter((c) => c.code === "US")}
        fixedCountry="US"
      />
    </Suspense>
  );
}
