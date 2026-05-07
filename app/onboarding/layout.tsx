"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
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
} from "@/lib/onboarding-progress";
import { ROUTES } from "@/constants/routes";
import { EASE_OUT_SMOOTH } from "@/constants/motion";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";
import { AuroraBackground } from "@/components/ui/aurora-background";
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

        <div className="relative z-10 flex h-16 shrink-0 items-center justify-between px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Dattaremit" width={26} height={22} />
            <span className="font-semibold text-lg text-foreground">Dattaremit</span>
          </Link>
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
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* Right — hero image panel */}
      <div
        className="sticky top-0 hidden h-screen overflow-hidden lg:block lg:w-1/3"
        style={{ background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)" }}
      >
        <Image
          src="/auth.png"
          alt="Send money instantly with DattaRemit"
          fill
          className="object-contain object-bottom"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-6 pb-10 pt-16">
          <p className="text-4xl font-semibold leading-tight tracking-tight text-white">
            Send money home,
            <br />
            <span className="text-brand-soft">instantly.</span>
          </p>
          <p className="mt-3 text-base font-medium italic leading-relaxed text-white/80">
            Fast, secure and trusted international transfers,
            <br />
            right from your phone.
          </p>
        </div>
      </div>
    </div>
  );
}
