"use client";

import { useEffect, useRef } from "react";
import { useAppSignOut } from "@/hooks/use-app-sign-out";

const DEFAULT_IDLE_MS = 10 * 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "pointerdown", "touchstart", "scroll"] as const;
const CHANNEL_NAME = "idle-logout";

type IdleMessage = { type: "activity" } | { type: "logout" };

/**
 * Signs the user out after `idleMs` of no interaction. Peer tabs coordinate
 * via BroadcastChannel so that activity in any tab resets all tabs, and a
 * logout in one tab signs out everywhere.
 */
export function useIdleLogout(idleMs: number = DEFAULT_IDLE_MS) {
  const signOut = useAppSignOut();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel(CHANNEL_NAME)
        : null;

    const armTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        channel?.postMessage({ type: "logout" } satisfies IdleMessage);
        void signOut();
      }, idleMs);
    };

    const onLocalActivity = () => {
      armTimer();
      channel?.postMessage({ type: "activity" } satisfies IdleMessage);
    };

    const onPeerMessage = (event: MessageEvent<IdleMessage>) => {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "activity") {
        armTimer();
      } else if (msg.type === "logout") {
        if (timerRef.current) clearTimeout(timerRef.current);
        void signOut();
      }
    };

    armTimer();
    ACTIVITY_EVENTS.forEach((ev) =>
      window.addEventListener(ev, onLocalActivity, { passive: true }),
    );
    channel?.addEventListener("message", onPeerMessage);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((ev) =>
        window.removeEventListener(ev, onLocalActivity),
      );
      channel?.removeEventListener("message", onPeerMessage);
      channel?.close();
    };
  }, [idleMs, signOut]);
}
