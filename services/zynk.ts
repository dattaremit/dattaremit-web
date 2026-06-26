import { api, idempotencyHeaders } from "./http-client";
import type {
  User,
  ZynkKycData,
  PlaidLinkToken,
  AddExternalAccountPayload,
  ExternalAccountDetails,
} from "@/types/api";

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
export const getExternalAccount = (): Promise<ExternalAccountDetails | null> =>
  api.get("/zynk/external-account");

export const addExternalAccount = (
  data: AddExternalAccountPayload,
  idempotencyKey?: string,
): Promise<User> =>
  api.post("/zynk/external-account", data, {
    headers: idempotencyHeaders(idempotencyKey),
  });
