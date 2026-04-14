"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function useAuthGuard() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/welcome");
    }
  }, [isLoaded, isSignedIn, router]);

  return { isReady: isLoaded && isSignedIn };
}
