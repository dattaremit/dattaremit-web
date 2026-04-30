import axios from "axios";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { logger } from "@/lib/logger";
import type {
  ApiResponse,
  User,
  Address,
  Account,
  CreateUserPayload,
  UpdateUserPayload,
  CreateAddressPayload,
  UpdateAddressPayload,
  OnboardingAddressPayload,
  ZynkKycData,
  PlaidLinkToken,
  AddExternalAccountPayload,
  AddDepositAccountPayload,
  Activity,
  ActivityListResponse,
  ActivityQueryParams,
} from "@/types/api";
import type {
  Recipient,
  BankDetails,
  CreateRecipientPayload,
  AddRecipientBankPayload,
  UpdateRecipientBankPayload,
  CheckIdentityPayload,
  CheckIdentityResult,
} from "@/types/recipient";
import type { SendMoneyPayload, SendToSelfPayload, SendMoneyResponse } from "@/types/transfer";
import type {
  Notification,
  NotificationFilters,
  PaginatedNotifications,
} from "@/types/notification";
import type {
  IndianKycEncryptedPayload,
  IndianKycResponse,
  PublicKeyResponse,
} from "@/types/indian-kyc";
import type { WebPushRegistrationPayload, WebPushDevice } from "@/types/web-push";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, extras?: { code?: string; details?: unknown }) {
    super(message);
    this.status = status;
    this.code = extras?.code;
    this.details = extras?.details;
    this.name = "ApiError";
  }
}

let tokenGetter: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  tokenGetter = fn;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

function idempotencyHeaders(key?: string): { "idempotency-key": string } {
  return { "idempotency-key": key ?? generateIdempotencyKey() };
}

const SAFE_ERROR_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your details and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: "This request conflicts with an existing record.",
  422: "Some of the information you entered isn't valid.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our end. Please try again shortly.",
  502: "Service temporarily unavailable. Please try again shortly.",
  503: "Service temporarily unavailable. Please try again shortly.",
};

function safeErrorMessage(status: number): string {
  if (SAFE_ERROR_MESSAGES[status]) return SAFE_ERROR_MESSAGES[status];
  if (status >= 500) return SAFE_ERROR_MESSAGES[500];
  if (status >= 400) return SAFE_ERROR_MESSAGES[400];
  return "An unexpected error occurred. Please try again.";
}

// Request interceptor: attach auth token + correlation id
api.interceptors.request.use(async (config) => {
  config.headers["x-request-id"] = generateIdempotencyKey();
  if (tokenGetter) {
    const token = await tokenGetter();
    if (token) {
      config.headers["x-auth-token"] = token;
    }
  }
  return config;
});

