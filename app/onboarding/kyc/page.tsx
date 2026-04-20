"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

import { queryKeys } from "@/constants/query-keys";
import { EASE_OUT_SMOOTH } from "@/constants/motion";
import { requestOnboardingKyc, ApiError } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OnboardingKycPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const requestLink = useMutation({
    mutationFn: requestOnboardingKyc,
    onSuccess: () => {
      setModalOpen(true);
    },
  });

  const handleGotIt = async () => {
    setModalOpen(false);
    await queryClient.invalidateQueries({ queryKey: queryKeys.account });
    router.replace("/");
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT_SMOOTH }}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex size-20 items-center justify-center rounded-full bg-brand/15 text-brand">
          <ShieldCheck className="size-12" />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-semibold text-lg text-foreground">
            Complete Your KYC
          </h1>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            To comply with financial regulations and keep your account secure,
            we need to verify your identity. Tap the button below and
            we&apos;ll send a verification link to your registered email.
          </p>
        </div>

        {requestLink.isError && (
          <div className="w-full rounded-xl bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              {requestLink.error instanceof ApiError
                ? requestLink.error.message
                : "Something went wrong. Please try again."}
            </p>
          </div>
        )}

        <Button
          variant="brand"
          size="lg"
          className="w-full"
          onClick={() => requestLink.mutate()}
          loading={requestLink.isPending}
        >
          Start KYC
        </Button>
      </motion.div>

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) handleGotIt();
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="items-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-brand/15 text-brand">
              <Mail className="size-9" />
            </div>
            <DialogTitle className="text-center">KYC Link Sent!</DialogTitle>
            <DialogDescription className="text-center">
              Please check your email and complete the KYC verification to get
              started.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="brand" className="w-full" onClick={handleGotIt}>
              Got It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
