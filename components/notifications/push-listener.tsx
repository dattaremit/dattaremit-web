"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { showBanner } from "@/store/notification-banner-store";

interface PushMessage {
  type: "DATTAREMIT_PUSH";
  payload: {
    title: string;
    body: string;
    type?: string;
    data?: Record<string, string>;
  };
}

/**
 * Listens for messages posted from the push service worker and routes them
 * to the in-app banner store. Mount once inside Providers.
 */
export function PushListener() {
  const qc = useQueryClient();

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    const onMessage = (event: MessageEvent<PushMessage>) => {
      if (event.data?.type !== "DATTAREMIT_PUSH") return;
      const { title, body, type, data } = event.data.payload;
      showBanner({ title, body, type, data });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, [qc]);

  return null;
}
