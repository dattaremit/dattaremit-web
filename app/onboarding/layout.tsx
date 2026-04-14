"use client";

import { useEffect } from "react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useAccount } from "@/hooks/api";
import { ApiError } from "@/services/api";
import {
  computeOnboardingState,
  ONBOARDING_STEPS,
  stepIndex,
  type OnboardingStepKey,
} from "@/lib/onboarding-progress";
import { StepIndicator } from "@/components/onboarding/step-indicator";

const STEP_FROM_PATH: Record<string, OnboardingStepKey> = {
  "/onboarding/profile": "profile",
  "/onboarding/address": "address",
  "/onboarding/kyc": "kyc",
};

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

  // Auth gate
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Step routing.
  //   - All steps done + URL doesn't match a step → bounce to dashboard.
  //   - Incomplete step → block jumping AHEAD of nextStep, but allow user to
  //     revisit any earlier step they have already completed (to update data).
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (isLoading) return;
    if (error && !noProfile) return;

    const currentStep = STEP_FROM_PATH[pathname];

    if (!state.nextStep) {
      if (!currentStep) router.replace("/");
      return;
    }

    if (!currentStep) {
      router.replace(
        ONBOARDING_STEPS.find((s) => s.key === state.nextStep)!.href,
      );
      return;
    }

    if (stepIndex(currentStep) > stepIndex(state.nextStep)) {
      router.replace(
        ONBOARDING_STEPS.find((s) => s.key === state.nextStep)!.href,
      );
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
  ]);

  const stepKey = STEP_FROM_PATH[pathname];

  if (!isLoaded || !isSignedIn || isLoading || !stepKey) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="flex items-center justify-between border-b bg-background px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Dattaremit" width={28} height={24} />
          <span className="font-semibold">Dattaremit</span>
        </div>
        <UserButton afterSignOutUrl="/sign-in" />
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg space-y-6">
          <StepIndicator current={stepKey} completed={state.completion} />
          <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
