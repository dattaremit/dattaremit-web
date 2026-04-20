"use client";

import { motion } from "motion/react";
import { EASE_OUT_SMOOTH } from "@/constants/motion";
import { cn } from "@/lib/utils";

interface StepTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Horizontal slide-in wrapper for multi-step flows. Used inside
 * AnimatePresence with mode="wait"; caller supplies a unique `key` on the
 * element itself so React/AnimatePresence can sequence the swap.
 */
export function StepTransition({ children, className }: StepTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.3, ease: EASE_OUT_SMOOTH }}
      className={cn("space-y-6", className)}
    >
      {children}
    </motion.div>
  );
}
