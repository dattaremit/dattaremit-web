"use client";

import { useFormContext } from "react-hook-form";
import { ArrowLeft, CheckCircle2, MapPin, Pencil, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { RecipientFormData } from "@/schemas/recipient.schema";

interface ReviewStepProps {
  onBack: () => void;
  onSubmit: () => void;
  onEditContact: () => void;
  onEditAddress: () => void;
  submitting?: boolean;
}

/**
 * Step 3 — everything the user entered, grouped by step, with per-section
 * edit links. The CTA commits the create.
 */
export function ReviewStep({
  onBack,
  onSubmit,
  onEditContact,
  onEditAddress,
  submitting,
}: ReviewStepProps) {
  const { getValues } = useFormContext<RecipientFormData>();
  const v = getValues();
  const name = `${v.firstName ?? ""} ${v.lastName ?? ""}`.trim() || "—";

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <h2 className="font-semibold text-2xl text-foreground">Review and confirm</h2>
        <p className="text-sm text-muted-foreground">
          Once KYC starts we can&rsquo;t edit these details. Anything off? Edit now.
        </p>
      </header>

      <ReviewCard icon={<UserRound className="size-4" />} title="Contact" onEdit={onEditContact}>
        <Row label="Name">{name}</Row>
        <Row label="Email">{v.email ?? "—"}</Row>
        <Row label="Phone">
          {v.phoneNumberPrefix} {v.phoneNumber}
        </Row>
      </ReviewCard>

      <ReviewCard icon={<MapPin className="size-4" />} title="Address" onEdit={onEditAddress}>
        <Row label="Street">{v.addressLine1 ?? "—"}</Row>
        <Row label="City">{v.city ?? "—"}</Row>
        <Row label="State">{v.state ?? "—"}</Row>
        <Row label="Postal code">{v.postalCode ?? "—"}</Row>
      </ReviewCard>

      <div className="rounded-xl bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" />
          <span>
            After you tap <strong className="text-foreground">Add recipient</strong>, we&rsquo;ll
            email them a KYC link. You can add their bank account once they&rsquo;re verified.
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <Button type="button" variant="ghost" size="lg" onClick={onBack}>
          <ArrowLeft />
          Back
        </Button>
        <Button type="button" variant="brand" size="lg" onClick={onSubmit} loading={submitting}>
          Add recipient
        </Button>
      </div>
    </div>
  );
}

function ReviewCard({
  icon,
  title,
  onEdit,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </span>
          <span className="font-medium text-sm text-foreground">{title}</span>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          <Pencil className="size-3.5" />
          Edit
        </button>
      </header>
      <div className="space-y-2 px-5 py-4 text-sm">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{children}</span>
    </div>
  );
}
