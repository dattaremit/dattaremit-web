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

export function weeklyRemaining(past7DaysAmount: number): number {
  return Math.max(0, WEEKLY_TRANSFER_LIMIT - past7DaysAmount);
}

/**
 * Validate an amount (USD, as a string from the form) against the live KYC
 * tier and 7-day rolling cap. Returns a user-facing error message or null
 * when the amount is acceptable. Skipped when `limits` is undefined (still
 * loading) so we don't block submits before the first response lands.
 */
export function validateAmountAgainstLimits(
  amountStr: string,
  limits: SendLimits | undefined,
): string | null {
  if (!limits) return null;
  const amount = parseFloat(amountStr);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const dailyCap = dailyCapFor(limits.hasSsn);
  if (amount > dailyCap) {
    return limits.hasSsn
      ? `Single transfer can't exceed $${formatUsd(dailyCap)} per day.`
      : `Single transfer can't exceed $${formatUsd(dailyCap)} per day. Add your SSN to send up to $${formatUsd(DAILY_TRANSFER_LIMIT_WITH_SSN)}.`;
  }

  const remaining = weeklyRemaining(limits.past7DaysAmount);
  if (amount > remaining) {
    return `This exceeds your 7-day limit of $${formatUsd(WEEKLY_TRANSFER_LIMIT)}. You have $${formatUsd(remaining)} remaining this week.`;
  }

  return null;
}
