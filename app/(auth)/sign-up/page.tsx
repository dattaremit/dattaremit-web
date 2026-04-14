"use client";

import { useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signUpSchema, type SignUpFormData } from "@/schemas/auth.schema";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getClerkErrorMessage } from "@/utils/clerk-error";
import { AuthPageHeader } from "@/components/auth-page-header";
import { OrDivider } from "@/components/or-divider";
import { EmailVerificationForm } from "@/components/email-verification-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OAuthButtons } from "@/components/oauth-buttons";

export default function SignUpPage() {
  const { isLoaded, signUp } = useSignUp();

  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: SignUpFormData) => {
    if (!isLoaded) return;
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
    <div>
      <AuthPageHeader title="Create an account" subtitle="Sign up to get started" />
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Clerk auto-mounts the Turnstile CAPTCHA into this div. */}
            <div id="clerk-captcha" />
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
        </Form>

        <OrDivider />

        <OAuthButtons mode="sign-up" />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
