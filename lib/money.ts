import { MIN_TRANSFER_CENTS, MAX_TRANSFER_CENTS } from "@/constants/limits";

const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/;

/**
 * Convert a user-entered dollar string to integer cents using string arithmetic
 * to avoid IEEE-754 rounding surprises (e.g. Math.round(1.005 * 100) === 100).
 * Throws if the value is malformed or outside the allowed transfer range.
 */
export function dollarsToCents(value: string): number {
  const trimmed = value.trim();
  if (!AMOUNT_REGEX.test(trimmed)) {
    throw new Error("Enter a valid amount");
  }
  const [whole, frac = ""] = trimmed.split(".");
  const paddedFrac = (frac + "00").slice(0, 2);
  const cents = parseInt(whole, 10) * 100 + parseInt(paddedFrac, 10);
  if (!Number.isFinite(cents)) {
    throw new Error("Enter a valid amount");
  }
  if (cents < MIN_TRANSFER_CENTS || cents > MAX_TRANSFER_CENTS) {
    throw new Error("Amount is outside the allowed range");
  }
  return cents;
}
