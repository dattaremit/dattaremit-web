"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { StepTransition } from "@/components/motion/step-transition";
import { Stepper, type StepperStep } from "@/components/recipients/wizard/stepper";
import { ContactStep } from "@/components/recipients/wizard/contact-step";
import { AddressStep } from "@/components/recipients/wizard/address-step";
import { ReviewStep } from "@/components/recipients/wizard/review-step";
import { SuccessScreen } from "@/components/recipients/wizard/success-screen";
import { SharedRecipientCard } from "@/components/recipients/shared-recipient-card";
import { useCheckRecipientIdentity, useCreateRecipient } from "@/hooks/api";
import { recipientSchema, type RecipientFormData } from "@/schemas/recipient.schema";
import type { CheckIdentityResult, Recipient } from "@/types/recipient";

type WizardStep = "contact" | "address" | "review" | "success";

const STEPS: readonly StepperStep[] = [
  { id: "contact", label: "Contact" },
  { id: "address", label: "Address" },
  { id: "review", label: "Review" },
];

const DRAFT_KEY = "dattaremit:new-recipient-draft";
// Drafts older than this are dropped on read. Without an expiry, a wizard
// abandoned months ago could pre-fill stale contact info that now belongs
// to a different person, or whose KYC has since changed.
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type StoredDraft = {
  savedAt: number;
  values: Partial<RecipientFormData>;
};

function readDraft(): Partial<RecipientFormData> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredDraft> | Partial<RecipientFormData>;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof (parsed as StoredDraft).savedAt !== "number" ||
      typeof (parsed as StoredDraft).values !== "object"
    ) {
      // Legacy format (raw values, pre-expiry) or anything malformed: clear it
      // so we don't carry it forward and so the user starts fresh.
      window.localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    const { savedAt, values } = parsed as StoredDraft;
    if (Date.now() - savedAt > DRAFT_TTL_MS) {
      window.localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return values;
  } catch {
    return null;
  }
}

function writeDraft(values: Partial<RecipientFormData>) {
  if (typeof window === "undefined") return;
  try {
    const payload: StoredDraft = { savedAt: Date.now(), values };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch {
    // Storage may be full or disabled — silently drop the draft.
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

type Match = Extract<CheckIdentityResult, { exists: true }>;

export function NewRecipientWizard() {
  const router = useRouter();
  const checkIdentity = useCheckRecipientIdentity();
  const createRecipient = useCreateRecipient();

  const [step, setStep] = useState<WizardStep>("contact");
  const [match, setMatch] = useState<Match | null>(null);
  const [dismissedMatchId, setDismissedMatchId] = useState<string | null>(null);
  const [created, setCreated] = useState<{
    recipient: Recipient;
    wasShared: boolean;
  } | null>(null);
  // Cache the last identity-check tuple → result so the user can bounce
  // back to the contact step without re-hitting the API on every Continue.
  const identityCache = useRef<{
    key: string;
    result: CheckIdentityResult;
  } | null>(null);

  const form = useForm<RecipientFormData>({
    resolver: yupResolver(recipientSchema) as unknown as Resolver<RecipientFormData>,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumberPrefix: "+91",
      phoneNumber: "",
      addressLine1: "",
      city: "",
      state: "",
      postalCode: "",
      ...(readDraft() ?? {}),
    },
    mode: "onBlur",
  });

  // Persist form state to localStorage so a user who accidentally navigates
  // away (or reloads) doesn't lose what they typed. Cleared on success.
  // React Compiler can't memoize watch — that's fine here, the wizard is
  // already a leaf-ish component and writes are cheap.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const sub = form.watch((values) => {
      writeDraft(values as Partial<RecipientFormData>);
    });
    return () => sub.unsubscribe();
  }, [form]);

  const activeIndex = step === "success" ? STEPS.length - 1 : STEPS.findIndex((s) => s.id === step);

  const handleContactContinue = async () => {
    const ok = await form.trigger([
      "firstName",
      "lastName",
      "email",
      "phoneNumberPrefix",
      "phoneNumber",
    ]);
    if (!ok) return;

    const { email, phoneNumberPrefix, phoneNumber } = form.getValues();
    const cacheKey = `${email.trim().toLowerCase()}|${phoneNumberPrefix}|${phoneNumber.trim()}`;
    try {
      const cached = identityCache.current;
      const result =
        cached && cached.key === cacheKey
          ? cached.result
          : await checkIdentity.mutateAsync({
              email,
              phoneNumberPrefix,
              phoneNumber,
            });
      identityCache.current = { key: cacheKey, result };
      if (result.exists) {
        if (result.recipient.id === dismissedMatchId) {
          // The user already said "not them" — respect it.
          setStep("address");
          return;
        }
        setMatch(result);
        return;
      }
      setStep("address");
    } catch {
      // Identity check is a best-effort shortcut; server still dedups on create.
      setStep("address");
    }
  };

  const handleAddressContinue = async () => {
    const ok = await form.trigger(["addressLine1", "city", "state", "postalCode"]);
    if (!ok) return;
    setStep("review");
  };

  const submitCreate = async (opts?: { shared?: boolean }) => {
    const data = form.getValues();
    try {
      const recipient = await createRecipient.mutateAsync(data);
      clearDraft();
      // The success screen MUST honor recipient.shared even when the user
      // never saw a match card. The check-identity result is cached on the
      // contact step, so a brand-new shared identity created by another user
      // between cache-time and submit-time is invisible to us — the server's
      // global dedup will silently link instead of create, returning shared:
      // true. Always trust recipient.shared, never assume opts.shared alone.
      setCreated({
        recipient,
        wasShared: Boolean(opts?.shared || recipient.shared),
      });
      setStep("success");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add recipient");
    }
  };

  const handleMatchConfirm = async () => {
    if (!match) return;
    if (match.alreadyLinked) {
      clearDraft();
      router.push(`/recipients/${match.recipient.id}`);
      return;
    }
    await submitCreate({ shared: true });
    setMatch(null);
  };

  const handleMatchDismiss = () => {
    if (match) setDismissedMatchId(match.recipient.id);
    setMatch(null);
    setStep("address");
  };

  return (
    <Form {...form}>
      {step !== "success" && (
        <div className="mb-6">
          <Stepper steps={STEPS} activeIndex={activeIndex} />
        </div>
      )}

      <Card variant="elevated" className="p-6 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          {match ? (
            <StepTransition key="match">
              <SharedRecipientCard
                match={match}
                onConfirm={handleMatchConfirm}
                onDismiss={handleMatchDismiss}
                confirming={createRecipient.isPending}
              />
            </StepTransition>
          ) : step === "contact" ? (
            <StepTransition key="contact">
              <ContactStep onContinue={handleContactContinue} checking={checkIdentity.isPending} />
            </StepTransition>
          ) : step === "address" ? (
            <StepTransition key="address">
              <AddressStep onBack={() => setStep("contact")} onContinue={handleAddressContinue} />
            </StepTransition>
          ) : step === "review" ? (
            <StepTransition key="review">
              <ReviewStep
                onBack={() => setStep("address")}
                onEditContact={() => setStep("contact")}
                onEditAddress={() => setStep("address")}
                onSubmit={() => submitCreate()}
                submitting={createRecipient.isPending}
              />
            </StepTransition>
          ) : (
            created && (
              <StepTransition key="success">
                <SuccessScreen recipient={created.recipient} wasShared={created.wasShared} />
              </StepTransition>
            )
          )}
        </AnimatePresence>
      </Card>
    </Form>
  );
}
