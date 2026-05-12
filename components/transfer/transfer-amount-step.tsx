"use client";

import { useEffect, useRef } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { motion, useAnimation } from "motion/react";

import { transferAmountSchema, type TransferAmountFormData } from "@/schemas/transfer.schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { TextField } from "@/components/ui/text-field";
import { useSendLimits } from "@/hooks/api";
import { dailyRemaining, validateAmountAgainstLimits, weeklyRemaining } from "@/lib/send-limits";
import type { BankDetails, Recipient } from "@/types/recipient";

interface TransferAmountStepProps {
  recipient: Recipient;
  /**
   * The bank the transfer will go to. Null while resolving; we fall back
   * to copy that says "their linked account" so we never render "Bank: null".
   */
  selectedBank?: BankDetails | null;
  onContinue: (data: { amount: string; note: string }) => void;
}

export function TransferAmountStep({
  recipient,
  selectedBank,
  onContinue,
}: TransferAmountStepProps) {
  const form = useForm<TransferAmountFormData>({
    resolver: yupResolver(transferAmountSchema) as unknown as Resolver<TransferAmountFormData>,
    defaultValues: { amount: "", note: "" },
    // Re-run the resolver on every change so the destructive border + Continue
    // disabled state track the user as they type, not just on submit.
    mode: "onChange",
  });
  const { data: limits } = useSendLimits();
  const watchedAmount = form.watch("amount");
  const amountError = form.formState.errors.amount?.message;
  const hasAmountError = !!amountError;
  // Gate Continue on `limits` being loaded — without it the cumulative
  // daily-cap check in `validateAmountAgainstLimits` short-circuits and a
  // user could submit an amount that the server will then reject.
  const isInvalid = hasAmountError || !watchedAmount?.trim() || !limits;

  // Layer the SSN-tier / 7-day-cap check on top of the schema-level checks.
  // When yup is happy but the limits aren't, we set our own field error;
  // when limits clear (or schema fails), we step out so yup keeps ownership.
  useEffect(() => {
    const limitError = validateAmountAgainstLimits(watchedAmount ?? "", limits);
    const current = form.getFieldState("amount").error;
    if (limitError) {
      if (current?.type !== "limits") {
        form.setError("amount", { type: "limits", message: limitError });
      }
    } else if (current?.type === "limits") {
      form.clearErrors("amount");
    }
  }, [watchedAmount, limits, form]);

  // Shake + a brief red flash the moment the amount crosses into invalid.
  // We track previous validity so the animation doesn't fire on every
  // keystroke that *stays* invalid.
  const controls = useAnimation();
  const wasInvalidRef = useRef(false);
  useEffect(() => {
    if (hasAmountError && !wasInvalidRef.current) {
      controls.start({
        x: [0, -8, 8, -6, 6, 0],
        transition: { duration: 0.3, ease: "easeInOut" },
      });
    }
    wasInvalidRef.current = hasAmountError;
  }, [hasAmountError, controls]);

  const bank = selectedBank ?? recipient.defaultBank;
  const destinationLabel = bank?.label
    ? `their ${bank.label} account`
    : bank?.bankName
      ? `their ${bank.bankName} account`
      : "their linked account";

  const limitsHint = limits
    ? `$${dailyRemaining(limits.past24HoursAmount, limits.hasSsn).toLocaleString("en-US", {
        maximumFractionDigits: 2,
      })} left today · $${weeklyRemaining(limits.past7DaysAmount).toLocaleString("en-US", {
        maximumFractionDigits: 2,
      })} left this week`
    : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Amount"
        title={
          <>
            How much for <span className="text-brand">{recipient.firstName}</span>?
          </>
        }
        subtitle={`Funds will arrive in ${destinationLabel}.`}
      />

      <Card variant="elevated" className="p-6 sm:p-8">
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit((data) => {
              const limitError = validateAmountAgainstLimits(data.amount, limits);
              if (limitError) {
                form.setError("amount", { type: "limits", message: limitError });
                return;
              }
              onContinue({ amount: data.amount, note: data.note ?? "" });
            })}
          >
            <motion.div animate={controls}>
              <TextField
                control={form.control}
                name="amount"
                label="Amount"
                inputMode="decimal"
                placeholder="100.00"
                leading={<span className="font-semibold text-base text-muted-foreground">$</span>}
                inputClassName="font-semibold text-2xl h-14 tabular pl-9"
                description={limitsHint}
              />
            </motion.div>
            <TextField
              control={form.control}
              name="note"
              label="Note"
              placeholder="Birthday gift"
              description="Recipients see this on their statement."
            />
            <Button type="submit" variant="brand" size="lg" className="w-full" disabled={isInvalid}>
              Continue
            </Button>
          </form>
        </Form>
      </Card>
    </>
  );
}
