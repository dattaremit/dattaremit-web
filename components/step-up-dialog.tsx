"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { useSession } from "@clerk/nextjs";
import type {
  EmailCodeFactor,
  SessionVerificationResource,
} from "@clerk/shared/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const OTP_LENGTH = 6;

export interface StepUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onVerified: () => void;
  onCancel?: () => void;
}

export function StepUpDialog({
  open,
  onOpenChange,
  title = "Confirm it's you",
  description = "We emailed you a 6-digit code. Enter it to authorize this action.",
  onVerified,
  onCancel,
}: StepUpDialogProps) {
  const { session } = useSession();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [factor, setFactor] = useState<EmailCodeFactor | null>(null);

  const onVerifiedRef = useRef(onVerified);
  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onVerifiedRef.current = onVerified;
    onOpenChangeRef.current = onOpenChange;
  });

  // Guards the send flow against React-strict-mode double mounts and Clerk
  // session-reference churn (startVerification mutates the session, which
  // would otherwise re-fire the effect mid-flight).
  const hasStartedRef = useRef(false);
  const lastSubmittedRef = useRef("");

  useEffect(() => {
    if (!open) {
      setCode("");
      setError(null);
      setSending(false);
      setVerifying(false);
      setFactor(null);
      hasStartedRef.current = false;
      lastSubmittedRef.current = "";
      return;
    }
    if (!session) return;
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let cancelled = false;
    setSending(true);
    setError(null);

    (async () => {
      try {
        const res: SessionVerificationResource =
          await session.startVerification({ level: "first_factor" });
        if (cancelled) return;
        if (res.status !== "needs_first_factor") {
          onVerifiedRef.current();
          onOpenChangeRef.current(false);
          return;
        }
        const emailFactor = res.supportedFirstFactors?.find(
          (f): f is EmailCodeFactor => f.strategy === "email_code",
        );
        if (!emailFactor) {
          setError(
            "No email on file to send a verification code to. Add an email address in your account.",
          );
          return;
        }
        await session.prepareFirstFactorVerification({
          strategy: "email_code",
          emailAddressId: emailFactor.emailAddressId,
        });
        if (cancelled) return;
        setFactor(emailFactor);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Couldn't send verification code.",
          );
          // Allow the user to close+reopen to retry if the first send failed.
          hasStartedRef.current = false;
        }
      } finally {
        if (!cancelled) setSending(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, session]);

  const submit = async () => {
    if (!session || !factor || code.length < OTP_LENGTH) return;
    if (lastSubmittedRef.current === code) return;
    lastSubmittedRef.current = code;
    setVerifying(true);
    setError(null);
    try {
      await session.attemptFirstFactorVerification({
        strategy: "email_code",
        code,
      });
      onVerified();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Incorrect or expired code.",
      );
      // Let the user retype and try again.
      lastSubmittedRef.current = "";
    } finally {
      setVerifying(false);
    }
  };

  // Auto-submit once the full code is entered.
  useEffect(() => {
    if (!factor) return;
    if (code.length !== OTP_LENGTH) return;
    if (verifying) return;
    if (lastSubmittedRef.current === code) return;
    void submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, factor, verifying]);

  const resend = async () => {
    if (!session || !factor) return;
    setSending(true);
    setError(null);
    setCode("");
    lastSubmittedRef.current = "";
    try {
      await session.prepareFirstFactorVerification({
        strategy: "email_code",
        emailAddressId: factor.emailAddressId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't resend code.");
    } finally {
      setSending(false);
    }
  };

  const busy = sending || verifying;
  const target = factor?.safeIdentifier ?? "your email";
  const slots = Array.from({ length: OTP_LENGTH }, (_, i) => i);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) onCancel?.();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {factor ? `Enter the 6-digit code we sent to ${target}.` : description}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
          className="space-y-4"
        >
          <div className="flex justify-center py-2">
            <InputOTP
              maxLength={OTP_LENGTH}
              value={code}
              onChange={setCode}
              disabled={busy || !factor}
              autoFocus
            >
              <InputOTPGroup>
                {slots.map((i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    aria-invalid={!!error}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <DialogFooter className="items-center gap-2 sm:justify-between sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resend}
              disabled={busy || !factor}
            >
              {sending && factor ? "Resending…" : "Resend code"}
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onCancel?.();
                  onOpenChange(false);
                }}
                disabled={verifying}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={busy || code.length < OTP_LENGTH || !factor}
              >
                {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
