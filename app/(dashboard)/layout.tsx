"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Home, Clock3, CircleUser } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarAccountDropdown } from "@/components/sidebar-account-dropdown";
import { useAccount } from "@/hooks/api";
import { ApiError } from "@/services/api";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/activity", label: "Activity", icon: Clock3 },
  { href: "/account", label: "Account", icon: CircleUser },
];

function isTabActive(tabHref: string, pathname: string) {
  return tabHref === "/" ? pathname === "/" : pathname.startsWith(tabHref);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { data: account, isLoading: accountLoading, error } = useAccount();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || accountLoading) return;

    const noProfile = error instanceof ApiError && error.status === 404;
    const needsProfileInfo =
      account?.user &&
      (!account.user.firstName ||
        !account.user.lastName ||
        !account.user.phoneNumber ||
        !account.user.dateOfBirth);

    // If no user in DB or missing required profile fields, redirect to edit-profile
    if (noProfile || needsProfileInfo) {
      if (pathname !== "/edit-profile") {
        router.replace("/edit-profile");
      }
      return;
    }

    // Block edit-addresses if user has no profile
    if (pathname === "/edit-addresses" && !account?.user) {
      router.replace("/edit-profile");
    }
  }, [isLoaded, isSignedIn, accountLoading, error, account, pathname, router]);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  // Show nothing while redirecting to edit-profile or edit-addresses
  if (accountLoading) {
    return null;
  }

  const noProfile = error instanceof ApiError && error.status === 404;
  const needsProfileInfo =
    account?.user &&
    (!account.user.firstName ||
      !account.user.lastName ||
      !account.user.phoneNumber ||
      !account.user.dateOfBirth);

  if ((noProfile || needsProfileInfo) && pathname !== "/edit-profile") {
    return null;
  }

  if (pathname === "/edit-addresses" && !account?.user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col sticky top-0 h-screen border-r bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
          <Image src="/logo.png" alt="Logo" width={32} height={27} />
        </div>

        <nav className="flex-1 pt-2">
          {tabs.map((tab) => {
            const active = isTabActive(tab.href, pathname);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <SidebarAccountDropdown />
        </div>
      </aside>

      <main className="min-w-0 flex-1 flex flex-col">
        <div className="mx-auto flex flex-1 flex-col max-w-3xl lg:max-w-5xl w-full px-4 py-8">
          {children}
        </div>
      </main>

      {/* Bottom tab bar — mobile only */}
      <nav className="sticky bottom-0 border-t bg-background lg:hidden">
        <div className="mx-auto flex max-w-3xl">
          {tabs.map((tab) => {
            const active = isTabActive(tab.href, pathname);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
