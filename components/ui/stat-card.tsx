import * as React from "react";
import { cn } from "@/lib/utils";

type StatCardProps = React.HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: boolean;
};

export function StatCard({ label, value, hint, icon, accent, className, ...props }: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:shadow-lift hover:-translate-y-0.5",
        accent && "border-brand/30 bg-gradient-to-br from-brand-soft/40 via-card to-card",
        className,
      )}
      {...props}
    >
      {accent && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-brand/20 blur-3xl"
        />
      )}
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {icon && (
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors",
              accent
                ? "bg-brand/15 text-brand"
                : "bg-muted text-muted-foreground group-hover:text-foreground",
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="relative mt-3 flex items-baseline gap-2">
        <span
          className={cn("font-semibold text-3xl leading-none tabular text-foreground sm:text-4xl")}
        >
          {value}
        </span>
      </div>
      {hint && <p className="relative mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
