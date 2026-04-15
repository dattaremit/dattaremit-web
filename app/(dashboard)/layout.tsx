"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Clock3,
  CircleUser,
  Send,
  Users,
  Bell,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarAccountDropdown } from "@/components/sidebar-account-dropdown";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useAccount } from "@/hooks/api";
import { ApiError } from "@/services/api";
import { computeOnboardingState, stepHref } from "@/lib/onboarding-progress";

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

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="relative flex size-12 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand/30" />
        <span className="relative size-2 rounded-full bg-brand" />
      </div>
    </div>
  );
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
    if (isLoaded && !isSignedIn) {
      router.replace("/welcome");
    }
  }, [isLoaded, isSignedIn, router]);

  const noProfile = error instanceof ApiError && error.status === 404;
  const onboardingState = computeOnboardingState(noProfile ? null : account);
  const needsOnboarding = onboardingState.nextStep !== null;

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (accountLoading) return;
    if (error && !noProfile) return;
    if (needsOnboarding && onboardingState.nextStep) {
      router.replace(stepHref(onboardingState.nextStep));
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
    return <FullScreenLoader />;
  }

  if (error && !noProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md space-y-2 text-center">
          <Loader2 className="mx-auto size-5 text-muted-foreground" />
          <h2 className="font-semibold text-2xl text-foreground">
            Couldn&apos;t load your account
          </h2>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Please try again in a moment."}
          </p>
        </div>
      </div>
    );
  }

  if (needsOnboarding) {
    return <FullScreenLoader />;
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background lg:flex-row">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[40vh] opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, oklch(from var(--brand) l c h / 0.08), transparent 70%)",
        }}
      />

      <aside className="sticky top-0 z-20 hidden h-screen w-72 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-20 items-center gap-2.5 px-7">
          <Image src="/logo.png" alt="Dattapay" width={28} height={24} />
          <span className="font-semibold text-xl text-sidebar-foreground">
            Dattapay
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
          <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-sidebar-foreground/40">
            Workspace
          </p>
          <ul className="flex flex-col gap-0.5">
            {tabs.map((tab) => {
              const active = isTabActive(tab.href, pathname);
              const Icon = tab.icon;
              return (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand" />
                    )}
                    <Icon className="size-[18px] shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <SidebarAccountDropdown />
        </div>
      </aside>

      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/70 px-5 backdrop-blur-xl lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Dattapay" width={24} height={20} />
            <span className="font-semibold text-lg">Dattapay</span>
          </Link>
          <NotificationBell />
        </header>

        <div className="hidden items-center justify-end gap-2 px-8 pt-6 lg:flex">
          <NotificationBell />
        </div>

        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-8 sm:px-8 lg:py-10">
          {children}
        </div>
      </main>

      <nav
        aria-label="Primary"
        className="sticky bottom-0 z-20 border-t border-border bg-background/85 backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto grid max-w-2xl grid-cols-6">
          {tabs.map((tab) => {
            const active = isTabActive(tab.href, pathname);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "group relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-b-full bg-brand" />
                )}
                <Icon
                  className={cn(
                    "size-5 transition-transform",
                    active && "scale-110",
                  )}
                />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
