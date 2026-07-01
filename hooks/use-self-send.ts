"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAnimation } from "motion/react";
import { toast } from "sonner";

import { transferAmountSchema, type TransferAmountFormData } from "@/schemas/transfer.schema";
import type { NreBankAccountFormData } from "@/schemas/nre-bank-account.schema";
import {
  useAccount,
  useAddNreAccount,
  useMyBanks,
  useNreAccount,
  useNreFee,
  useSelfFee,
  useSendLimits,
  useSendToSelf,
} from "@/hooks/api";
import { useExchangeRate } from "@/hooks/api/use-exchange-rate";
import { useSendMoneyState } from "@/hooks/use-send-money-state";
import { useStepUp } from "@/hooks/use-step-up";
import type { PaymentMethod, SelfAccountType } from "@/types/transfer";
import { getServerErrorMessage } from "@/lib/safe-error-message";
import { dollarsToCents, usdToInr } from "@/lib/money";
import { dailyRemaining, validateAmountAgainstLimits, weeklyRemaining } from "@/lib/send-limits";

export type SelfSendStep = "select-account" | "add-nre" | "amount" | "review" | "result";

/**
 * Owns all data, state-machine and side-effect logic for the self-send flow,
 * so the page component is pure presentation. Wires the account/NRE/fee/limits
 * queries, the amount form (with the SSN-tier limit check + shake animation),
 * the NRE-add and send-to-self mutations, and the step-up gate.
 */
