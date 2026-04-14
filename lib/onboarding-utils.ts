import type { OnboardingStep } from "@/store/onboarding-store";
import type { Account } from "@/types/api";

export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Determines the correct onboarding step from server account data.
 * Accepts the unwrapped Account (web API interceptor already strips the envelope).
 */
export function resolveOnboardingStep(account: Account | null | undefined): OnboardingStep {
  if (!account) return "referral";
  if (account.isOnWaitlist) return "waitlist";
  if (!account.user) return "referral";
  if (!account.addresses || account.addresses.length === 0) return "address";

  switch (account.accountStatus) {
    case "INITIAL":
    case "REJECTED":
      return "kyc";
    case "PENDING":
    case "ACTIVE":
      return "completed";
    default:
      return "profile";
  }
}
