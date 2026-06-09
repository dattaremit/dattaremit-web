export interface SendMoneyPayload {
  recipientId: string;
  bankDetailsId?: string;
  amountCents: number;
  note?: string;
}

/** Which of the user's own Indian accounts a self-send lands in (UI concept).
 *  "NRO" is the regular deposit account; "NRE" is the Non-Resident External
 *  account added via the NRE bank-details form. */
export type SelfAccountType = "NRO" | "NRE";

/** Wire value the server expects on `/transfers/send-to-self`. "OFFRAMP" is
 *  the regular route (maps to the NRO selection); "NRE" pays out to the NRE
 *  bank. The server defaults to "OFFRAMP" when omitted. */
export type SelfPayoutType = "OFFRAMP" | "NRE";

export interface SendToSelfPayload {
  amountCents: number;
  note?: string;
  payoutType?: SelfPayoutType;
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

/** Fee applied when a user transfers to their own NRE account, as a fraction
 *  of the payout (0.003 = 0.3%). Surfaced so the UI can warn the user how much
 *  the cut costs before they confirm. 0 means no fee. */
export interface SelfFee {
  nreFeeRate: number;
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
