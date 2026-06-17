/**
 * Per-transfer amount bounds (USD, per-transaction). Server enforces the same.
 * Minimum is flat; the maximum is SSN-tiered ($4,999 with SSN / $2,999 without)
 * like the daily cap. MAX_TRANSFER_AMOUNT is the absolute ceiling (the SSN
 * tier), used by the schema/cents checks that run before the SSN tier is known;
 * the tighter no-SSN cap is enforced in `validateAmountAgainstLimits`.
 */
export const MIN_TRANSFER_AMOUNT = 15;
export const MAX_TRANSFER_WITH_SSN = 4_999;
export const MAX_TRANSFER_WITHOUT_SSN = 2_999;
export const MAX_TRANSFER_AMOUNT = MAX_TRANSFER_WITH_SSN;
export const MIN_TRANSFER_CENTS = MIN_TRANSFER_AMOUNT * 100;
export const MAX_TRANSFER_CENTS = MAX_TRANSFER_AMOUNT * 100;

/**
 * Rolling-window cumulative caps surfaced to the user on the KYC screen and
 * used to pre-validate the send-amount input. The daily cap is the maximum
 * the user may send across **all** transfers in the trailing 24-hour window;
 * the weekly cap covers the trailing 7-day window. Daily tier depends on
 * whether the user provided an SSN during KYC (fetched server-side from
 * Zynk).
 *
 * Server enforces the same caps inside the locked transaction in
 * `transfer.service.ts` — these constants exist only for UX preview.
 */
export const DAILY_TRANSFER_LIMIT_WITH_SSN = 5_000;
export const DAILY_TRANSFER_LIMIT_WITHOUT_SSN = 3_000;
export const WEEKLY_TRANSFER_LIMIT = 15_000;

/** Pagination */
export const DEFAULT_PAGE_SIZE = 20;

/** Account number digit bounds */
export const MIN_ACCOUNT_DIGITS = 8;
export const MAX_ACCOUNT_DIGITS = 18;

/** Notification badge cap */
export const MAX_BADGE_COUNT = 99;
