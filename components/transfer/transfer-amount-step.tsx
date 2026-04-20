"use client";

import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  transferAmountSchema,
  type TransferAmountFormData,
} from "@/schemas/transfer.schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { TextField } from "@/components/ui/text-field";
import type { Recipient } from "@/types/recipient";

interface TransferAmountStepProps {
  recipient: Recipient;
  onContinue: (data: { amount: string; note: string }) => void;
}

export function TransferAmountStep({
  recipient,
  onContinue,
}: TransferAmountStepProps) {
  const form = useForm<TransferAmountFormData>({
    resolver: yupResolver(
      transferAmountSchema,
    ) as unknown as Resolver<TransferAmountFormData>,
    defaultValues: { amount: "", note: "" },
  });

  return (
    <>
      <PageHeader
        eyebrow="Step 2"
        title={
          <>
            How much for{" "}
            <span className="text-brand">{recipient.firstName}</span>?
          </>
        }
        subtitle={`Funds will arrive in ${recipient.bankName ?? "their linked account"}.`}
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
            <Button type="submit" variant="brand" size="lg" className="w-full">
              Continue
            </Button>
          </form>
        </Form>
      </Card>
    </>
  );
}
