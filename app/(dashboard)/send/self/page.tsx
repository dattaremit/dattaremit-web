"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import {
  transferAmountSchema,
  type TransferAmountFormData,
} from "@/schemas/transfer.schema";
import { useAccount, useSendToSelf } from "@/hooks/api";
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
import { TransferResult } from "@/components/transfer/transfer-result";
import { useStepUp } from "@/hooks/use-step-up";

type Step = "amount" | "review" | "result";

export default function SendToSelfPage() {
  const { data: account } = useAccount();
  const sendToSelf = useSendToSelf();
  const { gate, stepUpElement } = useStepUp({
    title: "Confirm transfer",
    description: "Re-enter your password to authorize moving funds.",
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
    resolver: yupResolver(transferAmountSchema) as unknown as Resolver<TransferAmountFormData>,
    defaultValues: { amount: "", note: "" },
  });

  const hasDepositAccount = !!account?.user?.zynkDepositAccountId;

  if (!hasDepositAccount) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
          <Link href="/">
            <ArrowLeft />
            Back
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Add a deposit account first</CardTitle>
            <CardDescription>
              You need to link your own receiving bank account to send money
              to yourself.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/link-bank/receive">Link deposit account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "result") {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        {stepUpElement}
        <TransferResult
          status={sendError ? "error" : "success"}
          title={sendError ? "Transfer failed" : "Transfer sent to yourself"}
          description={sendError ?? `You moved $${amount} to your own account.`}
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
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit"
        asChild={step === "amount"}
        onClick={() => (step === "review" ? setStep("amount") : undefined)}
      >
        {step === "amount" ? (
          <Link href="/">
            <ArrowLeft />
            Back
          </Link>
        ) : (
          <span>
            <ArrowLeft />
            Back
          </span>
        )}
      </Button>

      {step === "amount" && (
        <Card>
          <CardHeader>
            <CardTitle>Send to yourself</CardTitle>
            <CardDescription>
              Moves funds to your linked deposit account.
            </CardDescription>
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
                        <Input {...field} />
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

      {step === "review" && (
        <Card>
          <CardHeader>
            <CardTitle>Review transfer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">${amount}</span>
            </div>
            {note && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Note</span>
                <span className="font-medium">{note}</span>
              </div>
            )}
            <Button
              className="w-full"
              disabled={sendToSelf.isPending}
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
              {sendToSelf.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send />
              )}
              Confirm
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
