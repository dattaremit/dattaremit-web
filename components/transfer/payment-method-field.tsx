"use client";

import { Landmark, Smartphone } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import type { TransferAmountFormData } from "@/schemas/transfer.schema";
import { RadioCard } from "@/components/ui/radio-card";
import { TextField } from "@/components/ui/text-field";

interface PaymentMethodFieldProps {
  form: UseFormReturn<TransferAmountFormData>;
}

/**
 * Bank vs UPI payout picker plus the conditional UPI ID input, driven by the
 * shared amount form. Selecting "Bank" clears any entered UPI ID so a stale
 * value never rides along in the payload; the schema's conditional `upiId`
 * rule then makes the Continue button gate on a valid VPA automatically.
 */
export function PaymentMethodField({ form }: PaymentMethodFieldProps) {
  const method = form.watch("paymentMethod");

  const select = (value: "BANK" | "UPI") => {
    if (value === method) return;
    form.setValue("paymentMethod", value, { shouldValidate: true, shouldDirty: true });
    if (value === "BANK") {
      form.setValue("upiId", "", { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <RadioCard
          compact
          icon={<Landmark className="size-5" />}
          title="Bank transfer"
          active={method !== "UPI"}
          onSelect={() => select("BANK")}
        />
        <RadioCard
          compact
          icon={<Smartphone className="size-5" />}
          title="UPI"
          active={method === "UPI"}
          onSelect={() => select("UPI")}
        />
      </div>
      {method === "UPI" && (
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
      )}
    </div>
  );
}
