import * as React from "react";
import { cn } from "@/lib/utils";

type FieldProps = React.HTMLAttributes<HTMLDivElement>;

export function Field({ className, ...props }: FieldProps) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

type FieldLabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  optional?: boolean;
};

export function FieldLabel({ className, optional, children, ...props }: FieldLabelProps) {
  return (
    <label
      className={cn("flex items-center gap-1.5 text-sm font-medium text-foreground/90", className)}
      {...props}
    >
      {children}
      {optional && <span className="text-xs font-normal text-muted-foreground/70">(optional)</span>}
    </label>
  );
}

export function FieldHint({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)} {...props} />
  );
}

export function FieldError({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p role="alert" className={cn("text-xs font-medium text-destructive", className)} {...props} />
  );
}
