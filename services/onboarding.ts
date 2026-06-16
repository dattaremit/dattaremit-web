import { api } from "./http-client";
import type { OnboardingAddressPayload } from "@/types/api";

export const submitOnboardingAddress = (data: OnboardingAddressPayload): Promise<void> =>
  api.post("/onboarding/address", data);

export const requestOnboardingKyc = (): Promise<{ message: string }> => api.post("/onboarding/kyc");
