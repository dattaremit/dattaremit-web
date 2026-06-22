"use client";

import { type FormEventHandler } from "react";
import { motion, useAnimation } from "motion/react";
import type { UseFormReturn } from "react-hook-form";

type AnimationControls = ReturnType<typeof useAnimation>;

import type { TransferAmountFormData } from "@/schemas/transfer.schema";
import { formatInr } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/ui/text-field";
import { PageHeader } from "@/components/ui/page-header";
import { UpiIdField } from "@/components/transfer/upi-id-field";

interface SelfAmountStepProps {
  form: UseFormReturn<TransferAmountFormData>;
  controls: AnimationControls;
  accountLabel: string;
  /** Whether the UPI destination was chosen on the account picker. When true,
   *  the amount step collects the UPI ID; the Bank vs UPI choice itself now
   *  lives on the picker, not here. */
  isUpi: boolean;
  limitsHint?: string;
  receiveAmount: number | null;
  inrFeeLoss: number | null;
  hasAmountError: boolean;
  isInvalid: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

/** Amount-entry step of the self-send flow: USD amount + note, with a live
 *  server-quoted receive preview (and the NRE fee loss when applicable). */
export function SelfAmountStep({
  form,
  controls,
  accountLabel,
  isUpi,
  limitsHint,
  receiveAmount,
  inrFeeLoss,
  hasAmountError,
  isInvalid,
  onSubmit,
}: SelfAmountStepProps) {
  return (
    <>
      <PageHeader
        eyebrow="Self-send"
        title={
          <>
            Move to <span className="text-brand">yourself</span>.
          </>
        }
        subtitle={`Funds go to ${accountLabel}.`}
      />

      <Card variant="elevated" className="p-6 sm:p-8">
        <Form {...form}>
          <form className="space-y-5" onSubmit={onSubmit}>
            {isUpi && <UpiIdField form={form} />}
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
              {receiveAmount !== null && !hasAmountError && (
                <div className="mt-2 rounded-lg bg-brand-soft/30 px-3 py-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      You&rsquo;ll receive
                    </span>
                    <span className="font-semibold text-base tabular text-foreground">
                      {formatInr(receiveAmount)}
                    </span>
                  </div>
                  {inrFeeLoss != null && (
                    <p className="mt-1 text-right text-xs text-muted-foreground">
                      You&rsquo;ll lose{" "}
                      <span className="font-medium text-destructive">{formatInr(inrFeeLoss)}</span>{" "}
                      (NRE fee)
                    </p>
                  )}
                </div>
              )}
            </motion.div>
            <TextField
              control={form.control}
              name="note"
              label="Note"
              placeholder="What's it for?"
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
