/** Transfer amount bounds (USD, per-transaction). Server enforces the same cap. */
export const MIN_TRANSFER_AMOUNT = 1;
export const MAX_TRANSFER_AMOUNT = 10_000;
export const MIN_TRANSFER_CENTS = MIN_TRANSFER_AMOUNT * 100;
export const MAX_TRANSFER_CENTS = MAX_TRANSFER_AMOUNT * 100;

/**
 * Regulatory caps surfaced to the user on the KYC screen and used to
 * pre-validate the send-amount input. Daily cap depends on whether the user
 * provided an SSN during KYC (fetched server-side from Zynk); the 7-day cap
 * is fixed.
 */
export const DAILY_TRANSFER_LIMIT_WITH_SSN = 5_000;
export const DAILY_TRANSFER_LIMIT_WITHOUT_SSN = 2_999.99;
export const WEEKLY_TRANSFER_LIMIT = 15_000;

/** Pagination */
export const DEFAULT_PAGE_SIZE = 20;

/** Account number digit bounds */
export const MIN_ACCOUNT_DIGITS = 8;
export const MAX_ACCOUNT_DIGITS = 18;

/** Notification badge cap */
export const MAX_BADGE_COUNT = 99;
