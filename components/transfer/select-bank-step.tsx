"use client";

import { ArrowLeft, ArrowRight, Banknote, Check, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import type { BankDetails, Recipient } from "@/types/recipient";

interface SelectBankStepProps {
  recipient: Recipient;
  selectedBankId: string | null;
  onSelect: (bankId: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

/**
 * Shown between recipient-pick and amount-entry when a recipient has
 * multiple bank accounts. If there's only one bank, the caller skips this
 * step and auto-resolves to it.
 */
export function SelectBankStep({
  recipient,
  selectedBankId,
  onSelect,
  onContinue,
  onBack,
}: SelectBankStepProps) {
  // Default-first ordering — default bank is visually first and pre-selected.
  const ordered = [...recipient.banks].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

  const activeId = selectedBankId ?? recipient.defaultBank?.id ?? ordered[0]?.id;

  return (
    <>
      <PageHeader
        eyebrow="Step 2"
        title={
          <>
            Which <span className="text-brand">bank</span>?
          </>
        }
        subtitle={`${recipient.firstName} has ${recipient.banks.length} accounts. Pick where the money should land.`}
      />

      <div className="space-y-3">
        {ordered.map((bank) => (
          <BankRadio
            key={bank.id}
            bank={bank}
            active={bank.id === activeId}
            onSelect={() => onSelect(bank.id)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <Button type="button" variant="ghost" size="lg" onClick={onBack}>
          <ArrowLeft />
          Back
        </Button>
        <Button type="button" variant="brand" size="lg" onClick={onContinue} disabled={!activeId}>
          Continue
          <ArrowRight />
        </Button>
      </div>
    </>
  );
}

function BankRadio({
  bank,
  active,
  onSelect,
}: {
  bank: BankDetails;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" onClick={onSelect} className="block w-full text-left">
      <Card
        variant={active ? "elevated" : "default"}
        className={cn(
          "flex items-center gap-4 p-5 transition-all",
          active
            ? "border-brand ring-2 ring-brand/25"
            : "hover:-translate-y-px hover:border-foreground/15 hover:shadow-lift",
        )}
      >
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
            active ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          <Banknote className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium text-foreground">
              {bank.label ?? bank.bankName ?? "Bank account"}
            </span>
            {bank.isDefault && (
              <Badge variant="secondary" className="h-5 gap-1">
                <Star className="size-3" />
                Default
              </Badge>
            )}
          </div>
          <div className="mt-0.5 truncate text-sm text-muted-foreground">
            {bank.bankName ? `${bank.bankName} · ` : ""}
            {bank.bankAccountNumberMasked}
            {bank.bankIfsc ? ` · ${bank.bankIfsc}` : ""}
          </div>
        </div>
        <div
          className={cn(
            "flex size-6 items-center justify-center rounded-full border transition-colors",
            active
              ? "border-brand bg-brand text-brand-foreground"
              : "border-border text-transparent",
          )}
          aria-hidden="true"
        >
          <Check className="size-3.5" />
        </div>
      </Card>
    </button>
  );
}
