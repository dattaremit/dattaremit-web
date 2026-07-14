"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Wrench } from "lucide-react";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { EASE_OUT_SMOOTH } from "@/constants/motion";

/**
 * Full-screen maintenance page. HARDCODED: the edge proxy rewrites every
 * non-exempt route here unconditionally (no backend/admin lookup), so this
 * page does not poll for a status change — removing the hardcode in proxy.ts
 * restores normal navigation.
 */
export default function MaintenancePage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-12">
      <AuroraBackground variant="marketing" />

      <motion.main
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { delayChildren: 0.1, staggerChildren: 0.1 } },
        }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="flex flex-col items-center rounded-3xl border border-border/40 bg-card/70 px-6 py-10 text-center shadow-lift backdrop-blur-xl sm:px-12 sm:py-14">
          {/* Brand */}
          <motion.div variants={fadeUp}>
            <Image
              src="/logo.png"
              alt="DattaRemit"
              width={148}
              height={40}
              priority
              className="h-9 w-auto"
            />
          </motion.div>

          {/* Animated icon cluster */}
          <motion.div variants={fadeUp} className="relative mt-10 mb-2">
            {!reduceMotion &&
              [0, 1].map((i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-primary/30"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  transition={{
                    duration: 2.6,
                    ease: "easeOut",
                    repeat: Infinity,
                    delay: i * 1.3,
                  }}
                />
              ))}
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-brand-soft shadow-glow">
              <motion.span
                animate={reduceMotion ? undefined : { rotate: [-9, 9, -9] }}
                transition={{
                  duration: 3.2,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
                className="text-primary-foreground"
              >
                <Wrench className="h-11 w-11" strokeWidth={1.75} />
              </motion.span>
            </div>
          </motion.div>

          {/* Copy */}
          <motion.h1
            variants={fadeUp}
            className="mt-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Hi Maintanance mode is not active, even after enabling from admin
          </motion.h1>

          {/* Indeterminate progress sweep */}
          <motion.div
            variants={fadeUp}
            className="mt-9 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted"
          >
            <motion.div
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
              animate={reduceMotion ? { x: "0%" } : { x: ["-120%", "360%"] }}
              transition={{
                duration: 1.8,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </motion.div>
        </div>

        <motion.p variants={fadeUp} className="mt-6 text-center text-xs text-muted-foreground/80">
          Need help? Reach us at{" "}
          <a
            href="mailto:support@dattaremit.com"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            support@dattaremit.com
          </a>
        </motion.p>
      </motion.main>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT_SMOOTH },
  },
} as const;
