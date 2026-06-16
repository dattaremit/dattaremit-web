import { api, idempotencyHeaders } from "./http-client";
import type {
  SendMoneyPayload,
  SendToSelfPayload,
  SendMoneyResponse,
  SendLimits,
  SelfFee,
  RegularFeeQuote,
  NreFeeQuote,
} from "@/types/transfer";

export const sendMoney = (
  data: SendMoneyPayload,
  idempotencyKey?: string,
): Promise<SendMoneyResponse> =>
  api.post("/transfers/send", data, {
    headers: idempotencyHeaders(idempotencyKey),
  });

export const sendToSelf = (
  data: SendToSelfPayload,
  idempotencyKey?: string,
): Promise<SendMoneyResponse> =>
  api.post("/transfers/send-to-self", data, {
    headers: idempotencyHeaders(idempotencyKey),
  });

export const getSendLimits = (): Promise<SendLimits> => api.get("/transfers/limits");

export const getSelfFee = (): Promise<SelfFee> => api.get("/transfers/self-fee");

// Server-computed receive-amount quotes, driven by the amount the user types
// on the send screen. `amount` is whole/decimal USD; the server validates it.
export const getRegularFee = (amount: number): Promise<RegularFeeQuote> =>
  api.get(`/fee/regular/${amount}`);

export const getNreFee = (amount: number): Promise<NreFeeQuote> => api.get(`/fee/nre/${amount}`);
