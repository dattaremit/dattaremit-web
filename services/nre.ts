import { api, idempotencyHeaders } from "./http-client";
import type { AddNreBankAccountPayload, NreBankAccount } from "@/types/api";

// Form-driven save into the dedicated nre_bank_accounts table (no external Zynk
// account). One row per user — POST creates or replaces it.
export const addNreAccount = (
  data: AddNreBankAccountPayload,
  idempotencyKey?: string,
): Promise<NreBankAccount> =>
  api.post("/nre-bank-accounts", data, {
    headers: idempotencyHeaders(idempotencyKey),
  });

export const getNreBankAccount = (): Promise<NreBankAccount | null> =>
  api.get("/nre-bank-accounts");
