"use client";

import { useEffect, useRef, useState } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { setTokenGetter } from "@/services/api";
import { clearClientData } from "@/lib/clear-client-data";
import { ROUTES } from "@/constants/routes";
import { Toaster } from "@/components/ui/sonner";
import { InAppBanner } from "@/components/notifications/in-app-banner";
import { PushListener } from "@/components/notifications/push-listener";
import { SentryUserContext } from "@/components/sentry-user-context";

function AuthTokenBridge({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const wasSignedInRef = useRef(false);

  // Set synchronously so token is available before any queries fire
  setTokenGetter(() => getToken());

  useEffect(() => {
    if (!isLoaded) return;
    // Clear all client-side caches on signed-in → signed-out transitions.
    // Runs for manual sign-out, idle logout, and externally expired sessions.
    if (wasSignedInRef.current && !isSignedIn) {
      clearClientData(queryClient);
    }
    wasSignedInRef.current = !!isSignedIn;
  }, [isLoaded, isSignedIn, queryClient]);

  return <>{children}</>;
}

export function Providers({ children, nonce }: { children: React.ReactNode; nonce?: string }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 2,
          },
        },
      }),
  );

  return (
    <ClerkProvider
      nonce={nonce}
      signInUrl={ROUTES.SIGN_IN}
      signUpUrl={ROUTES.SIGN_UP}
      afterSignOutUrl={ROUTES.SIGN_IN}
      signInForceRedirectUrl={ROUTES.ROOT}
      signUpForceRedirectUrl={ROUTES.ONBOARDING.PROFILE}
    >
      <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
        <QueryClientProvider client={queryClient}>
          <AuthTokenBridge>
            <SentryUserContext />
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
