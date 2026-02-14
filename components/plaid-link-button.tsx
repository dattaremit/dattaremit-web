"use client";

import { useCallback, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlaidLinkToken } from "@/hooks/api";

interface PlaidLinkButtonProps {
  onSuccess: (publicToken: string, metadata: unknown) => void;
  onExit?: () => void;
}

export function PlaidLinkButton({ onSuccess, onExit }: PlaidLinkButtonProps) {
  const { mutate: generateToken, data, isPending } = usePlaidLinkToken();

  const { open, ready } = usePlaidLink({
    token: data?.plaid_token ?? null,
    onSuccess: (publicToken, metadata) => {
      onSuccess(publicToken, metadata);
    },
    onExit: () => {
      onExit?.();
    },
  });

  const handleClick = useCallback(() => {
    if (data?.plaid_token && ready) {
      open();
    } else {
      generateToken(undefined, {
        onSuccess: () => {
          // Token will be set, usePlaidLink will reinitialize
        },
      });
    }
  }, [data?.plaid_token, ready, open, generateToken]);

  // Auto-open Plaid Link when token becomes available and ready
  useEffect(() => {
    if (data?.plaid_token && ready) {
      open();
    }
  }, [data?.plaid_token, ready, open]);

  return (
    <Button onClick={handleClick} disabled={isPending} size="lg">
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Building2 />
      )}
      {isPending ? "Connecting..." : "Link Bank Account"}
    </Button>
  );
}
