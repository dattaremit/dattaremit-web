"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import {
  transferAmountSchema,
  type TransferAmountFormData,
} from "@/schemas/transfer.schema";
import { useRecipients, useSendMoney } from "@/hooks/api";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipientCard } from "@/components/recipients/recipient-card";
import { TransferResult } from "@/components/transfer/transfer-result";
import { useStepUp } from "@/hooks/use-step-up";
import type { Recipient } from "@/types/recipient";

type Step = "select" | "amount" | "review" | "result";

export default function SendPage() {
  const search = useSearchParams();
  const preselectedId = search.get("recipient");
  const { data: recipients, isLoading } = useRecipients();
  const sendMoney = useSendMoney();
  const { gate, stepUpElement } = useStepUp({
    title: "Confirm transfer",
    description: "Re-enter your password to authorize this send.",
  });

  const [step, setStep] = useState<Step>(preselectedId ? "amount" : "select");
  const [selectedId, setSelectedId] = useState<string | null>(preselectedId);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [transactionId, setTransactionId] = useState<string>();
  const [sendError, setSendError] = useState<string | null>(null);
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
    resolver: yupResolver(transferAmountSchema) as unknown as Resolver<TransferAmountFormData>,
    defaultValues: { amount: "", note: "" },
  });

  if (step === "result") {
    return (
      <div className="mx-auto max-w-lg space-y-6">
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

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {stepUpElement}
      <div className="flex items-center gap-2">
        {step === "select" ? (
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/">
              <ArrowLeft />
              Back
            </Link>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() =>
              setStep(step === "review" ? "amount" : selectedId && preselectedId ? "select" : "select")
            }
          >
            <ArrowLeft />
            Back
          </Button>
        )}
      </div>

      {step === "select" && (
        <>
          <div>
            <h1 className="text-2xl font-bold">Send money</h1>
            <p className="text-muted-foreground">Pick a recipient.</p>
          </div>

          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          )}

          {!isLoading && (!eligible || eligible.length === 0) && (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="mb-3 text-muted-foreground">
                  No recipients are ready to receive money yet. Add one and
                  complete their bank details.
                </p>
                <Button asChild>
                  <Link href="/recipients/new">Add recipient</Link>
                </Button>
              </CardContent>
            </Card>
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
        </>
      )}

      {step === "amount" && selected && (
        <Card>
          <CardHeader>
            <CardTitle>
              Send to {selected.firstName} {selected.lastName}
            </CardTitle>
            <CardDescription>{selected.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit((data) => {
                  setAmount(data.amount);
                  setNote(data.note ?? "");
                  setStep("review");
                })}
              >
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (USD)</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="decimal"
                          placeholder="100.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Birthday gift" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {step === "review" && selected && (
        <Card>
          <CardHeader>
            <CardTitle>Review transfer</CardTitle>
            <CardDescription>
              Double-check the details before sending.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Row label="Recipient">
              {selected.firstName} {selected.lastName}
            </Row>
            <Row label="Bank">
              {selected.bankName} · {selected.bankAccountNumberMasked}
            </Row>
            <Row label="Amount">${amount}</Row>
            {note && <Row label="Note">{note}</Row>}
            <Button
              className="w-full"
              disabled={sendMoney.isPending}
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
                      err instanceof Error ? err.message : "Transfer failed",
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
              {sendMoney.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send />
              )}
              Confirm and send
            </Button>
          </CardContent>
        </Card>
      )}
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
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}
