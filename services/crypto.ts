import { api } from "./http-client";
import type { PublicKeyResponse } from "@/types/indian-kyc";

export const getPublicKey = (): Promise<PublicKeyResponse> => api.get("/crypto/public-key");
