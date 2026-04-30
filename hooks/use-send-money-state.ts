"use client";

import { useState } from "react";
import { generateIdempotencyKey } from "@/lib/idempotency";

/**
 * Shared state for the send-money flows (external and self-send).
 * Pages differ only in their step-enum shape, so the generic keeps each
 * page's literal union while the identical amount/note/result/error/key
 * bookkeeping lives here.
 */
export function useSendMoneyState<S extends string>(initialStep: S) {
  const [step, setStep] = useState<S>(initialStep);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [transactionId, setTransactionId] = useState<string>();
  const [sendError, setSendError] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => generateIdempotencyKey());

  const resetIdempotencyKey = () => setIdempotencyKey(generateIdempotencyKey());

  return {
    step,
    setStep,
    amount,
    setAmount,
    note,
    setNote,
    transactionId,
    setTransactionId,
    sendError,
    setSendError,
    idempotencyKey,
    resetIdempotencyKey,
  };
}
