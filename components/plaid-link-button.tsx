"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlaidLinkToken } from "@/hooks/api";

const PLAID_TOKEN_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

interface PlaidLinkButtonProps {
  onSuccess: (publicToken: string, metadata: unknown) => void;
  onExit?: () => void;
}

export function PlaidLinkButton({ onSuccess, onExit }: PlaidLinkButtonProps) {
  const { mutate: generateToken, data, isPending } = usePlaidLinkToken();
  const tokenCreatedAt = useRef<number | null>(null);
  const hasOpened = useRef(false);

  const isTokenExpired = () => {
    if (!tokenCreatedAt.current) return true;
    return Date.now() - tokenCreatedAt.current > PLAID_TOKEN_TTL_MS;
  };

  const { open, ready } = usePlaidLink({
    token: data?.plaid_token ?? null,
    onSuccess: (publicToken, metadata) => {
      hasOpened.current = false;
      onSuccess(publicToken, metadata);
    },
    onExit: () => {
      hasOpened.current = false;
      onExit?.();
    },
    onEvent: (eventName, metadata) => {
      console.log("[Plaid Link Event]", eventName, metadata);
    },
  });

  const handleClick = useCallback(() => {
    if (data?.plaid_token && ready && !isTokenExpired()) {
      if (!hasOpened.current) {
        hasOpened.current = true;
        open();
      }
    } else {
      generateToken(undefined, {
        onSuccess: () => {
          tokenCreatedAt.current = Date.now();
        },
      });
    }
  }, [data?.plaid_token, ready, open, generateToken]);

  // Auto-open Plaid Link when token becomes available and ready
  useEffect(() => {
    if (data?.plaid_token && ready && !hasOpened.current) {
      hasOpened.current = true;
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
