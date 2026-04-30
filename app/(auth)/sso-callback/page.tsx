"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { motion } from "motion/react";

export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative flex size-16 items-center justify-center"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-brand/30" />
        <span className="absolute inset-2 rounded-full bg-brand/40" />
        <span className="relative size-3 rounded-full bg-brand" />
      </motion.div>
      <div className="flex flex-col items-center gap-1">
        <p className="font-semibold text-2xl text-foreground">
          Almost <span className="text-brand">there</span>.
        </p>
        <p className="text-sm text-muted-foreground">Wrapping up your sign in…</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
