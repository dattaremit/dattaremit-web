"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { recipientBankSchema, type RecipientBankFormData } from "@/schemas/recipient.schema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";

// confirmAccountNumber is a form-only re-entry guard; consumers never see it.
export type RecipientBankSubmitData = Omit<RecipientBankFormData, "confirmAccountNumber">;

export interface RecipientBankFormProps {
  defaultValues?: Partial<RecipientBankFormData>;
  submitLabel?: string;
  onSubmit: (data: RecipientBankSubmitData) => Promise<void> | void;
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
      confirmAccountNumber: "",
      ifsc: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(({ accountName, accountNumber, ifsc }) =>
          // Drop the form-only confirmAccountNumber; never send it upstream.
          onSubmit({ accountName, accountNumber, ifsc }),
        )}
        className="space-y-5"
      >
        <TextField control={form.control} name="accountName" label="Account holder name" />
        <TextField
          control={form.control}
          name="accountNumber"
          label="Account number"
          inputMode="numeric"
        />
        <TextField
          control={form.control}
          name="confirmAccountNumber"
          label="Confirm account number"
          inputMode="numeric"
          // Block paste so a mistyped number can't be copied into both fields,
          // which would defeat the re-entry check.
          onPaste={(e) => e.preventDefault()}
        />
        <TextField
          control={form.control}
          name="ifsc"
          label="IFSC"
          placeholder="SBIN0001234"
          transform={(v) => v.toUpperCase()}
        />

        <Button type="submit" variant="brand" size="lg" className="w-full" loading={submitting}>
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
