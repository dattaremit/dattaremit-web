import { api } from "./http-client";
import type { Account } from "@/types/api";

export const getAccount = (): Promise<Account> => api.get("/account");
