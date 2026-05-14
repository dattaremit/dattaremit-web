import {
  DAILY_TRANSFER_LIMIT_WITH_SSN,
  DAILY_TRANSFER_LIMIT_WITHOUT_SSN,
  WEEKLY_TRANSFER_LIMIT,
} from "@/constants/limits";
import type { SendLimits } from "@/types/transfer";

function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function dailyCapFor(hasSsn: boolean): number {
  return hasSsn ? DAILY_TRANSFER_LIMIT_WITH_SSN : DAILY_TRANSFER_LIMIT_WITHOUT_SSN;
}

export function dailyRemaining(past24HoursAmount: number, hasSsn: boolean): number {
  return Math.max(0, dailyCapFor(hasSsn) - past24HoursAmount);
}

export function weeklyRemaining(past7DaysAmount: number): number {
  return Math.max(0, WEEKLY_TRANSFER_LIMIT - past7DaysAmount);
}

/**
 * Validate an amount (USD, as a string from the form) against the live KYC
 * tier and rolling caps. Both caps are *cumulative*: we check that
 * (already-sent + this transfer) fits inside the window, matching what the
 * server enforces inside its locked transaction. Returns a user-facing error
 * message or null when the amount is acceptable. Skipped when `limits` is
 * undefined (still loading) so we don't block submits before the first
 * response lands — callers should also gate the submit button on the loaded
 * state for defense in depth.
 */
export function validateAmountAgainstLimits(
  amountStr: string,
  limits: SendLimits | undefined,
): string | null {
  if (!limits) return null;
  const amount = parseFloat(amountStr);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const dailyCap = dailyCapFor(limits.hasSsn);
  const dailyLeft = dailyRemaining(limits.past24HoursAmount, limits.hasSsn);
  if (amount > dailyLeft) {
    const base = `This exceeds your 24-hour limit of $${formatUsd(dailyCap)}. You have $${formatUsd(dailyLeft)} remaining today.`;
    return limits.hasSsn
      ? base
      : `${base} Add your SSN to send up to $${formatUsd(DAILY_TRANSFER_LIMIT_WITH_SSN)} per day.`;
  }

  const weeklyLeft = weeklyRemaining(limits.past7DaysAmount);
  if (amount > weeklyLeft) {
    return `This exceeds your 7-day limit of $${formatUsd(WEEKLY_TRANSFER_LIMIT)}. You have $${formatUsd(weeklyLeft)} remaining this week.`;
  }

  return null;
}
