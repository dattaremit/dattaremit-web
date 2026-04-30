"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2.5 has-disabled:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-2.5", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};
  const filled = Boolean(char);

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      data-filled={filled}
      className={cn(
        "relative flex h-14 w-12 items-center justify-center rounded-xl border bg-card/70 backdrop-blur-sm",
        "font-semibold text-2xl tabular text-foreground",
        "shadow-soft transition-all duration-200 outline-none",
        "border-border",
        "data-[filled=true]:border-foreground/30 data-[filled=true]:bg-card",
        "data-[active=true]:border-brand data-[active=true]:ring-[3px] data-[active=true]:ring-brand/30 data-[active=true]:z-10 data-[active=true]:scale-[1.04]",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        "sm:h-16 sm:w-14 sm:text-3xl",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-brand h-6 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      role="separator"
      className="text-muted-foreground/60"
      {...props}
    >
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
