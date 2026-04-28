import type { Account } from "@/types/api";
import { ROUTES } from "@/constants/routes";

export type OnboardingStepKey = "referral" | "profile" | "address";
export type IndicatorStepKey = Exclude<OnboardingStepKey, "referral">;

export const ONBOARDING_STEPS: {
  key: IndicatorStepKey;
  label: string;
  href: string;
}[] = [
  { key: "profile", label: "Your profile", href: ROUTES.ONBOARDING.PROFILE },
  { key: "address", label: "Your address", href: ROUTES.ONBOARDING.ADDRESS },
];

const ALL_STEP_HREFS: Record<OnboardingStepKey, string> = {
  referral: ROUTES.ONBOARDING.REFERRAL,
  profile: ROUTES.ONBOARDING.PROFILE,
  address: ROUTES.ONBOARDING.ADDRESS,
};

const ALL_STEP_ORDER: OnboardingStepKey[] = [
  "referral",
  "profile",
  "address",
];

export function stepIndex(key: OnboardingStepKey): number {
  return ALL_STEP_ORDER.indexOf(key);
}

export function stepHref(key: OnboardingStepKey): string {
  return ALL_STEP_HREFS[key];
}

/** Resolve where to send the user after a step is saved. */
export function nextHref(state: OnboardingState): string {
  if (!state.nextStep) return ROUTES.ROOT;
  return stepHref(state.nextStep);
}

export interface OnboardingState {
  /** The first incomplete step (or null if everything is done). */
  nextStep: OnboardingStepKey | null;
  /** Whether each indicator step is satisfied. */
  completion: Record<IndicatorStepKey, boolean>;
}

export function computeOnboardingState(
  account: Account | null | undefined,
): OnboardingState {
  const u = account?.user;
  const profileDone =
    !!u && !!u.firstName && !!u.lastName && !!u.phoneNumber && !!u.dateOfBirth;
  // Address row alone isn't enough — server only creates the Zynk payment
  // entity once the address is fully accepted. If hasZynkEntity is false the
  // address step did not really complete (e.g. entity creation failed).
  const addressDone =
    (account?.addresses?.length ?? 0) > 0 && !!account?.hasZynkEntity;

  let nextStep: OnboardingStepKey | null = null;
  if (!u) nextStep = "referral";
  else if (!profileDone) nextStep = "profile";
  else if (!addressDone) nextStep = "address";

  return {
    nextStep,
    completion: {
      profile: profileDone,
      address: addressDone,
    },
  };
}
