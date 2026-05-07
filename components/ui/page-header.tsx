import * as React from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  back?: React.ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, subtitle, action, back, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {back && <div>{back}</div>}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-2 min-w-0">
          <h1 className="font-semibold text-3xl leading-[1.05] text-foreground sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
