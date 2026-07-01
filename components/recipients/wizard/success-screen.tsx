"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EASE_OUT_SMOOTH } from "@/constants/motion";
import type { Recipient } from "@/types/recipient";

interface SuccessScreenProps {
  recipient: Recipient;
  wasShared: boolean;
}

/**
 * Animated completion screen with a contextual next-step CTA: push the user
 * straight to add a bank, or to send if a bank already exists.
 */
export function SuccessScreen({ recipient, wasShared }: SuccessScreenProps) {
  const hasBank = recipient.banks.length > 0;
  const name = recipient.firstName;

  let headline: string;
  let body: string;
  let primaryLabel: string;
  let primaryHref: string;

  if (hasBank) {
    headline = `${name} is ready to receive money`;
    body = `Their bank account is set, so you can send right now.`;
    primaryLabel = "Send money now";
    primaryHref = `/send?recipient=${recipient.id}`;
  } else {
    headline = `${name} is ready — add a bank next`;
    body = `Add their Indian bank account to unlock transfers.`;
    primaryLabel = "Add bank account";
    primaryHref = `/recipients/${recipient.id}/bank`;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT_SMOOTH }}
      className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-soft sm:p-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-brand/15 blur-3xl"
      />
      <div className="relative flex flex-col items-center gap-6 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: EASE_OUT_SMOOTH,
            delay: 0.1,
          }}
          className="relative flex size-16 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lift"
        >
          <Check className="size-8" strokeWidth={3} />
          <motion.span
            aria-hidden="true"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            className="absolute inset-0 rounded-full border-2 border-brand"
          />
        </motion.div>

        <div className="space-y-2">
          {wasShared && (
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-brand">
              <Sparkles className="size-3.5" />
              Linked to existing recipient
            </div>
          )}
          <h2 className="font-semibold text-2xl text-foreground leading-snug">{headline}</h2>
          <p className="max-w-md text-sm text-muted-foreground">{body}</p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:max-w-sm">
          <Button asChild variant="brand" size="lg" className="w-full">
            <Link href={primaryHref}>
              {primaryLabel}
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full">
            <Link href="/recipients">Back to recipients</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
