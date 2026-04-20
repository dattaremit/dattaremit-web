"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  getExistingSubscription,
  isPushSupported,
  requestNotificationPermission,
  subscribePush,
  unsubscribePush,
} from "@/lib/web-push";
import {
  registerWebPushDevice,
  unregisterDevice,
} from "@/services/api";
import { STORAGE_KEYS } from "@/constants/storage-keys";

type Status = "unsupported" | "blocked" | "disabled" | "enabled";

const DEVICE_ID_KEY = STORAGE_KEYS.WEB_PUSH_DEVICE_ID;

function subscriptionToPayload(sub: PushSubscription) {
  const json = sub.toJSON();
  return {
    platform: "WEB" as const,
    deviceName:
      typeof navigator !== "undefined"
        ? navigator.userAgent.slice(0, 120)
        : undefined,
    subscription: {
      endpoint: json.endpoint!,
      keys: {
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
      },
    },
  };
}

export function useWebPush() {
  const { isSignedIn } = useAuth();
  const [status, setStatus] = useState<Status>("disabled");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isPushSupported()) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("blocked");
      return;
    }
    const existing = await getExistingSubscription();
    setStatus(existing ? "enabled" : "disabled");
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const enable = useCallback(async () => {
    if (!isSignedIn) {
      setError("Sign in before enabling notifications.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const perm = await requestNotificationPermission();
      if (perm !== "granted") {
        setStatus(perm === "denied" ? "blocked" : "disabled");
        return;
      }
      const sub = await subscribePush();
      const device = await registerWebPushDevice(subscriptionToPayload(sub));
      window.localStorage.setItem(DEVICE_ID_KEY, device.id);
      setStatus("enabled");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enable push.");
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  const disable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const deviceId = window.localStorage.getItem(DEVICE_ID_KEY);
      await unsubscribePush();
      if (deviceId) {
        try {
          await unregisterDevice(deviceId);
        } catch {
          // server may already have purged the device; continue
        }
        window.localStorage.removeItem(DEVICE_ID_KEY);
      }
      setStatus("disabled");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable push.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { status, loading, error, enable, disable, refresh };
}
