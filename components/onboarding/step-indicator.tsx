"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import {
  ONBOARDING_STEPS,
  type IndicatorStepKey,
} from "@/lib/onboarding-progress";
import { cn } from "@/lib/utils";

export function StepIndicator({
  current,
  completed,
}: {
  current: IndicatorStepKey;
  completed: Record<IndicatorStepKey, boolean>;
}) {
  const currentIndex = ONBOARDING_STEPS.findIndex((s) => s.key === current);
  const firstIncompleteIndex = ONBOARDING_STEPS.findIndex(
    (s) => !completed[s.key],
  );
  const maxReachable =
    firstIncompleteIndex === -1
      ? ONBOARDING_STEPS.length - 1
      : firstIncompleteIndex;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Step {currentIndex + 1} of {ONBOARDING_STEPS.length}
        </span>
        <span className="font-semibold text-base text-foreground">
          {ONBOARDING_STEPS[currentIndex]?.label}
        </span>
      </div>
      <ol className="flex items-center gap-2">
        {ONBOARDING_STEPS.map((step, i) => {
          const isComplete = completed[step.key];
          const isCurrent = i === currentIndex;
          const isReachable = i <= maxReachable;
          const dotClass = cn(
            "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular transition-all",
            isComplete &&
              "border-brand bg-brand text-brand-foreground shadow-soft",
            isCurrent &&
              !isComplete &&
              "border-brand text-foreground bg-card shadow-soft",
            !isCurrent &&
              !isComplete &&
              "border-border bg-card text-muted-foreground/60",
            isReachable && !isCurrent && !isComplete && "hover:border-foreground/30 cursor-pointer",
            !isReachable && "cursor-not-allowed opacity-50",
          );
          const dot = isComplete ? <Check className="size-4" /> : i + 1;

          return (
            <li key={step.key} className="flex flex-1 items-center gap-2">
              {isReachable && !isCurrent ? (
                <Link
                  href={step.href}
                  aria-label={step.label}
                  className={dotClass}
                >
                  {isCurrent && (
                    <span className="absolute inset-0 -z-10 animate-pulse rounded-full bg-brand/20" />
                  )}
                  {dot}
                </Link>
              ) : (
                <span
                  className={dotClass}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCurrent && (
                    <span className="absolute inset-0 -z-10 animate-pulse rounded-full bg-brand/15" />
                  )}
                  {dot}
                </span>
              )}
              {i < ONBOARDING_STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 rounded-full transition-colors",
                    isComplete ? "bg-brand" : "bg-border",
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
