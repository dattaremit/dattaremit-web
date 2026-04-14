"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
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

/**
 * Confirms the signed-in user's identity by re-verifying their password.
 * Uses Clerk's `user.verifyPassword()` — purely a credential check, does not
 * mutate the session. Passkey-based step-up would additionally require a
 * server challenge/verify endpoint, which this client-only flow avoids.
 */
export function StepUpDialog({
  open,
  onOpenChange,
  title = "Confirm it's you",
  description = "Re-enter your password to authorize this action.",
  onVerified,
  onCancel,
}: StepUpDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        verified?: boolean;
        message?: string;
      };
      if (res.ok && data.verified) {
        onVerified();
        onOpenChange(false);
      } else {
        setError(data.message ?? "Password did not match.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !loading) onCancel?.();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="step-up-password">Password</Label>
            <Input
              id="step-up-password"
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onCancel?.();
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || password.length === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
