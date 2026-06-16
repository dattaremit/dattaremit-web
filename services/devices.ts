import { api } from "./http-client";
import type { WebPushRegistrationPayload, WebPushDevice } from "@/types/web-push";

// NOTE: the server must expose POST /devices/register-web-push and
// DELETE /devices/:id accepting the payload shapes defined in
// types/web-push.ts. Until that lands, these calls will 404.
export const registerWebPushDevice = (data: WebPushRegistrationPayload): Promise<WebPushDevice> =>
  api.post("/devices/register-web-push", data);

export const unregisterDevice = (id: string): Promise<void> => api.delete(`/devices/${id}`);
