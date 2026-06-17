import { ApiError } from "@/services/http-client";

// Raw axios/network/runtime text that must NEVER reach the user.
const RAW_ERROR_MESSAGE_BLOCKLIST = [
  /^Request failed with status code/i,
  /^Network Error$/i,
  /^timeout of \d+ms exceeded$/i,
  /AxiosError/,
  /ECONN/,
  /ENOTFOUND/,
  /ETIMEDOUT/,
];

// Payment-provider internals are invisible to end users — if a server-authored
// message ever mentions one, fall back to the generic copy instead of leaking it.
const PROVIDER_TERM_BLOCKLIST =
  /\b(zynk|credible|onmeta|dcx|usdc|wallet|on-?chain|penny[- ]?drop|imps|neft)\b/i;

function isLikelyHumanMessage(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (value.length === 0 || value.length > 300) return false;
  if (RAW_ERROR_MESSAGE_BLOCKLIST.some((re) => re.test(value))) return false;
  if (PROVIDER_TERM_BLOCKLIST.test(value)) return false;
  return true;
}

/**
 * Returns the server-authored message from an {@link ApiError} when it is a
 * safe, human-readable string, otherwise the given fallback.
 *
 * Use this only for flows where the server intentionally returns an actionable
 * message the user should read (e.g. bank-account validation failures). The
 * default `ApiError.message` remains a generic status-based string, so most
 * call sites should keep using that.
 */
export function getServerErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError && isLikelyHumanMessage(err.serverMessage)) {
    return err.serverMessage;
  }
  return fallback;
}
