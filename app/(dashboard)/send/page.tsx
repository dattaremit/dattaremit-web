"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, ArrowRight, Landmark, Send, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import {
  transferAmountSchema,
  type TransferAmountFormData,
} from "@/schemas/transfer.schema";
import { useAccount, useRecipients, useSendMoney } from "@/hooks/api";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/ui/text-field";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { RecipientCard } from "@/components/recipients/recipient-card";
import { TransferResult } from "@/components/transfer/transfer-result";
import { SelfTransferCard } from "@/components/transfer/self-transfer-card";
import { AddRecipientWarningModal } from "@/components/transfer/add-recipient-warning-modal";
import { KycGate } from "@/components/kyc-gate";
import { useStepUp } from "@/hooks/use-step-up";
import type { Recipient } from "@/types/recipient";

type Step = "select" | "amount" | "review" | "result";

const STEP_ORDER: Step[] = ["select", "amount", "review", "result"];

export default function SendPage() {
  const router = useRouter();
  const search = useSearchParams();
  const preselectedId = search.get("recipient");
  const { data: account } = useAccount();
  const { data: recipients, isLoading } = useRecipients();
  const sendMoney = useSendMoney();
  const { gate, stepUpElement } = useStepUp({
    title: "Confirm transfer",
    description: "We emailed you a 6-digit code. Enter it to authorize this send.",
  });

  const [step, setStep] = useState<Step>(preselectedId ? "amount" : "select");
  const [selectedId, setSelectedId] = useState<string | null>(preselectedId);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [transactionId, setTransactionId] = useState<string>();
  const [sendError, setSendError] = useState<string | null>(null);
  const [warningOpen, setWarningOpen] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() =>
    generateIdempotencyKey(),
  );

  const selected = useMemo<Recipient | undefined>(
    () => recipients?.find((r) => r.id === selectedId),
    [recipients, selectedId],
  );

  const eligible = recipients?.filter(
    (r) => r.kycStatus === "APPROVED" && r.hasBankAccount,
  );

  const form = useForm<TransferAmountFormData>({
    resolver: yupResolver(
      transferAmountSchema,
    ) as unknown as Resolver<TransferAmountFormData>,
    defaultValues: { amount: "", note: "" },
  });

  if (step === "result") {
    return (
      <div className="mx-auto w-full max-w-lg">
        {stepUpElement}
        <TransferResult
          status={sendError ? "error" : "success"}
          title={sendError ? "Transfer failed" : "Money sent"}
          description={
            sendError
              ? sendError
              : `You sent $${amount} to ${selected?.firstName} ${selected?.lastName}.`
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

  if (account && account.accountStatus !== "ACTIVE") {
    return (
      <div className="mx-auto w-full max-w-lg">
        <KycGate accountStatus={account.accountStatus} feature="sending money" />
      </div>
    );
  }

  if (account && !account.hasBankAccount) {
    return (
      <div className="mx-auto w-full max-w-lg">
        <Card variant="elevated" className="p-8 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
            <Landmark className="size-6" />
          </div>
          <h2 className="font-semibold text-2xl text-foreground">
            Link a bank to send money
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your US bank via Plaid so we know where to pull the funds
            from. Takes about a minute.
          </p>
          <Button asChild variant="brand" className="mt-5">
            <Link href="/link-bank">
              Connect bank
              <ArrowRight />
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      {stepUpElement}

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2"
          asChild={step === "select"}
          onClick={
            step === "select"
              ? undefined
              : () => setStep(step === "review" ? "amount" : "select")
          }
        >
          {step === "select" ? (
            <Link href="/">
              <ArrowLeft />
              Home
            </Link>
          ) : (
            <>
              <ArrowLeft />
              Back
            </>
          )}
        </Button>
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {(["select", "amount", "review"] as const).map((s, i) => {
            const isActive = STEP_ORDER.indexOf(s) === stepIndex;
            const isDone = STEP_ORDER.indexOf(s) < stepIndex;
            return (
              <div key={s} className="flex items-center gap-1.5">
                {i > 0 && <div className="h-px w-4 bg-border" />}
                <span
                  className={
                    isActive
                      ? "text-foreground"
                      : isDone
                        ? "text-brand"
                        : "text-muted-foreground/50"
                  }
                >
                  {i + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="space-y-6"
          >
            <PageHeader
              eyebrow="Step 1"
              title={
                <>
                  Who&apos;s it{" "}
                  <span className="text-brand">
                    going to
                  </span>
                  ?
                </>
              }
              subtitle="Pick a verified recipient. They&apos;ll receive funds in their linked bank."
            />

            <div className="space-y-3">
              <SelfTransferCard
                indianKycStatus={account?.indianKycStatus ?? "NONE"}
                hasDepositAccount={!!account?.hasDepositAccount}
              />
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => setWarningOpen(true)}
              >
                <UserPlus />
                Add Recipient
              </Button>
            </div>

            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            )}

            {!isLoading && (!eligible || eligible.length === 0) && (
              <EmptyState
                icon={<UserPlus className="size-5" />}
                title="No recipients yet"
                description="Add one to get started."
              />
            )}

            {eligible && eligible.length > 0 && (
              <div className="space-y-3">
                {eligible.map((r) => (
                  <button
                    key={r.id}
                    className="block w-full text-left"
                    onClick={() => {
                      setSelectedId(r.id);
                      setStep("amount");
                    }}
                  >
                    <RecipientCard recipient={r} />
                  </button>
                ))}
              </div>
            )}

            <AddRecipientWarningModal
              open={warningOpen}
              onOpenChange={setWarningOpen}
              onConfirm={() => {
                setWarningOpen(false);
                router.push("/recipients/new");
              }}
            />
          </motion.div>
        )}

        {step === "amount" && selected && (
          <motion.div
            key="amount"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="space-y-6"
          >
            <PageHeader
              eyebrow="Step 2"
              title={
                <>
                  How much for{" "}
                  <span className="text-brand">
                    {selected.firstName}
                  </span>
                  ?
                </>
              }
              subtitle={`Funds will arrive in ${selected.bankName ?? "their linked account"}.`}
            />

            <Card variant="elevated" className="p-6 sm:p-8">
              <Form {...form}>
                <form
                  className="space-y-6"
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
                    placeholder="Birthday gift"
                    description="Recipients see this on their statement."
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

        {step === "review" && selected && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="space-y-6"
          >
            <PageHeader
              eyebrow="Step 3"
              title={
                <>
                  Confirm and{" "}
                  <span className="text-brand">
                    send
                  </span>
                  .
                </>
              }
              subtitle="One last look. Once you confirm, the funds are on their way."
            />

            <Card variant="elevated" className="overflow-hidden">
              <div className="relative border-b border-border bg-linear-to-br from-brand-soft/30 via-card to-card p-7 text-center">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-12 left-1/2 size-48 -translate-x-1/2 rounded-full bg-brand/15 blur-3xl"
                />
                <p className="relative text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Sending
                </p>
                <p className="relative mt-2 font-semibold text-5xl leading-none tabular text-foreground sm:text-6xl">
                  ${amount}
                </p>
                <p className="relative mt-2 text-sm text-muted-foreground">
                  to{" "}
                  <span className="font-medium text-foreground">
                    {selected.firstName} {selected.lastName}
                  </span>
                </p>
              </div>

              <div className="space-y-3 p-6 text-sm">
                <Row label="Bank">
                  {selected.bankName} · {selected.bankAccountNumberMasked}
                </Row>
                <Row label="Recipient">{selected.email}</Row>
                {note && <Row label="Note">{note}</Row>}
                <Row label="Estimated arrival">
                  <span className="text-brand">~60 seconds</span>
                </Row>
              </div>

              <div className="border-t border-border p-6">
                <Button
                  variant="brand"
                  size="lg"
                  className="w-full"
                  loading={sendMoney.isPending}
                  onClick={async () => {
                    setSendError(null);
                    const res = await gate(async () => {
                      const amountCents = Math.round(parseFloat(amount) * 100);
                      try {
                        return await sendMoney.mutateAsync({
                          payload: {
                            recipientId: selected.id,
                            amountCents,
                            note: note || undefined,
                          },
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
                  {!sendMoney.isPending && <Send />}
                  Confirm and send
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-dashed border-border/60 pb-3 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{children}</span>
    </div>
  );
}
