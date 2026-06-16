import { api, idempotencyHeaders } from "./http-client";
import type {
  User,
  ZynkKycData,
  PlaidLinkToken,
  AddExternalAccountPayload,
  AddDepositAccountPayload,
} from "@/types/api";
import type { IndianKycEncryptedPayload, IndianKycResponse } from "@/types/indian-kyc";

// ── Zynk (KYC) ──
export const createZynkEntity = (idempotencyKey?: string): Promise<User> =>
  api.post("/zynk/entities", undefined, {
    headers: idempotencyHeaders(idempotencyKey),
  });

export const startKyc = (): Promise<ZynkKycData> => api.post("/zynk/kyc");

// ── Zynk (Plaid) ──
export const generatePlaidLinkToken = (): Promise<PlaidLinkToken> =>
  api.post("/zynk/plaid-link-token");

// ── Zynk (External Account) ──
export const addExternalAccount = (
  data: AddExternalAccountPayload,
  idempotencyKey?: string,
): Promise<User> =>
  api.post("/zynk/external-account", data, {
    headers: idempotencyHeaders(idempotencyKey),
  });

// ── Zynk (Deposit Account) ──
export const addDepositAccount = (
  data: AddDepositAccountPayload,
  idempotencyKey?: string,
): Promise<User> =>
  api.post("/zynk/deposit-account", data, {
    headers: idempotencyHeaders(idempotencyKey),
  });

// ── Zynk (Indian KYC) ──
export const submitIndianKycEncrypted = (
  data: IndianKycEncryptedPayload,
): Promise<IndianKycResponse> => api.post("/zynk/indian-kyc", data);
