export type RecipientKycStatus = "PENDING" | "APPROVED" | "REJECTED" | "FAILED";

export interface Recipient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  dateOfBirth: string;
  nationality: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  kycStatus: RecipientKycStatus;
  hasBankAccount: boolean;
  bankName?: string;
  bankAccountNumberMasked?: string;
  bankIfsc?: string;
  created_at: string;
}

export interface CreateRecipientPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface AddRecipientBankPayload {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  branchName: string;
  bankAccountType: string;
  phoneNumber: string;
}
