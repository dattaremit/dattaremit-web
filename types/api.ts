export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
}

export type AddressType = "PRESENT" | "PERMANENT";

export interface Address {
  id: string;
  type: AddressType;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  userId: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  dateOfBirth: string;
  accountStatus: string;
  /** "US" = US citizen, "IN" = Indian national / NRI. No Indian KYC on any
   *  flow — every user off-ramps via a saved Indian bank. */
  nationality?: string | null;
  zynkExternalAccountId?: string | null;
  achPushEnabled?: boolean;
  addresses?: Address[];
  created_at: string;
  updated_at: string;
}

export interface CreateUserPayload {
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  dateOfBirth: string;
  nationality?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumberPrefix?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
}

export interface OnboardingAddressPayload {
  type: AddressType;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface CreateAddressPayload {
  type: AddressType;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  type?: AddressType;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface ZynkKycData {
  message: string;
  kycLink: string;
  tosLink?: string;
  kycStatus: string;
}

export type AccountUser = Omit<User, "addresses">;

export type AccountStatus = "INITIAL" | "PENDING" | "ACTIVE" | "REJECTED";

export interface Account {
  user: AccountUser | null;
  addresses: Address[];
  accountStatus: AccountStatus | string;
  hasBankAccount?: boolean;
  /** True if the user has any locally-saved Indian bank in bank_details — the
   *  off-ramp destination for the self-transfer flow. Drives the "Indian bank
   *  linked" state. */
  hasUserBank?: boolean;
  /** True if the user has a linked NRE deposit account. When false, the
   *  self-send flow renders the "add NRE bank details" form before letting
   *  the user pick NRE as a destination. */
  hasNreBank?: boolean;
  /** True if the server has created a Zynk payment entity for this user.
   *  Address submission triggers entity creation — if false, the address
   *  step is not actually complete (entity creation failed or is pending). */
  hasZynkEntity?: boolean;
  isOnWaitlist?: boolean;
  isBlocked?: boolean;
  balance?: number;
}

// ── Plaid ──

export interface PlaidLinkToken {
  plaid_token: string;
}

// ── External Account ──

/** Display details for the linked US (Plaid) funding account, fetched from the
 *  provider on demand. Any field may be null if the provider didn't return it. */
export interface ExternalAccountDetails {
  accountName: string | null;
  institutionId: string | null;
  last4: string | null;
  paymentRail: string | null;
}

export interface AddExternalAccountPayload {
  accountName: string;
  paymentRail?: string;
  plaidPublicToken: string;
  plaidAccountId: string;
}

// ── NRE Bank Account ──

/** Payload for POST /api/nre-bank-accounts (form-driven, stored locally — no
 *  external Zynk account is created). Only the four core fields are required;
 *  the rest default server-side (accountType=NRE, currency=INR,
 *  accountStatus=ACTIVE, isPrimary=true). */
export interface AddNreBankAccountPayload {
  accountType?: string;
  bankName: string;
  branchName?: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  swiftCode?: string;
  currency?: string;
  accountStatus?: string;
  isPrimary?: boolean;
}

export interface NreBankAccount {
  id: string;
  accountType: string;
  bankName: string | null;
  branchName: string | null;
  accountHolderName: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  swiftCode: string | null;
  currency: string;
  accountStatus: string;
  isPrimary: boolean;
  created_at?: string;
  updated_at?: string;
}

// ── Activity ──

export type ActivityType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TRANSFER"
  | "PAYMENT"
  | "REFUND"
  | "KYC_SUBMITTED"
  | "KYC_APPROVED"
  | "KYC_REJECTED"
  | "KYC_PENDING"
  | "KYC_VERIFIED"
  | "KYC_FAILED"
  | "ACCOUNT_APPROVED"
  | "ACCOUNT_ACTIVATED"
  | "ACCOUNT_DEACTIVATED";

export type ActivityStatus = "PENDING" | "FAILED" | "COMPLETE";

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  status: ActivityStatus;
  description: string | null;
  amount: number | null;
  metadata: Record<string, unknown> | null;
  referenceId: string | null;
  ipAddress: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityListResponse {
  items: Activity[];
  total: number;
  limit: number;
  offset: number;
}

export interface ActivityQueryParams {
  status?: ActivityStatus;
  type?: ActivityType;
  referenceId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}
