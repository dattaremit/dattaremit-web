"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  forgotPasswordEmailSchema,
  resetPasswordSchema,
  type ForgotPasswordEmailFormData,
  type ResetPasswordFormData,
} from "@/schemas/auth.schema";
import { toast } from "sonner";
import { getClerkErrorMessage } from "@/utils/clerk-error";

import Image from "next/image";

import { AuthShell } from "@/components/ui/auth-shell";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import { OtpForm } from "@/components/ui/otp-form";
import { ROUTES } from "@/constants/routes";

const RESEND_COOLDOWN_SECONDS = 30;

type Step = "email" | "code" | "password";

export default function ForgotPasswordPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>();
  const [resendCountdown, setResendCountdown] = useState(0);

  const emailForm = useForm<ForgotPasswordEmailFormData>({
    resolver: yupResolver(forgotPasswordEmailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const sendResetCode = async (identifier: string) => {
    if (!isLoaded) return false;
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier,
      });
      setResendCountdown(RESEND_COOLDOWN_SECONDS);
      return true;
    } catch (err: unknown) {
      toast.error(getClerkErrorMessage(err, "Could not send reset code. Please try again."));
      return false;
    }
  };

  const onSubmitEmail = async (data: ForgotPasswordEmailFormData) => {
    setLoading(true);
    const ok = await sendResetCode(data.email);
    setLoading(false);
    if (ok) {
      setEmail(data.email);
      setStep("code");
    }
  };

  const onVerifyCode = async () => {
    if (!isLoaded) return;
    setOtpError(undefined);
    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      });

      if (result.status === "needs_new_password") {
        setStep("password");
      } else {
        setOtpError("Verification failed. Please try again.");
      }
    } catch (err: unknown) {
      setOtpError(getClerkErrorMessage(err, "Invalid code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const onResendCode = async () => {
    if (resendCountdown > 0) return;
    setCode("");
    setOtpError(undefined);
    setLoading(true);
    const ok = await sendResetCode(email);
    setLoading(false);
    if (ok) toast.success("A new code has been sent to your email.");
  };

  const onSubmitPassword = async (data: ResetPasswordFormData) => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const result = await signIn.resetPassword({ password: data.password });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        toast.success("Password reset successfully.");
        router.replace(ROUTES.ROOT);
        return;
      }

      toast.error("Password reset could not be completed.");
    } catch (err: unknown) {
      toast.error(getClerkErrorMessage(err, "Password reset failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  if (step === "code") {
    return (
      <AuthShell
        title={
          <Image
            src="/logo.png"
            alt="Dattaremit"
            width={140}
            height={119}
            priority
            className="mx-auto block h-28 w-auto"
          />
        }
        subtitle={
          <>
            We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.{" "}
            <button
              onClick={() => setStep("email")}
              className="font-semibold text-brand hover:text-foreground"
            >
              Use a different email
            </button>
          </>
        }
      >
        <OtpForm
          value={code}
          onChange={(v) => {
            setCode(v);
            if (otpError) setOtpError(undefined);
          }}
          onSubmit={onVerifyCode}
          loading={loading}
          error={otpError}
          submitLabel="Verify code"
          onResend={onResendCode}
          resendCountdown={resendCountdown}
        />
      </AuthShell>
    );
  }

  if (step === "password") {
    return (
      <AuthShell
        title={
          <Image
            src="/logo.png"
            alt="Dattaremit"
            width={140}
            height={119}
            priority
            className="mx-auto block h-28 w-auto"
          />
        }
        subtitle="Choose a strong password you haven't used before."
      >
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
            <TextField
              control={passwordForm.control}
              name="password"
              label="New password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <TextField
              control={passwordForm.control}
              name="confirmPassword"
              label="Confirm password"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
            <Button type="submit" variant="brand" size="lg" className="w-full" loading={loading}>
              Reset password
            </Button>
          </form>
        </Form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={
        <Image
          src="/logo.png"
          alt="Dattaremit"
          width={140}
          height={119}
          priority
          className="mx-auto block h-28 w-auto"
        />
      }
      subtitle="Enter the email on your account and we'll send you a code to set a new password."
      footer={
        <div className="text-center">
          Remember your password?{" "}
          <Link href={ROUTES.SIGN_IN} className="font-semibold text-brand hover:text-foreground">
            Sign in
          </Link>
        </div>
      }
    >
      <Form {...emailForm}>
        <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
          <TextField
            control={emailForm.control}
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Button type="submit" variant="brand" size="lg" className="w-full" loading={loading}>
            Send reset code
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}
