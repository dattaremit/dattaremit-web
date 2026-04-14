import type { Account } from "@/types/api";

export type OnboardingStepKey = "profile" | "address" | "kyc";

export const ONBOARDING_STEPS: { key: OnboardingStepKey; label: string; href: string }[] = [
  { key: "profile", label: "Your profile", href: "/onboarding/profile" },
  { key: "address", label: "Your address", href: "/onboarding/address" },
  { key: "kyc", label: "Verify identity", href: "/onboarding/kyc" },
];

export interface OnboardingState {
  /** The first incomplete step (or null if everything is done). */
  nextStep: OnboardingStepKey | null;
  /** Whether each step is satisfied. */
  completion: Record<OnboardingStepKey, boolean>;
}

export function computeOnboardingState(account: Account | null | undefined): OnboardingState {
  const u = account?.user;
  const profileDone =
    !!u &&
    !!u.firstName &&
    !!u.lastName &&
    !!u.phoneNumber &&
    !!u.dateOfBirth;
  const addressDone = (account?.addresses?.length ?? 0) > 0;
  const status = account?.accountStatus;
  const kycDone = status === "ACTIVE" || status === "PENDING";

  let nextStep: OnboardingStepKey | null = null;
  if (!profileDone) nextStep = "profile";
  else if (!addressDone) nextStep = "address";
  else if (!kycDone) nextStep = "kyc";

  return {
    nextStep,
    completion: {
      profile: profileDone,
      address: addressDone,
      kyc: kycDone,
    },
  };
}
