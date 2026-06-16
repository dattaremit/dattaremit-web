import { api, idempotencyHeaders } from "./http-client";
import type {
  Recipient,
  BankDetails,
  CreateRecipientPayload,
  AddRecipientBankPayload,
  UpdateRecipientBankPayload,
  CheckIdentityPayload,
  CheckIdentityResult,
} from "@/types/recipient";

export const getRecipients = (): Promise<Recipient[]> => api.get("/recipients");

export const getRecipient = (id: string): Promise<Recipient> => api.get(`/recipients/${id}`);

export const createRecipient = (
  data: CreateRecipientPayload,
  idempotencyKey?: string,
): Promise<Recipient> =>
  api.post("/recipients", data, {
    headers: idempotencyHeaders(idempotencyKey),
  });

export const updateRecipient = (id: string, data: CreateRecipientPayload): Promise<Recipient> =>
  api.patch(`/recipients/${id}`, data);

export const addRecipientBank = (
  id: string,
  data: AddRecipientBankPayload,
  idempotencyKey?: string,
): Promise<Recipient> =>
  api.post(`/recipients/${id}/bank`, data, {
    headers: idempotencyHeaders(idempotencyKey),
  });

export const listRecipientBanks = (id: string): Promise<BankDetails[]> =>
  api.get(`/recipients/${id}/banks`);

export const updateRecipientBank = (
  recipientId: string,
  bankId: string,
  data: UpdateRecipientBankPayload,
): Promise<BankDetails> => api.patch(`/recipients/${recipientId}/banks/${bankId}`, data);

export const setDefaultRecipientBank = (
  recipientId: string,
  bankId: string,
): Promise<BankDetails> => api.post(`/recipients/${recipientId}/banks/${bankId}/default`);

export const deleteRecipientBank = (recipientId: string, bankId: string): Promise<void> =>
  api.delete(`/recipients/${recipientId}/banks/${bankId}`);

export const unlinkRecipient = (id: string): Promise<void> => api.delete(`/recipients/${id}`);

export const checkRecipientIdentity = (data: CheckIdentityPayload): Promise<CheckIdentityResult> =>
  api.post("/recipients/check-identity", data);

export const resendRecipientKyc = (id: string): Promise<void> =>
  api.post(`/recipients/${id}/resend-kyc`);

// Authed — used by the recipient form; scope is per-user.
export const checkRecipientEmailAvailable = (email: string): Promise<{ available: boolean }> =>
  api.get("/recipients/check-email", { params: { email } });
