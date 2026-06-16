import { api } from "./http-client";

// Public endpoint — used by the sign-up form before calling Clerk so a
// duplicate email is caught before an unrecoverable Clerk account is
// created.
//
// SECURITY NOTE (email enumeration — no client fix needed): returning
// { available } for an arbitrary email allows account enumeration. This is a
// deliberate UX trade-off (catch duplicates pre-Clerk-signup). Any hardening
// (rate-limit / CAPTCHA on this endpoint) is a backend concern living at
// NEXT_PUBLIC_API_URL, not in this frontend client, so no change is made here.
export const checkUserEmailAvailable = (email: string): Promise<{ available: boolean }> =>
  api.get("/check-email", { params: { email } });
