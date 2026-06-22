"use client";

import type { UseFormReturn } from "react-hook-form";

import type { TransferAmountFormData } from "@/schemas/transfer.schema";
import { TextField } from "@/components/ui/text-field";

interface UpiIdFieldProps {
  form: UseFormReturn<TransferAmountFormData>;
}

/**
 * The UPI ID (VPA) input for the amount step. Rendered only when the chosen
 * destination is UPI — the Bank vs UPI choice now lives on the account /
 * recipient picker, not here. The schema's conditional `upiId` rule gates the
 * Continue button on a valid VPA automatically.
 */
export function UpiIdField({ form }: UpiIdFieldProps) {
  return (
    <TextField
      control={form.control}
      name="upiId"
      label="UPI ID"
      placeholder="name@bank"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      inputMode="email"
      description="Funds are sent to this UPI ID."
    />
  );
}
