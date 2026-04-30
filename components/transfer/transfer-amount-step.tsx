"use client";

import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { transferAmountSchema, type TransferAmountFormData } from "@/schemas/transfer.schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { TextField } from "@/components/ui/text-field";
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
  });

  const bank = selectedBank ?? recipient.defaultBank;
  const destinationLabel = bank?.label
    ? `their ${bank.label} account`
    : bank?.bankName
      ? `their ${bank.bankName} account`
      : "their linked account";

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
              onContinue({ amount: data.amount, note: data.note ?? "" });
            })}
          >
            <TextField
              control={form.control}
              name="amount"
              label="Amount"
              inputMode="decimal"
              placeholder="100.00"
              leading={<span className="font-semibold text-base text-muted-foreground">$</span>}
              inputClassName="font-semibold text-2xl h-14 tabular pl-9"
            />
            <TextField
              control={form.control}
              name="note"
              label="Note"
              placeholder="Birthday gift"
              description="Recipients see this on their statement."
            />
            <Button type="submit" variant="brand" size="lg" className="w-full">
              Continue
            </Button>
          </form>
        </Form>
      </Card>
    </>
  );
}
