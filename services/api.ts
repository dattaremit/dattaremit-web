// Barrel facade for the API layer. Each domain lives in its own module (SRP);
// this file simply re-exports them so callers can keep importing from
// "@/services/api". Prefer importing from the specific domain module in new
// code (e.g. "@/services/recipients").
export { ApiError, setTokenGetter } from "./http-client";
export * from "./users";
export * from "./account";
export * from "./addresses";
export * from "./google-maps";
export * from "./referral";
export * from "./onboarding";
export * from "./zynk";
export * from "./nre";
export * from "./activity";
export * from "./recipients";
export * from "./banks";
export * from "./transfers";
export * from "./notifications";
export * from "./email";
export * from "./devices";
export * from "./support";
