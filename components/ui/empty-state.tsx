import * as React from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-20 h-40 bg-[radial-gradient(circle_at_center,oklch(from_var(--brand)_l_c_h_/_0.18),transparent_70%)]"
      />
      {icon && (
        <div className="relative flex size-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-soft">
          {icon}
        </div>
      )}
      <div className="relative flex flex-col gap-1.5">
        <h3 className="font-semibold text-xl text-foreground">{title}</h3>
        {description && (
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="relative mt-2">{action}</div>}
    </div>
  );
}
