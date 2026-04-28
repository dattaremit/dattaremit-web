"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

import { useAccount } from "@/hooks/api";
import { ApiError } from "@/services/api";
import {
  computeOnboardingState,
  stepHref,
  stepIndex,
  type OnboardingStepKey,
  type IndicatorStepKey,
} from "@/lib/onboarding-progress";
import { ROUTES } from "@/constants/routes";
import { EASE_OUT_SMOOTH } from "@/constants/motion";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { AccountMenu } from "@/components/account-menu";

const STEP_FROM_PATH: Record<string, OnboardingStepKey> = {
  [ROUTES.ONBOARDING.REFERRAL]: "referral",
  [ROUTES.ONBOARDING.PROFILE]: "profile",
  [ROUTES.ONBOARDING.ADDRESS]: "address",
};

const INDICATOR_STEPS: IndicatorStepKey[] = ["profile", "address"];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const { data: account, isLoading, error } = useAccount();

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

    // Gate users before step-based routing: blocklist wins, then waitlist.
    if (isBlocked) {
      if (pathname !== ROUTES.ONBOARDING.BLOCKED) router.replace(ROUTES.ONBOARDING.BLOCKED);
      return;
    }
    if (isOnWaitlist) {
      if (pathname !== ROUTES.ONBOARDING.WAITLIST) router.replace(ROUTES.ONBOARDING.WAITLIST);
      return;
    }

    // Off the gated paths — if we were on waitlist/blocked but the flag
    // cleared (e.g. admin removed the block), bounce back to the normal flow.
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

    // Referral is optional — allow advancing past it without being sent back.
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
  const isIndicatorStep =
    !!stepKey && (INDICATOR_STEPS as OnboardingStepKey[]).includes(stepKey);
  const isGatedPath =
    pathname === ROUTES.ONBOARDING.WAITLIST ||
    pathname === ROUTES.ONBOARDING.BLOCKED ||
    pathname === ROUTES.ONBOARDING.REFERRAL;

  if (!isLoaded || !isSignedIn || isLoading) {
    return <FullScreenLoader />;
  }

  // Gated pages render inside the same shell but without the step indicator.
  if (isGatedPath) {
    return (
      <div className="relative flex min-h-screen flex-col bg-background">
        <AuroraBackground variant="dashboard" />

        <header className="relative z-10 flex h-16 items-center justify-between border-b border-border/60 bg-background/70 px-5 backdrop-blur-xl sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Dattapay" width={26} height={22} />
            <span className="font-semibold text-lg text-foreground">
              Dattapay
            </span>
          </Link>
          <AccountMenu />
        </header>

        <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-10 sm:px-8 sm:py-16">
          <div className="w-full max-w-xl">
            <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-lift backdrop-blur-xl sm:p-12">
              {children}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!stepKey || !isIndicatorStep) {
    return <FullScreenLoader />;
  }

  const indicatorStep = stepKey as IndicatorStepKey;

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <AuroraBackground variant="dashboard" />

      <header className="relative z-10 flex h-16 items-center justify-between border-b border-border/60 bg-background/70 px-5 backdrop-blur-xl sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Dattapay" width={26} height={22} />
          <span className="font-semibold text-lg text-foreground">Dattapay</span>
        </Link>
        <AccountMenu />
      </header>

      <main className="relative z-10 flex flex-1 items-start justify-center px-5 py-10 sm:px-8 sm:py-16">
        <div className="w-full max-w-xl space-y-7">
          <StepIndicator current={indicatorStep} completed={state.completion} />
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE_OUT_SMOOTH }}
              className="rounded-3xl border border-border bg-card/80 p-6 shadow-lift backdrop-blur-xl sm:p-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
