"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LifeBuoy } from "lucide-react";
import { ROUTES } from "@/constants/routes";

/**
 * Floating "Contact support" button, pinned to the bottom-right on every
 * dashboard page. Sits above the mobile tab bar on small screens. Hidden on the
 * support page itself.
 */
export function SupportFab() {
  const pathname = usePathname();
  if (pathname.startsWith(ROUTES.SUPPORT)) return null;

  return (
    <Link
      href={ROUTES.SUPPORT}
      aria-label="Contact support"
      title="Contact support"
      className="group fixed bottom-20 right-5 z-30 flex h-13 w-13 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30 transition-transform hover:scale-105 active:scale-95 lg:bottom-6 lg:right-6"
    >
      <LifeBuoy className="size-6" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 transition-opacity group-hover:opacity-100 lg:block">
        Contact support
      </span>
    </Link>
  );
}
