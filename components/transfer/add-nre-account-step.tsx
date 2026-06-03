"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft } from "lucide-react";

import {
  depositAccountSchema,
  type DepositAccountFormData,
} from "@/schemas/deposit-account.schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/ui/text-field";
import { PageHeader } from "@/components/ui/page-header";

interface AddNreAccountStepProps {
  onSubmit: (data: DepositAccountFormData) => Promise<void> | void;
  onBack: () => void;
  isPending: boolean;
}

/**
 * First-time NRE payout: collect the user's NRE bank details. Reuses the
 * deposit-account schema (same fields) since the backend shape mirrors the
 * regular deposit account for now.
 */
export function AddNreAccountStep({ onSubmit, onBack, isPending }: AddNreAccountStepProps) {
  const form = useForm<DepositAccountFormData>({
    resolver: yupResolver(depositAccountSchema),
    defaultValues: { accountName: "", accountNumber: "", ifsc: "" },
  });

  return (
    <>
      <PageHeader
        eyebrow="NRE account"
        title={
          <>
            Add your <span className="text-brand">NRE account</span>.
          </>
        }
        subtitle="Enter your Non-Resident External account details. We'll save it so you can pick it next time."
      />

      <Card variant="elevated" className="p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <TextField
              control={form.control}
              name="accountName"
              label="Account holder name"
              placeholder="As per bank records"
            />
            <TextField
              control={form.control}
              name="accountNumber"
              label="Account number"
              placeholder="Enter account number"
            />
            <TextField
              control={form.control}
              name="ifsc"
              label="IFSC code"
              placeholder="e.g. SBIN0001234"
              transform={(v) => v.toUpperCase()}
            />

            <div className="flex items-center justify-between gap-3 pt-1">
              <Button type="button" variant="ghost" size="lg" onClick={onBack}>
                <ArrowLeft />
                Back
              </Button>
              <Button type="submit" variant="brand" size="lg" loading={isPending}>
                Save NRE account
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </>
  );
}
