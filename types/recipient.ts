export type RecipientKycStatus = "PENDING" | "APPROVED" | "REJECTED" | "FAILED" | "NOT_REQUIRED";
export type BankAccountType = "SAVINGS" | "CURRENT" | "NRE" | "NRO" | "OTHER";

/**
 * Whether a recipient is cleared to receive money — either their KYC was
 * approved, or KYC isn't required for them (created while recipient KYC was
 * turned off). Both states allow adding a bank and sending; neither shows the
 * "waiting for KYC" UI.
 */
export function isRecipientReady(kycStatus: RecipientKycStatus | null | undefined): boolean {
  return kycStatus === "APPROVED" || kycStatus === "NOT_REQUIRED";
}

export interface BankDetails {
  id: string;
  label: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumberMasked: string | null;
  bankIfsc: string | null;
  branchName: string | null;
  bankAccountType: BankAccountType | null;
  isDefault: boolean;
  created_at?: string;
}

export interface Recipient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  nationality: string;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  kycStatus: RecipientKycStatus;
  hasBankAccount: boolean;
  banks: BankDetails[];
  defaultBank: BankDetails | null;
  /**
   * The user who first added this shared identity. Used to gate edits to the
   * shared profile — only the originator can edit. Null if the originator
   * has been deleted (onDelete: SetNull).
   */
  createdByUserId: string | null;
  /** True when the create call linked the user to an already-existing recipient. */
  shared?: boolean;
  /** True if the backend sent the KYC email to the recipient; false if send failed. */
  kycEmailSent?: boolean;
  created_at: string;
}

export interface CreateRecipientPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  // Required when creating a brand-new recipient; omitted on the edit flow,
  // which reuses this payload shape but never collects KYC identity docs.
  aadhaarNumber?: string;
}

export interface AddRecipientBankPayload {
  accountName: string;
  accountNumber: string;
  ifsc: string;
  bankName?: string;
  branchName?: string;
  bankAccountType?: BankAccountType;
  label?: string;
}

export interface UpdateRecipientBankPayload {
  label?: string | null;
  bankName?: string;
  branchName?: string;
  bankAccountType?: BankAccountType;
}

export interface CheckIdentityPayload {
  email: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
}

export type CheckIdentityResult =
  | { exists: false }
  | {
      exists: true;
      alreadyLinked: boolean;
      recipient: {
        id: string;
        firstName: string;
        lastName: string;
        kycStatus: RecipientKycStatus | null;
        hasBankAccount: boolean;
      };
    };
