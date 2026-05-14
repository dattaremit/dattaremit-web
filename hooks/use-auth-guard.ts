"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export function useAuthGuard() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace(ROUTES.SIGN_IN);
    }
  }, [isLoaded, isSignedIn, router]);

  return { isReady: isLoaded && isSignedIn };
}
