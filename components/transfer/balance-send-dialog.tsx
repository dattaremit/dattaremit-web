"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Landmark, User, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioCard } from "@/components/ui/radio-card";
import {
  useAccount,
  useCreateTransferRequest,
  useExchangeRate,
  useMyBanks,
  useNreAccount,
  useRecipients,
} from "@/hooks/api";
import { formatInr, usdToInr } from "@/lib/money";
import { getServerErrorMessage } from "@/lib/safe-error-message";
import type { CreateTransferRequestPayload } from "@/types/transfer";

const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/;

interface DestinationOption {
  key: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  payload: Pick<
    CreateTransferRequestPayload,
    "destinationType" | "recipientId" | "bankDetailsId" | "nreBankAccountId"
  >;
}

interface BalanceSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BalanceSendDialog({ open, onOpenChange }: BalanceSendDialogProps) {
  const { data: account } = useAccount();
  const { data: rateData } = useExchangeRate();
  const { data: recipients } = useRecipients();
  const { data: myBanks } = useMyBanks();
  const { data: nre } = useNreAccount();
  const createRequest = useCreateTransferRequest();

  const balance = typeof account?.balance === "number" ? account.balance : 0;
  const rate = rateData?.rate ?? null;

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const options = useMemo<DestinationOption[]>(() => {
    const out: DestinationOption[] = [];

    (recipients ?? [])
      .filter((r) => r.hasBankAccount)
      .forEach((r) => {
        r.banks.forEach((b) => {
          out.push({
            key: `recipient:${r.id}:${b.id}`,
            title: `${r.firstName} ${r.lastName}`,
            subtitle: `${b.bankName ?? "Bank"} · ${b.bankAccountNumberMasked ?? "account"}`,
            icon: <User className="size-5" />,
            payload: { destinationType: "RECIPIENT", recipientId: r.id, bankDetailsId: b.id },
          });
        });
      });

    (myBanks ?? []).forEach((b) => {
      out.push({
        key: `self-bank:${b.id}`,
        title: `${b.bankName ?? "Your bank"} · You`,
        subtitle: `Self account · ${b.bankAccountNumberMasked ?? "account"}`,
        icon: <Landmark className="size-5" />,
        payload: { destinationType: "SELF_BANK", bankDetailsId: b.id },
      });
    });

    if (nre) {
      out.push({
        key: `self-nre:${nre.id}`,
        title: `${nre.bankName ?? "NRE account"} · You`,
        subtitle: `Self NRE account · ${nre.accountNumber ?? "account"}`,
        icon: <Landmark className="size-5" />,
        payload: { destinationType: "SELF_NRE", nreBankAccountId: nre.id },
      });
    }

    return out;
  }, [recipients, myBanks, nre]);

  const selected = options.find((o) => o.key === selectedKey) ?? null;
  const inrPreview = usdToInr(amount, rate);

  function close() {
    onOpenChange(false);
    // Reset after the close animation so the form doesn't flash empty.
    setTimeout(() => {
      setSelectedKey(null);
      setAmount("");
      setError(null);
    }, 200);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selected) {
      setError("Choose a destination.");
      return;
    }
    const trimmed = amount.trim();
    if (!AMOUNT_REGEX.test(trimmed)) {
      setError("Enter a valid USD amount (up to 2 decimal places).");
      return;
    }
    const usd = parseFloat(trimmed);
    if (usd <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    if (usd > balance) {
      setError(`Amount exceeds your balance of $${balance.toFixed(2)}.`);
      return;
    }
    if (rate == null) {
      toast.error("Live rate unavailable right now. Please try again in a moment.");
      return;
    }

    try {
      await createRequest.mutateAsync({
        payload: { ...selected.payload, amountUsd: usd, exchangeRate: rate },
      });
      toast.success("Transfer request submitted. An admin will process it shortly.");
      close();
    } catch (err) {
      toast.error(getServerErrorMessage(err, "Failed to submit transfer request"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send from balance</DialogTitle>
          <DialogDescription>
            Request a payout from your ${balance.toFixed(2)} balance. We record it at the live rate
            and an admin pays it out manually.
          </DialogDescription>
        </DialogHeader>

        {options.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            You don&apos;t have any destinations yet. Add a recipient with a bank account, or link
            your own bank, then come back to send from your balance.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Destination</Label>
              <div className="space-y-2">
                {options.map((o) => (
                  <RadioCard
                    key={o.key}
                    icon={o.icon}
                    title={o.title}
                    subtitle={o.subtitle}
                    active={selectedKey === o.key}
                    onSelect={() => setSelectedKey(o.key)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance-send-amount">Amount (USD)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="balance-send-amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7"
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {inrPreview != null && rate != null
                    ? `They receive ≈ ${formatInr(inrPreview)} at ₹${rate.toFixed(2)}`
                    : "Live rate applied at submit"}
                </span>
                <button
                  type="button"
                  className="font-medium text-brand hover:underline"
                  onClick={() => setAmount(balance.toFixed(2))}
                >
                  Use max (${balance.toFixed(2)})
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRequest.isPending}>
                <Wallet className="size-4" />
                {createRequest.isPending ? "Submitting..." : "Send request"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
