import type { OnboardingStep } from "@/store/onboarding-store";

// Web route paths. Routes prefixed with /onboarding are placeholders that will
// be created in Phase 2/3 — until then these redirect targets may 404.
export const ONBOARDING_STEP_ROUTES: Record<OnboardingStep, string> = {
  welcome: "/welcome",
  auth: "/sign-in",
  waitlist: "/onboarding/waitlist",
  referral: "/onboarding/referral",
  profile: "/onboarding/profile",
  address: "/onboarding/address",
  kyc: "/dashboard/kyc",
  completed: "/dashboard",
};

export const GUARD_STEP_ROUTES: Record<string, string> = {
  welcome: "/onboarding/profile",
  auth: "/onboarding/profile",
  profile: "/onboarding/profile",
  address: "/onboarding/address",
  kyc: "/dashboard/kyc",
};
