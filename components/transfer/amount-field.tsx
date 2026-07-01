"use client";

import { useState } from "react";
import { Controller, type Control } from "react-hook-form";

import type { TransferAmountFormData } from "@/schemas/transfer.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usdToInr, inrToUsd } from "@/lib/money";
import { cn } from "@/lib/utils";

type Currency = "USD" | "INR";

interface AmountFieldProps {
  control: Control<TransferAmountFormData>;
  /** Live mid-market USD→INR rate. The INR-entry toggle is only offered when a
   *  usable rate is loaded; without it we fall back to USD-only entry. */
  rate: number | null | undefined;
  /** Remaining-limit helper, always expressed in USD. */
  limitsHint?: string;
}

/**
 * Amount input with a USD/INR currency toggle. The canonical form value
 * (`amount`) is ALWAYS held in USD so the schema, limit checks and the submit
 * payload stay USD end-to-end — when the user types rupees we convert to
 * dollars at the live rate on every keystroke. This is purely an input-side UX
 * convenience; nothing downstream changes.
 *
 * Uses RHF's `Controller` render-prop (not `useController`) so `field` is only
 * touched inside render — the React Compiler rejects reading the field value at
 * the component top level.
 */
export function AmountField({ control, rate, limitsHint }: AmountFieldProps) {
  const hasRate = rate != null && Number.isFinite(rate) && rate > 0;
  const [currency, setCurrency] = useState<Currency>("USD");
  // Rupee text the user typed while in INR mode. USD mode reads the canonical
  // form value directly, so it needs no local mirror.
  const [inrText, setInrText] = useState<string>("");

  return (
    <Controller
      control={control}
      name="amount"
      render={({ field, fieldState }) => {
        const usd = field.value ?? "";

        const switchCurrency = (next: Currency) => {
          if (next === currency || !hasRate) return;
          if (next === "INR") {
            const inr = usdToInr(usd, rate);
            setInrText(inr != null ? inr.toFixed(2) : "");
          }
          setCurrency(next);
        };

        const handleChange = (raw: string) => {
          if (currency === "USD") {
            field.onChange(raw);
          } else {
            setInrText(raw);
            // Convert rupees → dollars so the canonical value is always USD.
            field.onChange(inrToUsd(raw, rate));
          }
        };

        const symbol = currency === "USD" ? "$" : "₹";
        const displayValue = currency === "USD" ? usd : inrText;
        // In INR mode, surface the USD that will actually be sent (limits and
        // payload are USD); in USD mode the parent already shows the INR
        // they'll receive.
        const usdEquivalent =
          currency === "INR" && usd.trim() ? `≈ $${usd} USD will be sent` : null;

        return (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm font-medium text-foreground/90">Amount</Label>
              {hasRate && (
                <div className="inline-flex rounded-md border border-input p-0.5 text-xs font-medium">
                  {(["USD", "INR"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={currency === c}
                      onClick={() => switchCurrency(c)}
                      className={cn(
                        "rounded px-2.5 py-1 transition-colors",
                        currency === c
                          ? "bg-brand text-white"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span className="mr-1 opacity-70">{c === "USD" ? "$" : "₹"}</span>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-base text-muted-foreground">
                {symbol}
              </span>
              <Input
                inputMode="decimal"
                placeholder="100.00"
                value={displayValue}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={field.onBlur}
                ref={field.ref}
                aria-invalid={!!fieldState.error}
                className="pl-10 font-semibold text-2xl h-14 tabular"
              />
            </div>

            {usdEquivalent && <p className="text-xs text-muted-foreground">{usdEquivalent}</p>}
            {limitsHint && <p className="text-xs text-muted-foreground">{limitsHint}</p>}
            {fieldState.error?.message && (
              <p className="text-xs font-medium text-destructive">{fieldState.error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
}
