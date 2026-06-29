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

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export function formatInr(amount: number): string {
  return `₹${INR_FORMATTER.format(amount)}`;
}

/**
 * Convert a user-entered USD string to INR at the given live mid-market rate.
 * Used for the regular (NRI) flow's "they'll receive" preview, which quotes the
 * live rate directly rather than the fee-aware server quote. Returns null when
 * the amount is empty/malformed or the rate is unavailable, so callers hide the
 * preview instead of rendering "₹NaN".
 */
export function usdToInr(amountUsd: string, rate: number | null | undefined): number | null {
  const trimmed = amountUsd.trim();
  if (!AMOUNT_REGEX.test(trimmed)) return null;
  const usd = parseFloat(trimmed);
  if (!Number.isFinite(usd) || usd <= 0) return null;
  if (rate == null || !Number.isFinite(rate) || rate <= 0) return null;
  return usd * rate;
}

/**
 * Convert a user-entered INR string back to a USD string (2 decimals) at the
 * live mid-market rate. The send pipeline is USD end-to-end (schema, limits,
 * payload), so the INR currency toggle on the amount field uses this to keep
 * the canonical form value in dollars while the user types rupees. Returns ""
 * when the amount is empty/malformed or the rate is unavailable, so the field
 * clears (and yup flags "required") instead of submitting a bad USD value.
 */
export function inrToUsd(amountInr: string, rate: number | null | undefined): string {
  const trimmed = amountInr.trim();
  if (!AMOUNT_REGEX.test(trimmed)) return "";
  const inr = parseFloat(trimmed);
  if (!Number.isFinite(inr) || inr <= 0) return "";
  if (rate == null || !Number.isFinite(rate) || rate <= 0) return "";
  return (Math.round((inr / rate) * 100) / 100).toFixed(2);
}

/** Render a fee fraction as a trimmed percentage, e.g. 0.003 → "0.3%". */
export function formatRatePercent(rate: number): string {
  if (!Number.isFinite(rate)) return "—";
  return `${parseFloat((rate * 100).toFixed(4))}%`;
}

/** Reduce a gross INR amount by an NRE fee fraction (0.003 = 0.3%). Returns the
 *  input unchanged when there's no amount or no fee. */
export function applyNreFee(gross: number | null, feeRate: number): number | null {
  if (gross == null) return null;
  if (!feeRate || feeRate <= 0) return gross;
  return gross * (1 - feeRate);
}
