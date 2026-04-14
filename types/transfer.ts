export interface SendMoneyPayload {
  recipientId: string;
  amountCents: number;
  note?: string;
}

export interface SendToSelfPayload {
  amountCents: number;
  note?: string;
}

export interface TransferQuote {
  sendAmount: { amount: number; currency: string };
  receiveAmount: { amount: number; currency: string };
  exchangeRate: { rate: number; conversion: string };
  fees: { amount: number; currency: string };
}

export interface SendMoneyResponse {
  transactionId: string;
  zynkTransactionId: string;
  status: string;
  quote: TransferQuote;
}
