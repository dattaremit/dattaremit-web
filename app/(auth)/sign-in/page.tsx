"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { ROUTES } from "@/constants/routes";

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pendingSecondFactor, setPendingSecondFactor] = useState(false);
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
      const signInAttempt = await signIn.create({ identifier: data.email });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace(ROUTES.ROOT);
        return;
      }

      if (signInAttempt.status === "needs_first_factor") {
        const result = await signIn.attemptFirstFactor({
          strategy: "password",
          password: data.password,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.replace(ROUTES.ROOT);
          return;
        }

        if (result.status === "needs_second_factor") {
          await signIn.prepareSecondFactor({ strategy: "email_code" });
          setPendingSecondFactor(true);
          return;
        }
      }

      toast.error("Sign in could not be completed.");
    } catch (err: unknown) {
      toast.error(getClerkErrorMessage(err, "Sign in failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const onVerifySecondFactor = async () => {
    if (!isLoaded) return;
    setOtpError(undefined);
    setLoading(true);

    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace(ROUTES.ROOT);
      }
    } catch (err: unknown) {
      setOtpError(getClerkErrorMessage(err, "Verification failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  if (pendingSecondFactor) {
    return (
      <AuthShell
        eyebrow="Two-step"
        title={
          <>
            One more
            <br />
            <span className="text-brand">step</span>.
          </>
        }
        subtitle="Enter the 6-digit code we just emailed you."
      >
        <OtpForm
          value={code}
          onChange={(v) => {
            setCode(v);
            if (otpError) setOtpError(undefined);
          }}
          onSubmit={onVerifySecondFactor}
          loading={loading}
          error={otpError}
          submitLabel="Verify and sign in"
        />
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
      footer={
        <div className="text-center">
          New here?{" "}
          <Link href={ROUTES.SIGN_UP} className="font-semibold text-brand hover:text-foreground">
            Create an account
          </Link>
        </div>
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
          <div className="-mt-1 text-right">
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" variant="brand" size="lg" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>
      </Form>

      <OrDivider />

      <OAuthButtons mode="sign-in" />
    </AuthShell>
  );
}
