"use client";

import { useFormContext } from "react-hook-form";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import type { RecipientFormData } from "@/schemas/recipient.schema";

interface AddressStepProps {
  onBack: () => void;
  onContinue: () => void;
}

/**
 * Step 2 — Indian delivery address. Kept visually quiet so the user can
 * move through it quickly.
 */
export function AddressStep({ onBack, onContinue }: AddressStepProps) {
  const form = useFormContext<RecipientFormData>();

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h2 className="font-semibold text-2xl text-foreground">Their address in India</h2>
        <p className="text-sm text-muted-foreground">
          Used for KYC. Postal code precision matters — double-check before continuing.
        </p>
      </header>

      <TextField
        control={form.control}
        name="addressLine1"
        label="Street address"
        placeholder="Flat 12, Sunrise Apartments, MG Road"
        leading={<MapPin className="size-4" />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <TextField control={form.control} name="city" label="City" placeholder="Mumbai" />
        <TextField control={form.control} name="state" label="State" placeholder="Maharashtra" />
        <TextField
          control={form.control}
          name="postalCode"
          label="Postal code"
          placeholder="400001"
          inputMode="numeric"
          transform={(v) => v.replace(/\s/g, "")}
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <Button type="button" variant="ghost" size="lg" onClick={onBack}>
          <ArrowLeft />
          Back
        </Button>
        <Button type="button" variant="brand" size="lg" onClick={onContinue}>
          Review
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
