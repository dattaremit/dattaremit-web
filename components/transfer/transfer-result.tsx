"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { EASE_OUT_SMOOTH } from "@/constants/motion";

export interface TransferResultProps {
  status: "success" | "error";
  title: string;
  description?: string;
  transactionId?: string;
  primaryHref?: string;
  primaryLabel?: string;
  onRetry?: () => void;
}

export function TransferResult({
  status,
  title,
  description,
  transactionId,
  primaryHref = ROUTES.ACTIVITY,
  primaryLabel = "View activity",
  onRetry,
}: TransferResultProps) {
  const success = status === "success";
  const Icon = success ? CheckCircle2 : XCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT_SMOOTH }}
      className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-lift"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background: success
            ? "radial-gradient(circle, oklch(from var(--success) l c h / 0.35), transparent 70%)"
            : "radial-gradient(circle, oklch(from var(--destructive) l c h / 0.35), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-5 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.15,
            type: "spring",
            stiffness: 220,
            damping: 14,
          }}
          className={`flex size-16 items-center justify-center rounded-full ${
            success ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
          }`}
        >
          <Icon className="size-8" strokeWidth={2.2} />
        </motion.div>

        <div className="flex flex-col gap-2">
          <h2 className="font-semibold text-3xl leading-tight text-foreground sm:text-4xl">
            {title}
          </h2>
          {description && (
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>

        {transactionId && (
          <div className="rounded-full border border-border bg-muted/60 px-3 py-1 font-mono text-xs text-muted-foreground">
            {transactionId}
          </div>
        )}

        <div className="mt-2 flex w-full max-w-sm flex-col-reverse gap-2 sm:flex-row">
          {!success && onRetry && (
            <Button variant="outline" className="flex-1" onClick={onRetry}>
              Try again
            </Button>
          )}
          <Button asChild variant={success ? "brand" : "default"} className="flex-1">
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
