import axios from "axios";
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
  CreateRecipientPayload,
  AddRecipientBankPayload,
} from "@/types/recipient";
import type {
  SendMoneyPayload,
  SendToSelfPayload,
  SendMoneyResponse,
} from "@/types/transfer";
import type {
  Notification,
  NotificationFilters,
  PaginatedNotifications,
} from "@/types/notification";
import type {
  IndianKycPayload,
  IndianKycEncryptedPayload,
  IndianKycResponse,
  PublicKeyResponse,
} from "@/types/indian-kyc";
import type {
  WebPushRegistrationPayload,
  WebPushDevice,
} from "@/types/web-push";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
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

// Request interceptor: attach auth token
api.interceptors.request.use(async (config) => {
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
      throw new ApiError(response.status, body.message || "Request failed");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return body.data as any;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const body = error.response.data as ApiResponse<unknown> | undefined;
      throw new ApiError(
        error.response.status,
        body?.message || error.message || "Request failed"
      );
    }
    throw error;
  }
);

// ── Users ──
export const createUser = (data: CreateUserPayload): Promise<User> =>
  api.post("/users", data);

export const updateMe = (data: UpdateUserPayload): Promise<User> =>
  api.put("/users/me", data);

// ── Account ──
export const getAccount = (): Promise<Account> => api.get("/account");

// ── Addresses ──
export const createAddress = (data: CreateAddressPayload): Promise<Address> =>
  api.post("/addresses", data);

export const getAddresses = (): Promise<Address[]> => api.get("/addresses");

export const getAddress = (id: string): Promise<Address> =>
  api.get(`/addresses/${id}`);

export const updateAddress = (
  id: string,
  data: UpdateAddressPayload
): Promise<Address> => api.put(`/addresses/${id}`, data);

export const deleteAddress = (id: string): Promise<void> =>
  api.delete(`/addresses/${id}`);

// ── Referral ──
export const validateReferralCode = (
  code: string
): Promise<{ valid: boolean }> => api.post("/referral/validate", { code });

// ── Onboarding ──
export const submitOnboardingAddress = (
  data: OnboardingAddressPayload
): Promise<void> => api.post("/onboarding/address", data);

export const requestOnboardingKyc = (): Promise<{ message: string }> =>
  api.post("/onboarding/kyc");

// ── Zynk (KYC) ──
export const createZynkEntity = (idempotencyKey?: string): Promise<User> =>
  api.post("/zynk/entities", undefined, {
    headers: idempotencyKey ? { "idempotency-key": idempotencyKey } : {},
  });

export const startKyc = (): Promise<ZynkKycData> =>
  api.post("/zynk/kyc");

// ── Zynk (Plaid) ──
export const generatePlaidLinkToken = (): Promise<PlaidLinkToken> =>
  api.post("/zynk/plaid-link-token");

// ── Zynk (External Account) ──
export const addExternalAccount = (
  data: AddExternalAccountPayload
): Promise<User> => api.post("/zynk/external-account", data);

// ── Zynk (Deposit Account) ──
export const addDepositAccount = (
  data: AddDepositAccountPayload
): Promise<User> => api.post("/zynk/deposit-account", data);

// ── Activity ──
export const getActivities = (
  params?: ActivityQueryParams
): Promise<ActivityListResponse> => api.get("/activity", { params });

export const getActivity = (id: string): Promise<Activity> =>
  api.get(`/activity/${id}`);

// ── Recipients ──
export const getRecipients = (): Promise<Recipient[]> => api.get("/recipients");

export const getRecipient = (id: string): Promise<Recipient> =>
  api.get(`/recipients/${id}`);

export const createRecipient = (
  data: CreateRecipientPayload
): Promise<Recipient> => api.post("/recipients", data);

export const updateRecipient = (
  id: string,
  data: CreateRecipientPayload
): Promise<Recipient> => api.patch(`/recipients/${id}`, data);

export const addRecipientBank = (
  id: string,
  data: AddRecipientBankPayload
): Promise<Recipient> => api.post(`/recipients/${id}/bank`, data);

export const resendRecipientKyc = (id: string): Promise<void> =>
  api.post(`/recipients/${id}/resend-kyc`);

// ── Transfers ──
export const sendMoney = (
  data: SendMoneyPayload,
  idempotencyKey?: string
): Promise<SendMoneyResponse> =>
  api.post("/transfers/send", data, {
    headers: idempotencyKey ? { "idempotency-key": idempotencyKey } : {},
  });

export const sendToSelf = (
  data: SendToSelfPayload,
  idempotencyKey?: string
): Promise<SendMoneyResponse> =>
  api.post("/transfers/send-to-self", data, {
    headers: idempotencyKey ? { "idempotency-key": idempotencyKey } : {},
  });

// ── Notifications ──
export const getNotifications = (
  params: NotificationFilters = {}
): Promise<PaginatedNotifications> => api.get("/notifications", { params });

export const getUnreadCount = (): Promise<{ count: number }> =>
  api.get("/notifications/unread-count");

export const markNotificationAsRead = (id: string): Promise<Notification> =>
  api.patch(`/notifications/${id}/read`);

export const markAllNotificationsAsRead = (): Promise<void> =>
  api.patch("/notifications/read-all");

export const deleteNotification = (id: string): Promise<void> =>
  api.delete(`/notifications/${id}`);

// ── Crypto ──
export const getPublicKey = (): Promise<PublicKeyResponse> =>
  api.get("/crypto/public-key");

// ── Zynk (Indian KYC) ──
// Plaintext variant — kept for dev/testing against plaintext endpoint. Prefer
// submitIndianKycEncrypted in production. Server accepts either shape.
export const submitIndianKyc = (
  data: IndianKycPayload
): Promise<IndianKycResponse> => api.post("/zynk/indian-kyc", data);

export const submitIndianKycEncrypted = (
  data: IndianKycEncryptedPayload
): Promise<IndianKycResponse> => api.post("/zynk/indian-kyc", data);

// ── Web Push Devices ──
// NOTE: the server must expose POST /devices/register-web-push and
// DELETE /devices/:id accepting the payload shapes defined in
// types/web-push.ts. Until that lands, these calls will 404.
export const registerWebPushDevice = (
  data: WebPushRegistrationPayload
): Promise<WebPushDevice> =>
  api.post("/devices/register-web-push", data);

export const unregisterDevice = (id: string): Promise<void> =>
  api.delete(`/devices/${id}`);
