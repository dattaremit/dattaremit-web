"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { getClerkErrorMessage } from "@/utils/clerk-error";

import { AuthShell } from "@/components/ui/auth-shell";
import { OtpForm } from "@/components/ui/otp-form";

interface EmailVerificationFormProps {
  email: string;
  onBack?: () => void;
}

export function EmailVerificationForm({ email, onBack }: EmailVerificationFormProps) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const onVerify = async () => {
    if (!isLoaded) return;

    setError(undefined);
    setLoading(true);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        setError("Verification could not be completed.");
      }
    } catch (err: unknown) {
      const message = getClerkErrorMessage(err, "Verification failed. Please try again.");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (!isLoaded) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setCode("");
      setError(undefined);
      toast.success("Code sent. Check your inbox.");
    } catch (err: unknown) {
      toast.error(getClerkErrorMessage(err, "Couldn't resend the code."));
    }
  };

  return (
    <AuthShell
      eyebrow="Verify"
      title={
        <>
          Check your
          <br />
          <span className="text-brand">inbox</span>.
        </>
      }
      subtitle={
        <>
          We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
        </>
      }
      back={onBack ? { href: "#", label: "Back" } : undefined}
    >
      <OtpForm
        value={code}
        onChange={(v) => {
          setCode(v);
          if (error) setError(undefined);
        }}
        onSubmit={onVerify}
        loading={loading}
        error={error}
        submitLabel="Verify email"
        onResend={onResend}
      />
    </AuthShell>
  );
}
