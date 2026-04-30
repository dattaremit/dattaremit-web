"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AddRecipientWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function AddRecipientWarningModal({
  open,
  onOpenChange,
  onConfirm,
}: AddRecipientWarningModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-warning/15 text-warning">
            <AlertTriangle className="size-7" />
          </div>
          <DialogTitle className="text-center text-xl">
            Please confirm your bank details
          </DialogTitle>
          <DialogDescription className="text-center">
            Before adding your Indian bank account, make sure your name, account number, and IFSC
            code are correct. Transfers cannot be reversed once sent.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl bg-warning/10 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-warning">NRE accounts are not supported</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Only NRO and resident savings accounts can receive transfers.
          </p>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <Button variant="brand" size="lg" onClick={onConfirm}>
            Confirm
          </Button>
          <Button variant="ghost" size="lg" onClick={() => onOpenChange(false)}>
            Go Back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
