"use client";

import { useEffect } from "react";
import { playKeySound, preloadKeySound } from "@/lib/key-sound";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    preloadKeySound();

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const isClickable = target.closest("button, a, [role='button'], [role='menuitem']");

      if (isClickable) {
        playKeySound();
      }
    };

    // Use capture phase to catch the event early
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return <>{children}</>;
}
