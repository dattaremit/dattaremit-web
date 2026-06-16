import { api } from "./http-client";
import type { Address, CreateAddressPayload, UpdateAddressPayload } from "@/types/api";

export const createAddress = (data: CreateAddressPayload): Promise<Address> =>
  api.post("/addresses", data);

export const getAddresses = (): Promise<Address[]> => api.get("/addresses");

export const getAddress = (id: string): Promise<Address> => api.get(`/addresses/${id}`);

export const updateAddress = (id: string, data: UpdateAddressPayload): Promise<Address> =>
  api.put(`/addresses/${id}`, data);

export const deleteAddress = (id: string): Promise<void> => api.delete(`/addresses/${id}`);
