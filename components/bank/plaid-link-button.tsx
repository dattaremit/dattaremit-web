"use client";

import { useCallback, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { usePlaidLink } from "react-plaid-link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlaidLinkToken } from "@/hooks/api";

interface PlaidLinkButtonProps {
  onSuccess: (publicToken: string, metadata: unknown) => void;
  onExit?: () => void;
  label?: string;
}

export function PlaidLinkButton({
  onSuccess,
  onExit,
  label = "Link bank account",
}: PlaidLinkButtonProps) {
  const { user: clerkUser } = useUser();
  const { mutate: generateToken, data, isPending, reset } = usePlaidLinkToken();
  const hasOpened = useRef(false);

  useEffect(() => {
    reset();
    hasOpened.current = false;
  }, [clerkUser?.id, reset]);

  const { open, ready } = usePlaidLink({
    token: data?.plaid_token ?? null,
    onSuccess: (publicToken, metadata) => {
      hasOpened.current = false;
      reset();
      onSuccess(publicToken, metadata);
    },
    onExit: () => {
      hasOpened.current = false;
      reset();
      onExit?.();
    },
  });

  const handleClick = useCallback(() => {
    hasOpened.current = false;
    generateToken();
  }, [generateToken]);

  useEffect(() => {
    if (data?.plaid_token && ready && !hasOpened.current) {
      hasOpened.current = true;
      open();
    }
  }, [data?.plaid_token, ready, open]);

  return (
    <Button onClick={handleClick} variant="brand" size="lg" loading={isPending}>
      {!isPending && <Building2 />}
      {isPending ? "Connecting…" : label}
    </Button>
  );
}
