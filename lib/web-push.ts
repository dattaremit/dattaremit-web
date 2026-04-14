/**
 * Web push subscribe/unsubscribe helpers.
 *
 * Requires `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — the application server's VAPID
 * public key, base64url-encoded (matching the private key held on the server).
 * Generate with: `npx web-push generate-vapid-keys`.
 */

const SERVICE_WORKER_PATH = "/sw.js";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported in this browser.");
  }
  const existing = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_PATH);
  if (existing) return existing;
  return navigator.serviceWorker.register(SERVICE_WORKER_PATH, { scope: "/" });
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration(SERVICE_WORKER_PATH);
  if (!reg) return null;
  return reg.pushManager.getSubscription();
}

export async function subscribePush(): Promise<PushSubscription> {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new Error(
      "NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set — push cannot be enabled.",
    );
  }

  const registration = await registerServiceWorker();
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey.buffer.slice(
      applicationServerKey.byteOffset,
      applicationServerKey.byteOffset + applicationServerKey.byteLength,
    ) as ArrayBuffer,
  });
}

export async function unsubscribePush(): Promise<boolean> {
  const existing = await getExistingSubscription();
  if (!existing) return true;
  return existing.unsubscribe();
}
