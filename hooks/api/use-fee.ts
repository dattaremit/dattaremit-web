"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRegularFee, getNreFee, ApiError } from "@/services/api";
import { queryKeys } from "@/constants/query-keys";

const DEBOUNCE_MS = 300;
// Mirror of the amount shape the server accepts; this just gates the request so
// we don't fire one per keystroke or for half-typed values like "12.".
const AMOUNT_SHAPE = /^\d+(\.\d{1,2})?$/;

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Parse a user-entered USD string to a positive number, or null if it's empty
 *  / malformed. Null disables the query so we never request a bad amount. */
function parseAmount(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed || !AMOUNT_SHAPE.test(trimmed)) return null;
  const n = parseFloat(trimmed);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

// 4xx (e.g. amount out of range) are not worth retrying; one retry otherwise.
function feeRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 1;
}

/**
 * Server-computed receive amount for a regular transfer of the given USD
 * amount. Debounced as the user types; the query stays idle until the amount
 * is a valid positive number and `enabled` is true (callers gate it on the
 * field being error-free).
 */
export function useRegularFee(amount: string, enabled = true) {
  const debounced = useDebounced(amount.trim(), DEBOUNCE_MS);
  const parsed = parseAmount(debounced);
  return useQuery({
    queryKey: queryKeys.fee.regular(parsed ?? 0),
    queryFn: () => getRegularFee(parsed as number),
    enabled: enabled && parsed !== null,
    retry: feeRetry,
    staleTime: 60_000,
  });
}

/**
 * Server-computed receive amount and NRE fee for an NRE self-transfer of the
 * given USD amount. Same debounce/validation gating as {@link useRegularFee}.
 */
export function useNreFee(amount: string, enabled = true) {
  const debounced = useDebounced(amount.trim(), DEBOUNCE_MS);
  const parsed = parseAmount(debounced);
  return useQuery({
    queryKey: queryKeys.fee.nre(parsed ?? 0),
    queryFn: () => getNreFee(parsed as number),
    enabled: enabled && parsed !== null,
    retry: feeRetry,
    staleTime: 60_000,
  });
}
