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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  useEffect(() => {
    if (!open) {
      setCode("");
      setError(null);
      setSending(false);
      setVerifying(false);
      setFactor(null);
      return;
    }
    if (!session) return;

    let cancelled = false;
    setSending(true);
    setError(null);

    (async () => {
      try {
        const res: SessionVerificationResource = await session.startVerification({
          level: "first_factor",
        });
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
            err instanceof Error ? err.message : "Couldn't send verification code.",
          );
        }
      } finally {
        if (!cancelled) setSending(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, session]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!session || !factor) return;
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
      const message =
        err instanceof Error ? err.message : "Incorrect or expired code.";
      setError(message);
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (!session || !factor) return;
    setSending(true);
    setError(null);
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

        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="step-up-code">Verification code</Label>
            <Input
              id="step-up-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              disabled={busy || !factor}
              maxLength={6}
              placeholder={sending && !factor ? "Sending code…" : "123456"}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}

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
                disabled={busy || code.length < 6 || !factor}
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
