export interface SendMoneyPayload {
  recipientId: string;
  bankDetailsId?: string;
  amountCents: number;
  note?: string;
}

/** Which of the user's own Indian accounts a self-send lands in.
 *  "NRO" is the regular deposit account; "NRE" is the Non-Resident External
 *  account added via the NRE bank-details form. */
export type SelfAccountType = "NRO" | "NRE";

export interface SendToSelfPayload {
  amountCents: number;
  note?: string;
  /** Destination account type. Defaults to "NRO" (the regular deposit
   *  account) when omitted, matching prior behaviour. */
  accountType?: SelfAccountType;
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

export interface SendLimits {
  /** Total `sendAmount` for the user's non-failed, non-simulated transfers in
   * the trailing 24 hours. Used with the SSN-tier daily cap. */
  past24HoursAmount: number;
  /** Total `sendAmount` for the user's non-failed, non-simulated transfers in
   * the trailing 7 days. Matches the value the server enforces against. */
  past7DaysAmount: number;
  /** True when Zynk captured an SSN during the user's hosted KYC. Unlocks
   * the higher daily cap ($5,000 vs $3,000). */
  hasSsn: boolean;
}
