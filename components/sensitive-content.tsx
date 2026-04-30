"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Blurs its children when the tab loses visibility or focus. A lightweight
 * web equivalent of mobile's use-screen-capture-protection — not a hard
 * guarantee (screenshots still work) but hides sensitive fields from casual
 * shoulder-surfing when the user alt-tabs away.
 */
export function SensitiveContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === "hidden");
    const onBlur = () => setHidden(true);
    const onFocus = () => setHidden(document.visibilityState === "hidden");

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    onVisibility();
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <div
      className={cn("transition-[filter] duration-150", hidden && "blur-md select-none", className)}
    >
      {children}
    </div>
  );
}
