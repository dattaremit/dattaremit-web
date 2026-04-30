import type { ActivityType } from "@/types/api";

export const TRANSFER_TYPES: ActivityType[] = [
  "DEPOSIT",
  "WITHDRAWAL",
  "TRANSFER",
  "PAYMENT",
  "REFUND",
];

export const KYC_TYPES: ActivityType[] = [
  "KYC_SUBMITTED",
  "KYC_APPROVED",
  "KYC_REJECTED",
  "KYC_PENDING",
  "KYC_VERIFIED",
  "KYC_FAILED",
];

export const ACCOUNT_TYPES: ActivityType[] = ["ACCOUNT_APPROVED", "ACCOUNT_ACTIVATED"];
