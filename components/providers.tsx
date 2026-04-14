"use client";

import { useEffect, useState } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { setTokenGetter } from "@/services/api";
import { Toaster } from "@/components/ui/sonner";
import { InAppBanner } from "@/components/notifications/in-app-banner";
import { PushListener } from "@/components/notifications/push-listener";

function AuthTokenBridge({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  // Set synchronously so token is available before any queries fire
  setTokenGetter(() => getToken());

  useEffect(() => {
    if (!isSignedIn) {
      queryClient.clear();
    }
  }, [isSignedIn, queryClient]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 2,
          },
        },
      })
  );

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/sign-in"
      signInForceRedirectUrl="/"
      signUpForceRedirectUrl="/onboarding/profile"
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryClientProvider client={queryClient}>
          <AuthTokenBridge>
            {children}
            <PushListener />
            <InAppBanner />
            <Toaster />
          </AuthTokenBridge>
        </QueryClientProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
