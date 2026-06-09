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

export function computeInrPreview(
  usdInput: string,
  rate: number | undefined | null,
): number | null {
  if (!rate || rate <= 0) return null;
  const trimmed = usdInput.trim();
  if (!trimmed || !AMOUNT_REGEX.test(trimmed)) return null;
  const usd = parseFloat(trimmed);
  if (!Number.isFinite(usd) || usd <= 0) return null;
  return usd * rate;
}
