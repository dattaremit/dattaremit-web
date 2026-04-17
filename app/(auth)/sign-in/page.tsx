"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signInSchema, type SignInFormData } from "@/schemas/auth.schema";
import { toast } from "sonner";
import { getClerkErrorMessage } from "@/utils/clerk-error";

import { AuthShell } from "@/components/ui/auth-shell";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import { OtpForm } from "@/components/ui/otp-form";
import { OAuthButtons } from "@/components/oauth-buttons";
import { OrDivider } from "@/components/or-divider";

const EMAIL_CODE_STRATEGY = "email_code" as const;

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pendingEmailCode, setPendingEmailCode] = useState(false);
  const [emailAddressId, setEmailAddressId] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [code, setCode] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>();

  const form = useForm<SignInFormData>({
    resolver: yupResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInFormData) => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.replace("/");
        return;
      }

      const emailFactor = result.supportedFirstFactors?.find(
        (f): f is Extract<typeof f, { strategy: "email_code" }> =>
          f.strategy === EMAIL_CODE_STRATEGY,
      );
      if (emailFactor) {
        await signIn.prepareFirstFactor({
          strategy: EMAIL_CODE_STRATEGY,
          emailAddressId: emailFactor.emailAddressId,
        });
        setEmailAddressId(emailFactor.emailAddressId);
        setVerificationEmail(data.email);
        setPendingEmailCode(true);
        return;
      }

      toast.error("Sign in could not be completed.");
    } catch (err: unknown) {
      toast.error(
        getClerkErrorMessage(
          err,
          "Invalid email or password. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const onVerifyEmailCode = async () => {
    if (!isLoaded) return;
    setOtpError(undefined);
    setLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: EMAIL_CODE_STRATEGY,
        code,
      });

      const sessionId = result.createdSessionId ?? signIn.createdSessionId;
      if (result.status === "complete" && sessionId) {
        await setActive({ session: sessionId });
        router.replace("/");
      } else {
        setOtpError(
          `Verification incomplete (status: ${result.status}). Please try again.`,
        );
      }
    } catch (err: unknown) {
      setOtpError(
        getClerkErrorMessage(err, "Invalid code. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  const onResendCode = async () => {
    if (!isLoaded || !emailAddressId) return;
    try {
      await signIn.prepareFirstFactor({
        strategy: EMAIL_CODE_STRATEGY,
        emailAddressId,
      });
      setCode("");
      setOtpError(undefined);
      toast.success("Code sent. Check your inbox.");
    } catch (err: unknown) {
      toast.error(getClerkErrorMessage(err, "Couldn't resend the code."));
    }
  };

  if (pendingEmailCode) {
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
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">
              {verificationEmail}
            </span>
            .
          </>
        }
      >
        <OtpForm
          value={code}
          onChange={(v) => {
            setCode(v);
            if (otpError) setOtpError(undefined);
          }}
          onSubmit={onVerifyEmailCode}
          loading={loading}
          error={otpError}
          submitLabel="Verify and sign in"
          onResend={onResendCode}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Sign in"
      title={
        <>
          Welcome
          <br />
          <span className="text-brand">back</span>.
        </>
      }
      subtitle="Sign in to send, track, and manage your transfers."
      footer={
        <span>
          New here?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-foreground underline decoration-brand decoration-2 underline-offset-4 hover:decoration-foreground"
          >
            Create an account
          </Link>
        </span>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <TextField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
          <TextField
            control={form.control}
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="brand"
            size="lg"
            className="w-full"
            loading={loading}
          >
            Sign in
          </Button>
        </form>
      </Form>

      <OrDivider />

      <OAuthButtons mode="sign-in" />
    </AuthShell>
  );
}
