"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmSendButtonProps {
  /** When true, the button is disabled and the progress/countdown animation runs. */
  loading: boolean;
  onClick: () => void;
  /** Content shown in the resting state. */
  children?: React.ReactNode;
  /** Verb shown while loading, e.g. "Sending" → "Sending… 3s". */
  loadingLabel?: string;
  /** Rough time-to-completion in seconds; paces the progress fill (default 12). */
  estimatedSeconds?: number;
  className?: string;
}

/**
 * The confirm action for transfer flows. While `loading`, it fills an
 * eased progress bar (asymptotic — never visually "finishes" before the
 * real request does), sweeps a shimmer across the fill, and ticks a live
 * seconds counter so the wait feels deliberate rather than frozen.
 */
export function ConfirmSendButton({
  loading,
  onClick,
  children = (
    <>
      <Send className="size-4" />
      Confirm and send
    </>
  ),
  loadingLabel = "Sending",
  estimatedSeconds = 12,
  className,
}: ConfirmSendButtonProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!loading) {
      setElapsed(0);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      setElapsed(performance.now() - start);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loading]);

  const seconds = Math.floor(elapsed / 1000);
  // Eased fill that approaches ~96% as elapsed nears `estimatedSeconds`, then
  // creeps the rest — so the bar always trails the actual completion.
  const tau = (estimatedSeconds * 1000) / 3;
  const progress = (1 - Math.exp(-elapsed / tau)) * 96;

  return (
    <Button
      variant="brand"
      size="lg"
      className={cn(
        "relative w-full overflow-hidden disabled:pointer-events-none disabled:opacity-100",
        className,
      )}
      disabled={loading}
      onClick={onClick}
    >
      {loading && (
        <motion.div
          className="absolute inset-y-0 left-0 bg-white/25 dark:bg-black/20"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* Bright leading edge that travels with the fill. */}
          <span className="absolute inset-y-0 right-0 w-8 bg-linear-to-l from-white/50 to-transparent dark:from-white/20" />
          {/* Shimmer that sweeps continuously across the filled portion. */}
          <motion.span
            className="absolute inset-y-0 w-1/2 bg-linear-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "300%" }}
            transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
          />
        </motion.div>
      )}

      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Spinner />
            <span className="flex items-center font-medium tabular-nums">
              {loadingLabel}…
              <span className="ml-1.5 inline-flex items-baseline">
                <span className="relative inline-flex h-[1.2em] w-[1.4ch] justify-center overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={seconds}
                      className="absolute inline-block"
                      initial={{ y: "0.9em", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "-0.9em", opacity: 0 }}
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    >
                      {seconds}
                    </motion.span>
                  </AnimatePresence>
                </span>
                s
              </span>
            </span>
          </>
        ) : (
          children
        )}
      </span>
    </Button>
  );
}

/** Dual-ring spinner — a touch richer than a plain Loader2. */
function Spinner() {
  return (
    <span className="relative size-4 shrink-0">
      <span className="absolute inset-0 rounded-full border-2 border-current/25" />
      <motion.span
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-current"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.7, ease: "linear", repeat: Infinity }}
      />
    </span>
  );
}
