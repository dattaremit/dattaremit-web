export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
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
  publicKey: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  dateOfBirth: string;
  accountStatus: string;
  addresses?: Address[];
  created_at: string;
  updated_at: string;
}

export interface CreateUserPayload {
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  publicKey: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  dateOfBirth: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumberPrefix?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
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

export interface Account {
  user: AccountUser | null;
  addresses: Address[];
  wallet: unknown;
  accountStatus: string;
  isBackedUp: boolean;
}

// ── Plaid ──

export interface PlaidLinkToken {
  plaid_token: string;
}

// ── Funding Account ──

export interface FundingAccountInfo {
  currency: string;
  bank_name: string;
  bank_address: string;
  bank_routing_number: string;
  bank_account_number: string;
  bank_beneficiary_name: string;
  bank_beneficiary_address: string;
  payment_rail: string;
  payment_rails: string[];
}

export interface FundingAccount {
  id: string;
  entityId: string;
  jurisdictionId: string;
  providerId: string;
  status: string;
  accountInfo: FundingAccountInfo;
}

export interface CreateFundingAccountResponse {
  user: User;
  fundingAccount: FundingAccount;
}

// ── External Accounts ──

export type ExternalAccountStatus = "ACTIVE" | "INACTIVE";

export interface ExternalAccount {
  id: string;
  userId: string;
  zynkExternalAccountId: string | null;
  walletAddress: string;
  walletId: string | null;
  label: string | null;
  type: string;
  status: ExternalAccountStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateExternalAccountPayload {
  walletAddress: string;
  chain?: "ethereum" | "solana";
  label?: string;
  type?: string;
  walletId?: string;
}

// ── Activity ──

export type ActivityType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "EXTERNAL_ACCOUNT_ADDED"
  | "EXTERNAL_ACCOUNT_REMOVED"
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
  | "ACCOUNT_ACTIVATED";

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
