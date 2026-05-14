import type { OnboardingStep } from "@/store/onboarding-store";
import { ROUTES } from "@/constants/routes";

export const ONBOARDING_STEP_ROUTES: Record<OnboardingStep, string> = {
  welcome: ROUTES.SIGN_IN,
  auth: ROUTES.SIGN_IN,
  blocked: ROUTES.ONBOARDING.BLOCKED,
  waitlist: ROUTES.ONBOARDING.WAITLIST,
  referral: ROUTES.ONBOARDING.REFERRAL,
  profile: ROUTES.ONBOARDING.PROFILE,
  address: ROUTES.ONBOARDING.ADDRESS,
  completed: ROUTES.ROOT,
};

export const GUARD_STEP_ROUTES: Record<string, string> = {
  welcome: ROUTES.ONBOARDING.PROFILE,
  auth: ROUTES.ONBOARDING.PROFILE,
  profile: ROUTES.ONBOARDING.PROFILE,
  address: ROUTES.ONBOARDING.ADDRESS,
};
