import { api, idempotencyHeaders } from "./http-client";
import type {
  BankDetails,
  AddRecipientBankPayload,
  UpdateRecipientBankPayload,
} from "@/types/recipient";

// User's own banks (polymorphic BankDetails, ownerType=USER).
export const listMyBanks = (): Promise<BankDetails[]> => api.get("/banks");

export const addMyBank = (
  data: AddRecipientBankPayload,
  idempotencyKey?: string,
): Promise<BankDetails> =>
  api.post("/banks", data, {
    headers: idempotencyHeaders(idempotencyKey),
  });

export const updateMyBank = (
  bankId: string,
  data: UpdateRecipientBankPayload,
): Promise<BankDetails> => api.patch(`/banks/${bankId}`, data);

export const setDefaultMyBank = (bankId: string): Promise<BankDetails> =>
  api.post(`/banks/${bankId}/default`);

export const deleteMyBank = (bankId: string): Promise<void> => api.delete(`/banks/${bankId}`);
