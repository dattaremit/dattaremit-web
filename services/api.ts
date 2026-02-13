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
} from "@/types/api";

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
