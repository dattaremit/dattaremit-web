import { api } from "./http-client";
import type { User, CreateUserPayload, UpdateUserPayload } from "@/types/api";

export const createUser = (data: CreateUserPayload): Promise<User> => api.post("/users", data);

export const updateMe = (data: UpdateUserPayload): Promise<User> => api.put("/users/me", data);
