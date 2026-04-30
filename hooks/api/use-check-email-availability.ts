import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { checkUserEmailAvailable, checkRecipientEmailAvailable, ApiError } from "@/services/api";
import { queryKeys } from "@/constants/query-keys";

type Scope = "user" | "recipient";

const DEBOUNCE_MS = 300;
// Simple regex — server does strict validation; this just gates the request.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/**
 * Checks if an email is available. Returns `null` while not yet determined
 * (empty input, invalid shape, or in-flight). The caller should treat `false`
 * as "taken" and block submission.
 */
export function useCheckEmailAvailability(email: string, scope: Scope) {
  const trimmed = email.trim();
  const debounced = useDebounced(trimmed, DEBOUNCE_MS);
  const looksValid = EMAIL_SHAPE.test(debounced);

  const query = useQuery({
    queryKey: queryKeys.emailCheck(scope, debounced.toLowerCase()),
    queryFn: () =>
      scope === "user"
        ? checkUserEmailAvailable(debounced)
        : checkRecipientEmailAvailable(debounced),
    enabled: looksValid,
    retry: (failureCount, error) => {
      // Rate-limit and 4xx are not worth retrying
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 1;
    },
    staleTime: 60_000,
  });

  return {
    available: query.data?.available ?? null,
    isChecking: looksValid && (query.isFetching || trimmed !== debounced),
    error: query.error,
  };
}
