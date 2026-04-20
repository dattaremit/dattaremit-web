/**
 * Strip the dial-code prefix from a full phone number, leaving just the
 * national digits. If the supplied `prefix` matches the start of `fullPhone`
 * it's removed verbatim; otherwise we fall back to stripping any leading
 * `+` followed by 1–4 digits (covers the case where the user typed a new
 * country code before the prefix state updates).
 */
export function stripPhonePrefix(fullPhone: string, prefix: string): string {
  if (fullPhone.startsWith(prefix)) {
    return fullPhone.substring(prefix.length);
  }
  return fullPhone.replace(/^\+\d{1,4}/, "");
}
