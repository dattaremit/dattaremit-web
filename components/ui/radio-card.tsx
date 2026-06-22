"use client";

import { Check } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RadioCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  active: boolean;
  onSelect: () => void;
  /** Single-row, title-only variant: tighter spacing, no subtitle, no trailing
   *  check. Selection reads from the brand border + ring. Used when several
   *  cards share one row. */
  compact?: boolean;
}

/**
 * A single selectable card in a radio group: leading icon, title + subtitle,
 * and a trailing check that fills in when active. The shared building block
 * behind the self-account and payment-method pickers so they stay visually
 * consistent.
 */
export function RadioCard({ icon, title, subtitle, active, onSelect, compact }: RadioCardProps) {
  return (
    <button type="button" onClick={onSelect} className="block w-full text-left">
      <Card
        variant={active ? "elevated" : "default"}
        className={cn(
          "flex flex-row items-center transition-all",
          compact ? "gap-3 p-4" : "gap-4 p-5",
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
          {subtitle && !compact && (
            <span className="mt-0.5 block truncate text-sm text-muted-foreground">{subtitle}</span>
          )}
        </div>
        {!compact && (
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
        )}
      </Card>
    </button>
  );
}
