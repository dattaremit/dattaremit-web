"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Home, Clock3, CircleUser, Send, Users, Bell, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarAccountDropdown } from "@/components/sidebar-account-dropdown";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useAccount } from "@/hooks/api";
import { ApiError } from "@/services/api";
import { computeOnboardingState, ONBOARDING_STEPS } from "@/lib/onboarding-progress";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/send", label: "Send", icon: Send },
  { href: "/recipients", label: "Recipients", icon: Users },
  { href: "/activity", label: "Activity", icon: Clock3 },
  { href: "/notifications", label: "Alerts", icon: Bell },
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

  // Auth gate
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/welcome");
    }
  }, [isLoaded, isSignedIn, router]);

  // Onboarding gate: any incomplete step → bounce to /onboarding/*
  const noProfile = error instanceof ApiError && error.status === 404;
  const onboardingState = computeOnboardingState(noProfile ? null : account);
  const needsOnboarding = onboardingState.nextStep !== null;

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (accountLoading) return;
    if (error && !noProfile) return;
    if (needsOnboarding) {
      const target = ONBOARDING_STEPS.find(
        (s) => s.key === onboardingState.nextStep,
      )!.href;
      router.replace(target);
    }
  }, [
    isLoaded,
    isSignedIn,
    accountLoading,
    error,
    noProfile,
    needsOnboarding,
    onboardingState.nextStep,
    router,
  ]);

  if (!isLoaded || !isSignedIn || accountLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !noProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "We couldn't load your account."}
          </p>
        </div>
      </div>
    );
  }

  if (needsOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
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
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
        <header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-2 border-b bg-background/80 px-4 backdrop-blur lg:hidden">
          <NotificationBell />
        </header>
        <div className="hidden lg:flex items-center justify-end px-6 pt-4">
          <NotificationBell />
        </div>
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
                    : "text-muted-foreground hover:text-foreground",
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
