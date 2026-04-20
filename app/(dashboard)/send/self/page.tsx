"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import {
  transferAmountSchema,
  type TransferAmountFormData,
} from "@/schemas/transfer.schema";
import { useAccount, useSendToSelf } from "@/hooks/api";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/ui/text-field";
import { PageHeader } from "@/components/ui/page-header";
import { BackLink } from "@/components/ui/back-link";
import { TransferResult } from "@/components/transfer/transfer-result";
import { useStepUp } from "@/hooks/use-step-up";

type Step = "amount" | "review" | "result";

export default function SendToSelfPage() {
  const { data: account } = useAccount();
  const sendToSelf = useSendToSelf();
  const { gate, stepUpElement } = useStepUp({
    title: "Confirm transfer",
    description: "We emailed you a 6-digit code. Enter it to authorize moving funds.",
  });

  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [transactionId, setTransactionId] = useState<string>();
  const [sendError, setSendError] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() =>
    generateIdempotencyKey(),
  );

  const form = useForm<TransferAmountFormData>({
    resolver: yupResolver(
      transferAmountSchema,
    ) as unknown as Resolver<TransferAmountFormData>,
    defaultValues: { amount: "", note: "" },
  });

  const hasDepositAccount = !!account?.hasDepositAccount;

  if (!hasDepositAccount) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-7">
        <BackLink href="/" />
        <Card variant="elevated" className="p-7">
          <h2 className="font-semibold text-2xl text-foreground">
            Add a deposit account first
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You need to link your own receiving bank account before you can send
            money to yourself.
          </p>
          <Button asChild variant="brand" className="mt-5">
            <Link href="/link-bank/receive">Link deposit account</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (step === "result") {
    return (
      <div className="mx-auto w-full max-w-lg space-y-6">
        {stepUpElement}
        <TransferResult
          status={sendError ? "error" : "success"}
          title={sendError ? "Transfer failed" : "Money on its way"}
          description={
            sendError ?? `You moved $${amount} to your own account.`
          }
          transactionId={transactionId}
          onRetry={() => {
            setSendError(null);
            setIdempotencyKey(generateIdempotencyKey());
            setStep("review");
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-7">
      {stepUpElement}
      {step === "amount" ? (
        <BackLink href="/" />
      ) : (
        <button
          onClick={() => setStep("amount")}
          className="group inline-flex items-center gap-1.5 self-start text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back
        </button>
      )}

      <AnimatePresence mode="wait">
        {step === "amount" && (
          <motion.div
            key="amount"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="space-y-6"
          >
            <PageHeader
              eyebrow="Self-send"
              title={
                <>
                  Move to{" "}
                  <span className="text-brand">
                    yourself
                  </span>
                  .
                </>
              }
              subtitle="Funds go to your linked deposit account."
            />

            <Card variant="elevated" className="p-6 sm:p-8">
              <Form {...form}>
                <form
                  className="space-y-5"
                  onSubmit={form.handleSubmit((data) => {
                    setAmount(data.amount);
                    setNote(data.note ?? "");
                    setStep("review");
                  })}
                >
                  <TextField
                    control={form.control}
                    name="amount"
                    label="Amount"
                    inputMode="decimal"
                    placeholder="100.00"
                    leading={
                      <span className="font-semibold text-base text-muted-foreground">
                        $
                      </span>
                    }
                    inputClassName="font-semibold text-2xl h-14 tabular pl-9"
                  />
                  <TextField
                    control={form.control}
                    name="note"
                    label="Note"
                    placeholder="What's it for?"
                  />
                  <Button
                    type="submit"
                    variant="brand"
                    size="lg"
                    className="w-full"
                  >
                    Continue
                  </Button>
                </form>
              </Form>
            </Card>
          </motion.div>
        )}

        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="space-y-6"
          >
            <PageHeader
              eyebrow="Confirm"
              title={
                <>
                  One last{" "}
                  <span className="text-brand">
                    look
                  </span>
                  .
                </>
              }
            />

            <Card variant="elevated" className="overflow-hidden">
              <div className="relative border-b border-border bg-gradient-to-br from-brand-soft/30 via-card to-card p-7 text-center">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-12 left-1/2 size-48 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
                />
                <p className="relative text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Moving
                </p>
                <p className="relative mt-2 font-semibold text-5xl leading-none tabular text-foreground sm:text-6xl">
                  ${amount}
                </p>
                <p className="relative mt-2 text-sm text-muted-foreground">
                  to your own account
                </p>
              </div>

              {note && (
                <div className="space-y-3 p-6 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground">Note</span>
                    <span className="text-right font-medium text-foreground">
                      {note}
                    </span>
                  </div>
                </div>
              )}

              <div className="border-t border-border p-6">
                <Button
                  variant="brand"
                  size="lg"
                  className="w-full"
                  loading={sendToSelf.isPending}
                  onClick={async () => {
                    setSendError(null);
                    const res = await gate(async () => {
                      const amountCents = Math.round(parseFloat(amount) * 100);
                      try {
                        return await sendToSelf.mutateAsync({
                          payload: { amountCents, note: note || undefined },
                          idempotencyKey,
                        });
                      } catch (err) {
                        setSendError(
                          err instanceof Error
                            ? err.message
                            : "Transfer failed",
                        );
                        return undefined;
                      }
                    });
                    if (res) {
                      setTransactionId(res.transactionId);
                      setStep("result");
                    } else if (sendError) {
                      setStep("result");
                    }
                  }}
                >
                  {!sendToSelf.isPending && <Send />}
                  Confirm
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
