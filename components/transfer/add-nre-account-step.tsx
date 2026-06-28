"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft } from "lucide-react";

import {
  nreBankAccountSchema,
  type NreBankAccountFormData,
} from "@/schemas/nre-bank-account.schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/ui/text-field";
import { PageHeader } from "@/components/ui/page-header";

interface AddNreAccountStepProps {
  onSubmit: (data: NreBankAccountFormData) => Promise<void> | void;
  onBack: () => void;
  isPending: boolean;
}

/**
 * First-time NRE payout: collect the user's NRE (Non-Resident External) bank
 * details. Saved directly to the dedicated nre_bank_accounts table.
 */
export function AddNreAccountStep({ onSubmit, onBack, isPending }: AddNreAccountStepProps) {
  const form = useForm<NreBankAccountFormData>({
    resolver: yupResolver(nreBankAccountSchema),
    defaultValues: {
      bankName: "",
      branchName: "",
      accountHolderName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
      swiftCode: "",
    },
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
              name="bankName"
              label="Bank name"
              placeholder="e.g. HDFC Bank"
            />
            <TextField
              control={form.control}
              name="accountHolderName"
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
              name="confirmAccountNumber"
              label="Confirm account number"
              placeholder="Re-enter account number"
              // Block paste so a mistyped number can't be copied into both
              // fields, which would defeat the re-entry check.
              onPaste={(e) => e.preventDefault()}
            />
            <TextField
              control={form.control}
              name="ifscCode"
              label="IFSC code"
              placeholder="e.g. SBIN0001234"
              transform={(v) => v.toUpperCase()}
            />
            <TextField
              control={form.control}
              name="branchName"
              label="Branch name (optional)"
              placeholder="e.g. Mumbai Main Branch"
            />
            <TextField
              control={form.control}
              name="swiftCode"
              label="SWIFT / BIC code (optional)"
              placeholder="e.g. HDFCINBB"
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
