"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { useAccount } from "@/hooks/api";
import { ApiError } from "@/services/api";
import {
  computeOnboardingState,
  stepHref,
  stepIndex,
  type OnboardingStepKey,
} from "@/lib/onboarding-progress";
import { ROUTES } from "@/constants/routes";
import { EASE_OUT_SMOOTH } from "@/constants/motion";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { HeroPanel } from "@/components/ui/hero-panel";
import { AuthLogo } from "@/components/ui/auth-logo";
import { useAppSignOut } from "@/hooks/use-app-sign-out";

const STEP_FROM_PATH: Record<string, OnboardingStepKey> = {
  [ROUTES.ONBOARDING.REFERRAL]: "referral",
  [ROUTES.ONBOARDING.PROFILE]: "profile",
  [ROUTES.ONBOARDING.ADDRESS]: "address",
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const { data: account, isLoading, error } = useAccount();
  const signOut = useAppSignOut();

  const noProfile = error instanceof ApiError && error.status === 404;
  const state = computeOnboardingState(noProfile ? null : account);
  const isBlocked = !!account?.isBlocked;
  const isOnWaitlist = !!account?.isOnWaitlist;

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace(ROUTES.SIGN_IN);
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (isLoading) return;
    if (error && !noProfile) return;

    if (isBlocked) {
      if (pathname !== ROUTES.ONBOARDING.BLOCKED) router.replace(ROUTES.ONBOARDING.BLOCKED);
      return;
    }
    if (isOnWaitlist) {
      if (pathname !== ROUTES.ONBOARDING.WAITLIST) router.replace(ROUTES.ONBOARDING.WAITLIST);
      return;
    }

    if (pathname === ROUTES.ONBOARDING.WAITLIST || pathname === ROUTES.ONBOARDING.BLOCKED) {
      router.replace(state.nextStep ? stepHref(state.nextStep) : ROUTES.ROOT);
      return;
    }

    const currentStep = STEP_FROM_PATH[pathname];

    if (!state.nextStep) {
      router.replace(ROUTES.ROOT);
      return;
    }

    if (!currentStep) {
      router.replace(stepHref(state.nextStep));
      return;
    }

    if (state.nextStep === "referral" && currentStep === "profile") {
      return;
    }

    if (stepIndex(currentStep) > stepIndex(state.nextStep)) {
      router.replace(stepHref(state.nextStep));
    }
  }, [
    isLoaded,
    isSignedIn,
    isLoading,
    error,
    noProfile,
    state.nextStep,
    pathname,
    router,
    isBlocked,
    isOnWaitlist,
  ]);

  const stepKey = STEP_FROM_PATH[pathname];
  const isGatedPath =
    pathname === ROUTES.ONBOARDING.WAITLIST ||
    pathname === ROUTES.ONBOARDING.BLOCKED ||
    pathname === ROUTES.ONBOARDING.REFERRAL;

  if (!isLoaded || !isSignedIn || isLoading) {
    return <FullScreenLoader />;
  }

  if (!isGatedPath && !stepKey) {
    return <FullScreenLoader />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — form panel */}
      <div className="relative flex w-full flex-col lg:w-2/3">
        <AuroraBackground variant="auth" />

        <div className="relative z-10 flex h-16 shrink-0 items-center justify-end px-8">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>

        <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
          <div className="w-full max-w-xl">
            <div className="rounded-2xl border border-border/40 bg-card/70 shadow-lift backdrop-blur-md">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: EASE_OUT_SMOOTH }}
                  className="p-8 sm:p-10"
                >
                  <div className="mb-6">
                    <AuthLogo />
                  </div>
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      <HeroPanel />
    </div>
  );
}
