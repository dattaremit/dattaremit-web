"use client";

import { useSignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signUpSchema, type SignUpFormData } from "@/schemas/auth.schema";
import { toast } from "sonner";
import { getClerkErrorMessage } from "@/utils/clerk-error";

import { AuthShell } from "@/components/ui/auth-shell";
import { OrDivider } from "@/components/or-divider";
import { EmailVerificationForm } from "@/components/email-verification-form";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import { OAuthButtons } from "@/components/oauth-buttons";
import { useCheckEmailAvailability } from "@/hooks/api";
import { ROUTES } from "@/constants/routes";

export default function SignUpPage() {
  const { isLoaded, signUp } = useSignUp();

  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const emailValue = form.watch("email");
  const { available, isChecking } = useCheckEmailAvailability(emailValue ?? "", "user");
  const emailTaken = available === false;

  const onSubmit = async (data: SignUpFormData) => {
    if (!isLoaded) return;
    if (emailTaken) return;
    setLoading(true);

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerificationEmail(data.email);
      setPendingVerification(true);
    } catch (err: unknown) {
      toast.error(getClerkErrorMessage(err, "Sign up failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return <EmailVerificationForm email={verificationEmail} />;
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
          Already a customer?{" "}
          <Link href={ROUTES.SIGN_IN} className="font-semibold text-brand hover:text-foreground">
            Sign in
          </Link>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <TextField
              control={form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
            {emailTaken && (
              <p className="mt-1.5 text-sm text-destructive">
                An account with this email already exists.{" "}
                <Link
                  href={ROUTES.SIGN_IN}
                  className="font-medium underline underline-offset-2 hover:no-underline"
                >
                  Sign in instead?
                </Link>
              </p>
            )}
            {isChecking && !emailTaken && (
              <p className="mt-1.5 text-sm text-muted-foreground">Checking availability…</p>
            )}
          </div>
          <TextField
            control={form.control}
            name="password"
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
          <TextField
            control={form.control}
            name="confirmPassword"
            label="Confirm password"
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />
          <div id="clerk-captcha" />
          <Button
            type="submit"
            variant="brand"
            size="lg"
            className="w-full"
            loading={loading}
            disabled={emailTaken}
          >
            Create account
          </Button>
        </form>
      </Form>

      <OrDivider />

      <OAuthButtons mode="sign-up" />
    </AuthShell>
  );
}
