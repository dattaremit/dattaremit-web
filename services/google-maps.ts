import { api } from "./http-client";
import type { AutocompletePrediction, AddressComponents } from "@/types/address";

export const addressAutocomplete = (params: {
  input: string;
  country?: string;
  sessionToken?: string;
  city?: string;
  state?: string;
  types?: string;
}): Promise<AutocompletePrediction[]> => api.get("/google-maps/autocomplete", { params });

export const getAddressPlaceDetails = (
  placeId: string,
  sessionToken?: string,
): Promise<AddressComponents> =>
  api.get("/google-maps/place-details", { params: { placeId, sessionToken } });
