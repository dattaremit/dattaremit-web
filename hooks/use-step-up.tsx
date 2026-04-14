"use client";

import { useCallback, useRef, useState } from "react";
import { StepUpDialog } from "@/components/step-up-dialog";

export interface StepUpOptions {
  title?: string;
  description?: string;
}

/**
 * Gate a protected action behind password re-verification.
 *
 *   const { gate, stepUpElement } = useStepUp();
 *   // ...
 *   {stepUpElement}
 *   const onSend = async () => {
 *     await gate(async () => {
 *       await sendMoney.mutateAsync(...);
 *     });
 *   };
 *
 * Matches the shape of mobile's use-biometric-gate so call sites can stay
 * symmetric across platforms.
 */
export function useStepUp(defaultOptions?: StepUpOptions) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<StepUpOptions | undefined>(defaultOptions);
  const resolverRef = useRef<{
    resolve: (verified: boolean) => void;
  } | null>(null);

  const requestVerification = useCallback(
    (opts?: StepUpOptions) => {
      if (opts) setOptions({ ...defaultOptions, ...opts });
      else setOptions(defaultOptions);
      setOpen(true);
      return new Promise<boolean>((resolve) => {
        resolverRef.current = { resolve };
      });
    },
    [defaultOptions],
  );

  const gate = useCallback(
    async <T,>(fn: () => Promise<T> | T, opts?: StepUpOptions): Promise<T | undefined> => {
      const verified = await requestVerification(opts);
      if (!verified) return undefined;
      return fn();
    },
    [requestVerification],
  );

  const stepUpElement = (
    <StepUpDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next && resolverRef.current) {
          // Dialog closed without confirming — resolve false once
          const { resolve } = resolverRef.current;
          resolverRef.current = null;
          resolve(false);
        }
      }}
      title={options?.title}
      description={options?.description}
      onVerified={() => {
        if (resolverRef.current) {
          const { resolve } = resolverRef.current;
          resolverRef.current = null;
          resolve(true);
        }
      }}
      onCancel={() => {
        if (resolverRef.current) {
          const { resolve } = resolverRef.current;
          resolverRef.current = null;
          resolve(false);
        }
      }}
    />
  );

  return { gate, requestVerification, stepUpElement };
}
