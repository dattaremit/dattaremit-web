"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { recipientBankSchema, type RecipientBankFormData } from "@/schemas/recipient.schema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

export interface RecipientBankFormProps {
  defaultValues?: Partial<RecipientBankFormData>;
  submitLabel?: string;
  onSubmit: (data: RecipientBankFormData) => Promise<void> | void;
  submitting?: boolean;
}

export function RecipientBankForm({
  defaultValues,
  submitLabel = "Save bank",
  onSubmit,
  submitting,
}: RecipientBankFormProps) {
  const form = useForm<RecipientBankFormData>({
    resolver: yupResolver(recipientBankSchema),
    defaultValues: {
      accountName: "",
      accountNumber: "",
      ifsc: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <TextField control={form.control} name="accountName" label="Account holder name" />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="accountNumber"
            label="Account number"
            inputMode="numeric"
          />
          <TextField
            control={form.control}
            name="ifsc"
            label="IFSC"
            placeholder="SBIN0001234"
            transform={(v) => v.toUpperCase()}
          />
        </div>

        <Button type="submit" variant="brand" size="lg" className="w-full" loading={submitting}>
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
