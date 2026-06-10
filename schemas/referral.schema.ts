// Codes are generated as DATTA-XXXX (users) or DATTA-NAMEI (promoters), so the
// hyphen is part of the format. Allow uppercase letters, digits and hyphens;
// keep the upper bound generous for longer promoter codes.
export const REFERRAL_CODE_REGEX = /^[A-Z0-9-]{4,40}$/;

export function isValidReferralCode(value: string): boolean {
  return REFERRAL_CODE_REGEX.test(value);
}
