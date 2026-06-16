import { api } from "./http-client";

export const validateReferralCode = (code: string): Promise<{ valid: boolean }> =>
  api.post("/referral/validate", { code });

export const reserveReferralCode = (code: string): Promise<{ reserved: boolean }> =>
  api.post("/referral/reserve", { code });

// The current user's own referral code (generated on first call if absent)
// plus how many people have signed up with it, and an anonymized funnel of how
// far that referred cohort has progressed. Funnel fields are COUNTS only — they
// never reveal which referred user did what.
export interface MyReferral {
  referCode: string;
  totalReferrals: number;
  completedKyc: number;
  connectedBank: number;
  addedRecipient: number;
  completedTransfer: number;
}

export const getMyReferral = (): Promise<MyReferral> => api.get("/referral/me");
