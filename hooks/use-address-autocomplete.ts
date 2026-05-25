import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addressAutocomplete, getAddressPlaceDetails, ApiError } from "@/services/api";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { queryKeys } from "@/constants/query-keys";
import type { AddressComponents, AutocompletePrediction } from "@/types/address";

const MIN_INPUT_LENGTH = 3;
const DEBOUNCE_MS = 300;

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

interface Options {
  /** ISO country code to scope predictions to (e.g. "US"). */
  country?: string;
  /** When false, no requests are made (e.g. country isn't supported). */
  enabled?: boolean;
}

/**
 * Google Places autocomplete for a single street-address field, backed by the
 * server's `/google-maps/*` endpoints (the API key stays server-side).
 *
 * Reuses one session token across the autocomplete keystrokes and the final
 * place-details lookup (Google bills these as one session), then rotates it.
 */
export function useAddressAutocomplete({ country, enabled = true }: Options = {}) {
  const [query, setQueryState] = useState("");
  const [sessionToken, setSessionToken] = useState(() => generateIdempotencyKey());
  // Suppress searching immediately after a selection so the dropdown doesn't
  // re-fire a request with the just-picked text before it debounces away.
  const [suppressed, setSuppressed] = useState(false);

  const debounced = useDebounced(query, DEBOUNCE_MS);
  const trimmed = debounced.trim();
  const canSearch = enabled && !suppressed && trimmed.length >= MIN_INPUT_LENGTH;

  const suggestionsQuery = useQuery({
    queryKey: queryKeys.addressAutocomplete(sessionToken, trimmed.toLowerCase()),
    queryFn: () => addressAutocomplete({ input: trimmed, country, sessionToken, types: "address" }),
    enabled: canSearch,
    staleTime: 30_000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
      return failureCount < 1;
    },
  });

  const setQuery = useCallback((text: string) => {
    setSuppressed(false);
    setQueryState(text);
  }, []);

  const selectPrediction = useCallback(
    async (prediction: AutocompletePrediction): Promise<AddressComponents | null> => {
      const token = sessionToken;
      setSuppressed(true);
      setQueryState("");
      setSessionToken(generateIdempotencyKey());
      try {
        return await getAddressPlaceDetails(prediction.placeId, token);
      } catch {
        return null;
      }
    },
    [sessionToken],
  );

  return {
    setQuery,
    suggestions: canSearch ? (suggestionsQuery.data ?? []) : [],
    isSearching: canSearch && suggestionsQuery.isFetching,
    selectPrediction,
  };
}
