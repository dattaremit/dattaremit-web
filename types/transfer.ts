/** How the INR payout is delivered. "BANK" pays out to a bank account;
 *  "UPI" pays out to a UPI VPA (`upiId`). The server defaults to "BANK". */
export type PaymentMethod = "BANK" | "UPI";

export interface SendMoneyPayload {
  recipientId: string;
  /** Only sent for bank transfers; the server forbids it for UPI. */
  bankDetailsId?: string;
  amountCents: number;
  note?: string;
  paymentMethod?: PaymentMethod;
  /** Required when `paymentMethod` is "UPI". */
  upiId?: string;
}

/** Which of the user's own Indian destinations a self-send lands in (UI
 *  concept). "NRO" is the regular deposit account; "NRE" is the Non-Resident
 *  External account added via the NRE bank-details form; "UPI" routes via the
 *  regular (OFFRAMP) path but pays out to the user's own UPI VPA. */
export type SelfAccountType = "NRO" | "NRE" | "UPI";

/** Wire value the server expects on `/transfers/send-to-self`. "OFFRAMP" is
 *  the regular route (maps to the NRO selection); "NRE" pays out to the NRE
 *  bank. The server defaults to "OFFRAMP" when omitted. */
export type SelfPayoutType = "OFFRAMP" | "NRE";

export interface SendToSelfPayload {
  amountCents: number;
  note?: string;
  payoutType?: SelfPayoutType;
  /** UPI is INR-only, so the server only allows it on "OFFRAMP" (regular/NRO)
   *  self-transfers — never on "NRE". */
  paymentMethod?: PaymentMethod;
  /** Required when `paymentMethod` is "UPI". */
  upiId?: string;
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

/** Server-computed quote for a regular (non-NRE) transfer of a given USD
 *  amount. `receiveAmount` is the INR the recipient gets, net of provider and
 *  banking fees. Returned by `GET /fee/regular/:amount`. */
export interface RegularFeeQuote {
  receiveAmount: number;
}

/** Server-computed quote for an NRE self-transfer. `receiveAmount` is the net
 *  INR after all fees; `nreFee` is the rupee amount taken as the NRE cut.
 *  Returned by `GET /fee/nre/:amount`. */
export interface NreFeeQuote {
  receiveAmount: number;
  nreFee: number;
}

export interface SendLimits {
  /** Total `sendAmount` for the user's non-failed, non-simulated transfers in
   * the trailing 24 hours. Used with the SSN-tier daily cap. */
  past24HoursAmount: number;
  /** Total `sendAmount` for the user's non-failed, non-simulated transfers in
   * the trailing 7 days. Matches the value the server enforces against. */
  past7DaysAmount: number;
  /** True when Zynk captured an SSN during the user's hosted KYC. Unlocks
   * the higher daily cap ($4,999 vs $2,999). */
  hasSsn: boolean;
}

// ── Balance Send (transfer requests) ──
// A "balance send" filed against the user's admin-credited balance. It is NOT a
// real transfer — the server just records it (USD amount, captured live rate,
// computed INR end amount, destination) for an admin to fulfil manually.

export type TransferRequestDestinationType = "RECIPIENT" | "SELF_BANK" | "SELF_NRE";

export type TransferRequestStatus = "PENDING" | "COMPLETED" | "REJECTED";

export interface CreateTransferRequestPayload {
  destinationType: TransferRequestDestinationType;
  /** Required when destinationType is "RECIPIENT". */
  recipientId?: string;
  /** Required when destinationType is "RECIPIENT" or "SELF_BANK". */
  bankDetailsId?: string;
  /** Required when destinationType is "SELF_NRE". */
  nreBankAccountId?: string;
  /** Whole/decimal USD spent from the user's balance. */
  amountUsd: number;
  /** Live USD→INR rate captured on the client at submit time. */
  exchangeRate: number;
  note?: string;
}

export interface TransferRequest {
  id: string;
  amountUsd: number;
  exchangeRate: number;
  endAmountInr: number;
  destinationType: TransferRequestDestinationType;
  destinationLabel: string;
  status: TransferRequestStatus;
  note: string | null;
  created_at: string;
}