export function useSelfSend(init?: { accountType?: SelfAccountType; step?: SelfSendStep }) {
  const { data: account } = useAccount();
  const sendToSelf = useSendToSelf();
  const addNre = useAddNreAccount();
  // Only fetch the linked NRE bank once we know one exists, to show its real
  // bank name / masked number / IFSC in the account picker.
  const { data: nreAccount } = useNreAccount({ enabled: !!account?.hasNreBank });
  // The account picker on /send can deep-link straight into a chosen
  // destination (amount step) or the add-NRE form, seeding these initial values.
  const [accountType, setAccountTypeState] = useState<SelfAccountType>(init?.accountType ?? "NRO");
  const { gate, stepUpElement } = useStepUp({
    title: "Confirm transfer",
    description: "We emailed you a 6-digit code. Enter it to authorize moving funds.",
  });

  const {
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
  } = useSendMoneyState<SelfSendStep>(init?.step ?? "select-account");

  const form = useForm<TransferAmountFormData>({
    resolver: yupResolver(transferAmountSchema) as unknown as Resolver<TransferAmountFormData>,
    // Seed the payment method so a UPI deep-link starts with UPI selected
    // (matches setAccountType's side effect) instead of defaulting to BANK.
    defaultValues: {
      amount: "",
      note: "",
      paymentMethod: init?.accountType === "UPI" ? "UPI" : "BANK",
      upiId: "",
    },
    // Re-run the resolver on every change so the red-border + Continue
    // disabled state track the user as they type, not just on submit.
    mode: "onChange",
  });
  const { data: limits } = useSendLimits();
  // Still fetched for the account picker, which shows the NRE fee rate.
  const { data: selfFee } = useSelfFee();
  // UPI is INR-only, so it routes via the regular (NRO/OFFRAMP) path — never
  // NRE. The destination picker now carries the choice: the "UPI transfer"
  // option drives paymentMethod=UPI; the bank options (NRO/NRE) reset it back
  // to bank and clear any entered VPA so a stale value never rides along.
  const isUpi = accountType === "UPI";
  const setAccountType = (type: SelfAccountType) => {
    if (type === "UPI") {
      form.setValue("paymentMethod", "UPI", { shouldValidate: true });
    } else {
      form.setValue("paymentMethod", "BANK", { shouldValidate: true });
      form.setValue("upiId", "", { shouldValidate: true });
    }
    setAccountTypeState(type);
  };

  const watchedAmount = form.watch("amount");
  const amountError = form.formState.errors.amount?.message;
  const hasAmountError = !!amountError;
  // Block Continue when UPI is selected but the VPA is still missing/invalid.
  const hasUpiError = !!form.formState.errors.upiId;
  const isNre = accountType === "NRE";
  // NRO (regular) shows INR at the live mid-market rate (USD × rate), computed
  // client-side. NRE keeps the server quote, which also carries the rupee fee
  // taken. The NRE quote stays idle unless NRE is selected and the field is
  // error-free.
  const { data: rateData } = useExchangeRate();
  const { data: nreFee } = useNreFee(watchedAmount ?? "", !hasAmountError && isNre);
  // The form value carries over into the review step unchanged, so the same
  // value drives both the amount preview and the review summary.
  const receiveAmount = isNre
    ? (nreFee?.receiveAmount ?? null)
    : usdToInr(watchedAmount ?? "", rateData?.rate);
  const inrFeeLoss = isNre ? (nreFee?.nreFee ?? null) : null;
  // Gate Continue on `limits` being loaded — without it the cumulative
  // daily-cap check short-circuits and a user could submit an amount that
  // the server will then reject.
  const isInvalid = hasAmountError || hasUpiError || !watchedAmount?.trim() || !limits;

  // Layer the SSN-tier / 7-day-cap check on top of yup's schema check.
  useEffect(() => {
    const limitError = validateAmountAgainstLimits(watchedAmount ?? "", limits);
    const current = form.getFieldState("amount").error;
    if (limitError) {
      if (current?.type !== "limits") {
        form.setError("amount", { type: "limits", message: limitError });
      }
    } else if (current?.type === "limits") {
      form.clearErrors("amount");
    }
  }, [watchedAmount, limits, form]);

  // Shake the input on the transition into the invalid state.
  const controls = useAnimation();
  const wasInvalidRef = useRef(false);
  useEffect(() => {
    if (hasAmountError && !wasInvalidRef.current) {
      controls.start({
        x: [0, -8, 8, -6, 6, 0],
        transition: { duration: 0.3, ease: "easeInOut" },
      });
    }
    wasInvalidRef.current = hasAmountError;
  }, [hasAmountError, controls]);

  const hasNreBank = !!account?.hasNreBank;
  // Every user off-ramps their regular (NRO/savings) account to a locally-saved
  // bank added via /api/banks — no Zynk deposit account, no Indian KYC. Its
  // readiness and display digits come from that saved bank.
  const hasRegularAccount = !!account?.hasUserBank;
  const { data: myBanks } = useMyBanks();
  const defaultBank = myBanks?.find((b) => b.isDefault) ?? myBanks?.[0];
  const regularAccountLast4 = defaultBank?.bankAccountNumberMasked?.slice(-4) ?? null;

  const handleAddNre = async (data: NreBankAccountFormData) => {
    try {
      await addNre.mutateAsync({
        bankName: data.bankName,
        branchName: data.branchName || undefined,
        accountHolderName: data.accountHolderName,
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        swiftCode: data.swiftCode || undefined,
      });
      toast.success("NRE account added.");
      // First-time NRE is now linked — proceed straight to the amount step
      // with NRE selected. Re-entering the picker later shows it selectable.
      setAccountType("NRE");
      setStep("amount");
    } catch (err) {
      toast.error(getServerErrorMessage(err, "Failed to add NRE account"));
    }
  };

  // Validate the amount against the cumulative caps one final time, then move
  // to review. Wrapped with form.handleSubmit so it runs the schema first.
  const handleAmountSubmit = form.handleSubmit((data) => {
    const limitError = validateAmountAgainstLimits(data.amount, limits);
    if (limitError) {
      form.setError("amount", { type: "limits", message: limitError });
      return;
    }
    setAmount(data.amount);
    setNote(data.note ?? "");
    setStep("review");
  });

  const handleConfirm = async () => {
    setSendError(null);
    // Track failures via a local variable: setSendError() schedules a state
    // update, but the closure below would still see the previous render's
    // sendError, so we'd never navigate to the result screen on first failure.
    let errorMessage: string | null = null;
    const res = await gate(async () => {
      let amountCents: number;
      try {
        amountCents = dollarsToCents(amount);
      } catch (err) {
        errorMessage = err instanceof Error ? err.message : "Invalid amount";
        return undefined;
      }
      try {
        // UPI is its own destination option; it pays out via the OFFRAMP route.
        return await sendToSelf.mutateAsync({
          payload: {
            amountCents,
            note: note || undefined,
            // NRO selection routes via the regular OFFRAMP path.
            payoutType: accountType === "NRE" ? "NRE" : "OFFRAMP",
            paymentMethod: isUpi ? "UPI" : "BANK",
            upiId: isUpi ? form.getValues("upiId") : undefined,
          },
          idempotencyKey,
        });
      } catch (err) {
        errorMessage = err instanceof Error ? err.message : "Transfer failed";
        return undefined;
      }
    });
    if (res) {
      setTransactionId(res.transactionId);
      setStep("result");
    } else if (errorMessage) {
      setSendError(errorMessage);
      setStep("result");
    }
  };

  const retryFromResult = () => {
    setSendError(null);
    resetIdempotencyKey();
    setStep("review");
  };

  const limitsHint = limits
    ? `$${dailyRemaining(limits.past24HoursAmount, limits.hasSsn).toLocaleString("en-US", {
        maximumFractionDigits: 2,
      })} left today · $${weeklyRemaining(limits.past7DaysAmount).toLocaleString("en-US", {
        maximumFractionDigits: 2,
      })} left this week`
    : undefined;

  return {
    // queries / derived account state
    account,
    nreAccount,
    selfFee,
    hasNreBank,
    hasRegularAccount,
    regularAccountLast4,
    // step machine
    step,
    setStep,
    accountType,
    setAccountType,
    isUpi,
    // Resolved payout method for the review/result screens.
    paymentMethod: (isUpi ? "UPI" : "BANK") as PaymentMethod,
    upiId: form.watch("upiId"),
    amount,
    note,
    transactionId,
    sendError,
    // amount form
    form,
    controls,
    limitsHint,
    // Live USD→INR rate for the amount field's INR-entry toggle.
    rate: rateData?.rate,
    receiveAmount,
    inrFeeLoss,
    hasAmountError,
    isInvalid,
    handleAmountSubmit,
    // mutations / actions
    addNre,
    handleAddNre,
    sendToSelf,
    handleConfirm,
    retryFromResult,
    // step-up gate UI
    stepUpElement,
  };
}
