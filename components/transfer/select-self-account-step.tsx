"use client";

import { ArrowLeft, ArrowRight, Check, Landmark, Plus, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import type { NreBankAccount } from "@/types/api";
import type { SelfAccountType } from "@/types/transfer";
import { NreFeeNotice } from "@/components/transfer/nre-fee-notice";

/** Last-4 masked label for a linked NRE account, e.g.
 *  "HDFC Bank •••• 9012 · HDFC0001234". Falls back gracefully when a field
 *  is missing. */
function nreAccountSummary(nre: NreBankAccount): string {
  const last4 = nre.accountNumber ? nre.accountNumber.slice(-4) : null;
  return [nre.bankName, last4 ? `•••• ${last4}` : null, nre.ifscCode].filter(Boolean).join(" · ");
}

interface SelectSelfAccountStepProps {
  /** Whether the user already has a linked NRE account. When false, picking
   *  NRE routes to the add-NRE form instead of selecting it. */
  hasNreAccount: boolean;
  /** The linked NRE account, when loaded. Used to show the real bank details
   *  (name, masked number, IFSC) instead of a generic label. */
  nreAccount?: NreBankAccount | null;
  /** Last 4 digits of the regular (NRO/savings) deposit account, when known.
   *  Shown masked on the regular card; falls back to a generic label when
   *  absent (e.g. accounts linked before it was captured). */
  regularAccountLast4?: string | null;
  /** Fee fraction charged on NRE self-transfers (0.003 = 0.3%). When > 0 and
   *  NRE is selected, a warning is shown so the user knows about the cut. */
  nreFeeRate?: number;
  /** Whether the NRE option is offered at all. US citizens off-ramp to a
   *  regular account only — NRE is an NRI-only flow — so it's hidden for them. */
  allowNre?: boolean;
  selected: SelfAccountType;
  onSelect: (type: SelfAccountType) => void;
  /** Called when the user wants to add NRE details for the first time. */
  onAddNre: () => void;
  onContinue: () => void;
  onBack: () => void;
}

/**
 * First step of the self-send flow: pick which of the user's own Indian
 * accounts the money lands in. The regular (NRO) deposit account always
 * exists here; NRE is either selectable (already linked) or gated behind an
 * "add details" form (first-time payout).
 */
export function SelectSelfAccountStep({
  hasNreAccount,
  nreAccount,
  regularAccountLast4,
  nreFeeRate,
  allowNre = true,
  selected,
  onSelect,
  onAddNre,
  onContinue,
  onBack,
}: SelectSelfAccountStepProps) {
  return (
    <>
      <PageHeader
        eyebrow="Self-send"
        title={
          <>
            Which <span className="text-brand">account</span>?
          </>
        }
        subtitle="Choose where the money should land in India."
      />

      <div className="space-y-3">
        <AccountRadio
          icon={<Wallet className="size-5" />}
          title="Regular account"
          subtitle={
            regularAccountLast4
              ? `•••• ${regularAccountLast4}`
              : "Your linked NRO / savings deposit account"
          }
          active={selected === "NRO"}
          onSelect={() => onSelect("NRO")}
        />

        {allowNre &&
          (hasNreAccount ? (
            <AccountRadio
              icon={<Landmark className="size-5" />}
              title="NRE account"
              subtitle={
                nreAccount
                  ? nreAccountSummary(nreAccount)
                  : "Your linked Non-Resident External account"
              }
              active={selected === "NRE"}
              onSelect={() => onSelect("NRE")}
            />
          ) : (
            <AddAccountCard
              icon={<Landmark className="size-5" />}
              title="NRE account"
              subtitle="Add your Non-Resident External account details"
              onAdd={onAddNre}
            />
          ))}

        {allowNre && selected === "NRE" && hasNreAccount && nreFeeRate != null && (
          <NreFeeNotice feeRate={nreFeeRate} />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <Button type="button" variant="ghost" size="lg" onClick={onBack}>
          <ArrowLeft />
          Back
        </Button>
        <Button type="button" variant="brand" size="lg" onClick={onContinue}>
          Continue
          <ArrowRight />
        </Button>
      </div>
    </>
  );
}

function AccountRadio({
  icon,
  title,
  subtitle,
  active,
  onSelect,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" onClick={onSelect} className="block w-full text-left">
      <Card
        variant={active ? "elevated" : "default"}
        className={cn(
          "flex flex-row items-center gap-4 p-5 transition-all",
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
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <span className="block truncate font-medium text-foreground">{title}</span>
          <span className="mt-0.5 block truncate text-sm text-muted-foreground">{subtitle}</span>
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

function AddAccountCard({
  icon,
  title,
  subtitle,
  onAdd,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onAdd: () => void;
}) {
  return (
    <button type="button" onClick={onAdd} className="block w-full text-left">
      <Card
        variant="default"
        className="flex flex-row items-center gap-4 border-dashed p-5 transition-all hover:-translate-y-px hover:border-brand/40 hover:shadow-lift"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <span className="block truncate font-medium text-foreground">{title}</span>
          <span className="mt-0.5 block truncate text-sm text-muted-foreground">{subtitle}</span>
        </div>
        <div className="flex size-6 items-center justify-center rounded-full bg-brand/15 text-brand">
          <Plus className="size-3.5" />
        </div>
      </Card>
    </button>
  );
}
