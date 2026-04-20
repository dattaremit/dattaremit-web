"use client";

import * as React from "react";
import { motion } from "motion/react";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { EASE_OUT_SMOOTH } from "@/constants/motion";
import { cn } from "@/lib/utils";

type OtpFormProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  loading?: boolean;
  error?: string;
  submitLabel?: string;
  resendLabel?: string;
  onResend?: () => void | Promise<void>;
  resendCountdown?: number;
  autoSubmit?: boolean;
  className?: string;
};

export function OtpForm({
  length = 6,
  value,
  onChange,
  onSubmit,
  loading = false,
  error,
  submitLabel = "Verify",
  resendLabel = "Resend code",
  onResend,
  resendCountdown,
  autoSubmit = true,
  className,
}: OtpFormProps) {
  const lastSubmittedRef = React.useRef("");

  React.useEffect(() => {
    if (
      autoSubmit &&
      value.length === length &&
      lastSubmittedRef.current !== value &&
      !loading
    ) {
      lastSubmittedRef.current = value;
      void onSubmit();
    }
  }, [value, length, autoSubmit, loading, onSubmit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.length === length) void onSubmit();
  };

  const slots = React.useMemo(
    () => Array.from({ length }, (_, i) => i),
    [length],
  );

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-5", className)}>
      <div className="flex flex-col items-center gap-3">
        <InputOTP
          maxLength={length}
          value={value}
          onChange={onChange}
          autoFocus
        >
          <InputOTPGroup>
            {slots.map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.05 + i * 0.06,
                  duration: 0.4,
                  ease: EASE_OUT_SMOOTH,
                }}
              >
                <InputOTPSlot index={i} aria-invalid={!!error} />
              </motion.div>
            ))}
          </InputOTPGroup>
        </InputOTP>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium text-destructive"
          >
            {error}
          </motion.p>
        )}
      </div>

      <Button
        type="submit"
        variant="brand"
        size="lg"
        className="w-full"
        loading={loading}
        disabled={value.length < length}
      >
        {submitLabel}
      </Button>

      {onResend && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => void onResend()}
            disabled={!!resendCountdown && resendCountdown > 0}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60 disabled:hover:text-muted-foreground"
          >
            {resendCountdown && resendCountdown > 0
              ? `${resendLabel} in ${resendCountdown}s`
              : resendLabel}
          </button>
        </div>
      )}
    </form>
  );
}
