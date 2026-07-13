"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Wrench } from "lucide-react";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { EASE_OUT_SMOOTH } from "@/constants/motion";

const POLL_INTERVAL_MS = 12_000;

function statusUrl(): string | null {
  const base = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/maintenance-status`;
}

/**
 * Full-screen maintenance page. Shown for every route while maintenance mode is
 * on (the edge proxy rewrites here). It quietly polls the backend and, the
 * moment an admin turns maintenance off, sends the user back into the app — no
 * manual refresh needed.
 */
export default function MaintenancePage() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const url = statusUrl();
    if (!url) return;

    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(url as string, {
          headers: { accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) return;
        const body = (await res.json()) as { data?: { enabled?: boolean } };
        if (!cancelled && body?.data?.enabled === false) {
          // Maintenance is over — reload back into the app the user came from.
          window.location.reload();
        }
      } catch {
        // Ignore transient errors; the next tick will retry.
      }
    }

    const id = setInterval(check, POLL_INTERVAL_MS);
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

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
            className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            We&apos;ll be right back
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-3 max-w-md text-balance text-base leading-relaxed text-muted-foreground"
          >
            DattaRemit is getting a quick tune-up so your transfers stay fast, secure, and reliable.
            Thank you for your patience — we&apos;re almost done.
          </motion.p>

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

          {/* Live status */}
          <motion.div
            variants={fadeUp}
            className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-success"
                  animate={reduceMotion ? undefined : { opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </span>
            <span>Reconnecting automatically — no need to refresh</span>
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
