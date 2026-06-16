import axios from "axios";
import * as Sentry from "@sentry/nextjs";
import { generateIdempotencyKey } from "@/lib/idempotency";
import type { ApiResponse } from "@/types/api";

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

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export function idempotencyHeaders(key?: string): { "idempotency-key": string } {
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
      const status = error.response.status;
      const method = error.config?.method?.toUpperCase() ?? "UNKNOWN";
      const url = error.config?.url ?? "unknown";
      const requestId = (error.config?.headers?.["x-request-id"] as string | undefined) ?? "";
      const apiError = new ApiError(status, safeErrorMessage(status), {
        code: body?.code,
        details: body?.data,
      });
      Sentry.logger.error("API request failed", {
        status,
        code: body?.code,
        url,
        method,
        request_id: requestId,
      });
      Sentry.captureException(apiError, {
        level: "error",
        tags: {
          "http.method": method,
          "http.url": url,
          "http.status_code": String(status),
          ...(body?.code ? { "http.code": body.code } : {}),
          ...(requestId ? { request_id: requestId } : {}),
        },
        contexts: {
          http: {
            method,
            url,
            status_code: status,
            request_id: requestId || undefined,
          },
        },
      });
      throw apiError;
    }
    const method = axios.isAxiosError(error) ? error.config?.method?.toUpperCase() : undefined;
    const url = axios.isAxiosError(error) ? error.config?.url : undefined;
    Sentry.logger.error("Unexpected API error", {
      error: String(error),
      method,
      url,
      network_error: true,
    });
    Sentry.captureException(error, {
      level: "error",
      tags: {
        network_error: "true",
        ...(method ? { "http.method": method } : {}),
        ...(url ? { "http.url": url } : {}),
      },
    });
    throw error;
  },
);
