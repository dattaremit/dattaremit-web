"use client";

import { motion, type HTMLMotionProps, type Transition } from "motion/react";
import { EASE_OUT_SMOOTH } from "@/constants/motion";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 12 },
  down: { x: 0, y: -12 },
  left: { x: 12, y: 0 },
  right: { x: -12, y: 0 },
  none: { x: 0, y: 0 },
};

const baseTransition: Transition = {
  duration: 0.55,
  ease: EASE_OUT_SMOOTH,
};

export type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  direction?: Direction;
};

export function Reveal({
  delay = 0,
  direction = "up",
  className,
  children,
  ...props
}: RevealProps) {
  const offset = offsets[direction];
  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ ...baseTransition, delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export type StaggerProps = HTMLMotionProps<"div"> & {
  delayChildren?: number;
  staggerChildren?: number;
};

export function Stagger({
  delayChildren = 0.05,
  staggerChildren = 0.06,
  className,
  children,
  ...props
}: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { delayChildren, staggerChildren },
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  direction = "up",
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { direction?: Direction }) {
  const offset = offsets[direction];
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: offset.x, y: offset.y },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: baseTransition,
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
