"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { EASE_OUT_SMOOTH } from "@/constants/motion";
import { cn } from "@/lib/utils";

export interface StepperStep {
  id: string;
  label: string;
}

interface StepperProps {
  steps: readonly StepperStep[];
  activeIndex: number;
  className?: string;
}

/**
 * Compact progress header for the new-recipient wizard. Renders a pill with
 * the current step index + label, plus a horizontal track whose filled
 * portion animates toward completion as the user advances.
 */
export function Stepper({ steps, activeIndex, className }: StepperProps) {
  const total = steps.length;
  const progress = Math.max(0, Math.min(1, (activeIndex + 1) / total));

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-brand">
          Step {Math.min(activeIndex + 1, total)} of {total}
        </div>
        <div className="text-sm text-muted-foreground">{steps[activeIndex]?.label}</div>
      </div>

      <div className="relative flex items-center gap-2">
        {steps.map((step, idx) => {
          const reached = idx <= activeIndex;
          const done = idx < activeIndex;
          const isLast = idx === total - 1;
          return (
            <div key={step.id} className={cn("flex items-center gap-2", !isLast && "flex-1")}>
              <div
                className={cn(
                  "relative flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                  reached
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? (
                  <Check className="size-3.5" />
                ) : (
                  <span className="text-[11px] font-semibold">{idx + 1}</span>
                )}
              </div>
              {!isLast && (
                <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                  <motion.div
                    initial={false}
                    animate={{ scaleX: idx < activeIndex ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: EASE_OUT_SMOOTH }}
                    className="absolute inset-0 origin-left bg-brand"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="sr-only" aria-live="polite">
        Step {activeIndex + 1} of {total}: {steps[activeIndex]?.label}. Progress{" "}
        {Math.round(progress * 100)} percent.
      </div>
    </div>
  );
}
