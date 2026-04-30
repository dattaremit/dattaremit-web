import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium tracking-tight transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:shadow-lift hover:-translate-y-px active:translate-y-0 active:shadow-soft",
        brand:
          "bg-brand text-brand-foreground shadow-soft hover:shadow-glow hover:-translate-y-px active:translate-y-0",
        destructive:
          "bg-destructive text-white shadow-soft hover:bg-destructive/90 focus-visible:ring-destructive/30 dark:bg-destructive/70",
        outline:
          "border border-border bg-card/60 backdrop-blur-sm shadow-soft hover:bg-accent hover:text-accent-foreground hover:border-foreground/20",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-foreground underline-offset-4 hover:underline decoration-brand decoration-2",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        xs: "h-7 gap-1 rounded-md px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 rounded-md gap-1.5 px-3.5 has-[>svg]:px-3",
        lg: "h-12 rounded-xl px-7 text-base has-[>svg]:px-5",
        xl: "h-14 rounded-xl px-8 text-base has-[>svg]:px-6",
        icon: "size-10",
        "icon-xs": "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  const isDisabled = disabled || loading;

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" />
          <span className="opacity-80">{children}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
