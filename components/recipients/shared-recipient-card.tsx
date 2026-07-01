"use client";

import { motion } from "motion/react";
import { ArrowRight, Banknote, Sparkles, UserCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EASE_OUT_SMOOTH } from "@/constants/motion";
import type { CheckIdentityResult } from "@/types/recipient";

interface SharedRecipientCardProps {
  match: Extract<CheckIdentityResult, { exists: true }>;
  onConfirm: () => void;
  onDismiss: () => void;
  confirming?: boolean;
}

/**
 * Inline richer alternative to the old SharedRecipientDialog. Shown inside
 * the new-recipient wizard as soon as we detect a matching identity — gives
 * the user a concrete reason to link instead of starting from scratch.
 */
export function SharedRecipientCard({
  match,
  onConfirm,
  onDismiss,
  confirming,
}: SharedRecipientCardProps) {
  const { recipient, alreadyLinked } = match;
  const initials = `${recipient.firstName[0] ?? ""}${recipient.lastName[0] ?? ""}`.toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: EASE_OUT_SMOOTH }}
      className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-7"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -right-12 size-48 rounded-full bg-brand/15 blur-3xl"
      />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-brand">
          <Sparkles className="size-3.5" />
          {alreadyLinked ? "Already in your list" : "We found a match"}
        </div>

        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand/30 to-brand-soft/40 font-semibold text-lg text-foreground">
            {initials || <UserCheck className="size-6" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-xl text-foreground leading-snug">
              {recipient.firstName} {recipient.lastName}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {alreadyLinked
                ? "This person is already on your recipients list."
                : "Another sender has already verified this person."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Badge variant={recipient.hasBankAccount ? "default" : "outline"} className="gap-1">
                <Banknote className="size-3" />
                {recipient.hasBankAccount ? "Bank linked" : "No bank yet"}
              </Badge>
            </div>
          </div>
        </div>

        {!alreadyLinked && (
          <div className="rounded-xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            Linking saves time — you reuse the existing verification
            {recipient.hasBankAccount
              ? " and bank on file, so you can send money right away."
              : "; you'll still add a bank account afterward."}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="brand"
            size="lg"
            onClick={onConfirm}
            loading={confirming}
            className="w-full"
          >
            {alreadyLinked ? "Open recipient" : "Add to my list"}
            <ArrowRight />
          </Button>
          {!alreadyLinked && (
            <button
              type="button"
              onClick={onDismiss}
              className="mx-auto text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Not {recipient.firstName}? Keep filling in new details
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
