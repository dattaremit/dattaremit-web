"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import {
  ONBOARDING_STEPS,
  type OnboardingStepKey,
} from "@/lib/onboarding-progress";
import { cn } from "@/lib/utils";

export function StepIndicator({
  current,
  completed,
}: {
  current: OnboardingStepKey;
  completed: Record<OnboardingStepKey, boolean>;
}) {
  const currentIndex = ONBOARDING_STEPS.findIndex((s) => s.key === current);
  // Highest reachable index: every completed step plus the first incomplete
  // one (the live step). Steps beyond that stay locked.
  const firstIncompleteIndex = ONBOARDING_STEPS.findIndex(
    (s) => !completed[s.key],
  );
  const maxReachable =
    firstIncompleteIndex === -1
      ? ONBOARDING_STEPS.length - 1
      : firstIncompleteIndex;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>
          Step {currentIndex + 1} of {ONBOARDING_STEPS.length}
        </span>
        <span>{ONBOARDING_STEPS[currentIndex]?.label}</span>
      </div>
      <ol className="flex items-center gap-2">
        {ONBOARDING_STEPS.map((step, i) => {
          const isComplete = completed[step.key];
          const isCurrent = i === currentIndex;
          const isReachable = i <= maxReachable;
          const dotClass = cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
            isComplete
              ? "border-primary bg-primary text-primary-foreground"
              : isCurrent
                ? "border-primary text-primary"
                : "border-muted-foreground/30 text-muted-foreground/60",
            isReachable && !isCurrent && "cursor-pointer hover:opacity-80",
            !isReachable && "cursor-not-allowed opacity-60",
          );
          const dot = isComplete ? <Check className="h-3.5 w-3.5" /> : i + 1;

          return (
            <li key={step.key} className="flex flex-1 items-center gap-2">
              {isReachable && !isCurrent ? (
                <Link href={step.href} aria-label={step.label} className={dotClass}>
                  {dot}
                </Link>
              ) : (
                <span className={dotClass} aria-current={isCurrent ? "step" : undefined}>
                  {dot}
                </span>
              )}
              {i < ONBOARDING_STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 rounded-full transition-colors",
                    isComplete ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
