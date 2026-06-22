import type { ExternalAccountDetails } from "@/types/api";

/**
 * Human-readable label for the linked US (Plaid) funding account, e.g.
 * "CHASE COLLEGE ••0763". Returns null when there's nothing identifying to
 * show, so callers can fall back to the generic "Bank Connected" wording.
 */
export function formatExternalAccountLabel(
  details: ExternalAccountDetails | null | undefined,
): string | null {
  if (!details) return null;
  const name = details.accountName?.trim();
  const last4 = details.last4?.trim();
  if (name && last4) return `${name} ••${last4}`;
  if (name) return name;
  if (last4) return `Account ••${last4}`;
  return null;
}
