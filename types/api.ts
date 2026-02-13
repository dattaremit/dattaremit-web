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

export type AccountUser = Omit<User, "addresses">;

export interface Account {
  user: AccountUser | null;
  addresses: Address[];
  wallet: unknown;
  accountStatus: string;
  isBackedUp: boolean;
}