// Response interceptor: unwrap ApiResponse envelope.
// The `as any` is required because Axios interceptors that transform responses
// cannot be modeled in TypeScript — the caller-side return types on each API
// function below are the actual source of truth.
api.interceptors.response.use(
  (response) => {
    const body: ApiResponse<unknown> = response.data;
    if (!body.success) {
      throw new ApiError(response.status, safeErrorMessage(response.status), {
        code: body.code,
        details: body.data,
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return body.data as any; // nosemgrep: github.no-explicit-any-cast — Axios interceptor return type requires `any`; caller-side Promise<T> types are the source of truth
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const body = error.response.data as ApiResponse<unknown> | undefined;
      logger.error("API request failed", {
        status: error.response.status,
        code: body?.code,
        url: error.config?.url,
      });
      throw new ApiError(error.response.status, safeErrorMessage(error.response.status), {
        code: body?.code,
        details: body?.data,
      });
    }
    logger.error("Unexpected API error", { error: String(error) });
    throw error;
  },
);

// ── Users ──
export const createUser = (data: CreateUserPayload): Promise<User> => api.post("/users", data);

export const updateMe = (data: UpdateUserPayload): Promise<User> => api.put("/users/me", data);

// ── Account ──
export const getAccount = (): Promise<Account> => api.get("/account");

// ── Addresses ──
export const createAddress = (data: CreateAddressPayload): Promise<Address> =>
  api.post("/addresses", data);

export const getAddresses = (): Promise<Address[]> => api.get("/addresses");

export const getAddress = (id: string): Promise<Address> => api.get(`/addresses/${id}`);

export const updateAddress = (id: string, data: UpdateAddressPayload): Promise<Address> =>
  api.put(`/addresses/${id}`, data);

export const deleteAddress = (id: string): Promise<void> => api.delete(`/addresses/${id}`);

// ── Referral ──
export const validateReferralCode = (code: string): Promise<{ valid: boolean }> =>
  api.post("/referral/validate", { code });

export const reserveReferralCode = (code: string): Promise<{ reserved: boolean }> =>
  api.post("/referral/reserve", { code });

// ── Onboarding ──
export const submitOnboardingAddress = (data: OnboardingAddressPayload): Promise<void> =>
  api.post("/onboarding/address", data);

export const requestOnboardingKyc = (): Promise<{ message: string }> => api.post("/onboarding/kyc");

// ── Zynk (KYC) ──
export const createZynkEntity = (idempotencyKey?: string): Promise<User> =>
  api.post("/zynk/entities", undefined, {
    headers: idempotencyHeaders(idempotencyKey),
  });

export const startKyc = (): Promise<ZynkKycData> => api.post("/zynk/kyc");

// ── Zynk (Plaid) ──
export const generatePlaidLinkToken = (): Promise<PlaidLinkToken> =>
  api.post("/zynk/plaid-link-token");

// ── Zynk (External Account) ──
export const addExternalAccount = (
  data: AddExternalAccountPayload,
  idempotencyKey?: string,
): Promise<User> =>
  api.post("/zynk/external-account", data, {
    headers: idempotencyHeaders(idempotencyKey),
  });

// ── Zynk (Deposit Account) ──
export const addDepositAccount = (
  data: AddDepositAccountPayload,
  idempotencyKey?: string,
): Promise<User> =>
  api.post("/zynk/deposit-account", data, {
    headers: idempotencyHeaders(idempotencyKey),
  });

// ── Activity ──
export const getActivities = (params?: ActivityQueryParams): Promise<ActivityListResponse> =>
  api.get("/activity", { params });

export const getActivity = (id: string): Promise<Activity> => api.get(`/activity/${id}`);

// ── Recipients ──
export const getRecipients = (): Promise<Recipient[]> => api.get("/recipients");

export const getRecipient = (id: string): Promise<Recipient> => api.get(`/recipients/${id}`);

export const createRecipient = (
  data: CreateRecipientPayload,
  idempotencyKey?: string,
): Promise<Recipient> =>
  api.post("/recipients", data, {
    headers: idempotencyHeaders(idempotencyKey),
  });

export const updateRecipient = (id: string, data: CreateRecipientPayload): Promise<Recipient> =>
  api.patch(`/recipients/${id}`, data);

export const addRecipientBank = (
  id: string,
  data: AddRecipientBankPayload,
  idempotencyKey?: string,
): Promise<Recipient> =>
  api.post(`/recipients/${id}/bank`, data, {
    headers: idempotencyHeaders(idempotencyKey),
  });

export const listRecipientBanks = (id: string): Promise<BankDetails[]> =>
  api.get(`/recipients/${id}/banks`);

export const updateRecipientBank = (
  recipientId: string,
  bankId: string,
  data: UpdateRecipientBankPayload,
): Promise<BankDetails> => api.patch(`/recipients/${recipientId}/banks/${bankId}`, data);

export const setDefaultRecipientBank = (
  recipientId: string,
  bankId: string,
): Promise<BankDetails> => api.post(`/recipients/${recipientId}/banks/${bankId}/default`);

export const deleteRecipientBank = (recipientId: string, bankId: string): Promise<void> =>
  api.delete(`/recipients/${recipientId}/banks/${bankId}`);

export const unlinkRecipient = (id: string): Promise<void> => api.delete(`/recipients/${id}`);

export const checkRecipientIdentity = (data: CheckIdentityPayload): Promise<CheckIdentityResult> =>
  api.post("/recipients/check-identity", data);

export const resendRecipientKyc = (id: string): Promise<void> =>
  api.post(`/recipients/${id}/resend-kyc`);

// ── User's own banks (polymorphic BankDetails, ownerType=USER) ──
export const listMyBanks = (): Promise<BankDetails[]> => api.get("/banks");

export const addMyBank = (
  data: AddRecipientBankPayload,
  idempotencyKey?: string,
): Promise<BankDetails> =>
  api.post("/banks", data, {
    headers: idempotencyHeaders(idempotencyKey),
  });

export const updateMyBank = (
  bankId: string,
  data: UpdateRecipientBankPayload,
): Promise<BankDetails> => api.patch(`/banks/${bankId}`, data);

export const setDefaultMyBank = (bankId: string): Promise<BankDetails> =>
  api.post(`/banks/${bankId}/default`);

export const deleteMyBank = (bankId: string): Promise<void> => api.delete(`/banks/${bankId}`);

// ── Transfers ──
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

// ── Notifications ──
export const getNotifications = (
  params: NotificationFilters = {},
): Promise<PaginatedNotifications> => api.get("/notifications", { params });

export const getUnreadCount = (): Promise<{ count: number }> =>
  api.get("/notifications/unread-count");

export const markNotificationAsRead = (id: string): Promise<Notification> =>
  api.patch(`/notifications/${id}/read`);

export const markAllNotificationsAsRead = (): Promise<void> => api.patch("/notifications/read-all");

export const deleteNotification = (id: string): Promise<void> => api.delete(`/notifications/${id}`);

// ── Crypto ──
export const getPublicKey = (): Promise<PublicKeyResponse> => api.get("/crypto/public-key");

// ── Email availability ──
// Public endpoint — used by the sign-up form before calling Clerk so a
// duplicate email is caught before an unrecoverable Clerk account is
// created.
export const checkUserEmailAvailable = (email: string): Promise<{ available: boolean }> =>
  api.get("/check-email", { params: { email } });

// Authed — used by the recipient form; scope is per-user.
export const checkRecipientEmailAvailable = (email: string): Promise<{ available: boolean }> =>
  api.get("/recipients/check-email", { params: { email } });

// ── Zynk (Indian KYC) ──
export const submitIndianKycEncrypted = (
  data: IndianKycEncryptedPayload,
): Promise<IndianKycResponse> => api.post("/zynk/indian-kyc", data);

// ── Web Push Devices ──
// NOTE: the server must expose POST /devices/register-web-push and
// DELETE /devices/:id accepting the payload shapes defined in
// types/web-push.ts. Until that lands, these calls will 404.
export const registerWebPushDevice = (data: WebPushRegistrationPayload): Promise<WebPushDevice> =>
  api.post("/devices/register-web-push", data);

export const unregisterDevice = (id: string): Promise<void> => api.delete(`/devices/${id}`);
