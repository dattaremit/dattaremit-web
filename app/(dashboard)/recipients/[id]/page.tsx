"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Check,
  LinkIcon,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";

import {
  useAccount,
  useDeleteRecipientBank,
  useRecipient,
  useRecipientBanks,
  useResendRecipientKyc,
  useSetDefaultRecipientBank,
  useUnlinkRecipient,
} from "@/hooks/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { BackLink } from "@/components/ui/back-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ROUTES } from "@/constants/routes";
import type { BankDetails } from "@/types/recipient";

export default function RecipientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: account } = useAccount();
  const { data: recipient, isLoading, error } = useRecipient(id);
  const { data: banks = [], isLoading: banksLoading, error: banksError } = useRecipientBanks(id);

  const currentUserId = account?.user?.id ?? null;
  const canEditRecipient =
    !!recipient?.createdByUserId && !!currentUserId && recipient.createdByUserId === currentUserId;
  const resendKyc = useResendRecipientKyc();
  const setDefaultBank = useSetDefaultRecipientBank();
  const deleteBank = useDeleteRecipientBank();
  const unlinkRecipient = useUnlinkRecipient();

  const [confirmUnlink, setConfirmUnlink] = useState(false);
  const [bankToRemove, setBankToRemove] = useState<BankDetails | null>(null);

  const handleResend = async () => {
    try {
      await resendKyc.mutateAsync(id);
      toast.success("KYC email resent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend");
    }
  };

  const handleSetDefault = async (bankId: string) => {
    try {
      await setDefaultBank.mutateAsync({ recipientId: id, bankId });
      toast.success("Default bank updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleRemoveBank = async () => {
    if (!bankToRemove) return;
    try {
      await deleteBank.mutateAsync({
        recipientId: id,
        bankId: bankToRemove.id,
      });
      toast.success("Bank account removed");
      setBankToRemove(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    }
  };

  const handleUnlink = async () => {
    try {
      await unlinkRecipient.mutateAsync(id);
      toast.success("Recipient removed from your list");
      router.push(ROUTES.RECIPIENTS);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setConfirmUnlink(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !recipient) {
    return (
      <div className="space-y-4">
        <BackLink href={ROUTES.RECIPIENTS} />
        <p className="text-destructive">
          {error instanceof Error ? error.message : "Recipient not found."}
        </p>
      </div>
    );
  }

  const kycApproved = recipient.kycStatus === "APPROVED";
  const hasBanks = banks.length > 0;
  const canSend = kycApproved && hasBanks;
  const initials = `${recipient.firstName[0] ?? ""}${recipient.lastName[0] ?? ""}`;

  return (
    <div className="space-y-7">
      <BackLink href={ROUTES.RECIPIENTS} />

      <Card variant="elevated" className="relative overflow-hidden p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-brand/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand/30 to-brand-soft/40 font-semibold text-xl text-foreground">
              {initials}
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="font-semibold text-3xl leading-tight text-foreground">
                {recipient.firstName} {recipient.lastName}
              </h1>
              <p className="text-sm text-muted-foreground">{recipient.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                kycApproved
                  ? "default"
                  : recipient.kycStatus === "PENDING"
                    ? "secondary"
                    : "destructive"
              }
            >
              {recipient.kycStatus}
            </Badge>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <Detail label="Phone">
            {recipient.phoneNumberPrefix} {recipient.phoneNumber}
          </Detail>
          <Detail label="Nationality">{recipient.nationality}</Detail>
        </div>

        <Separator className="my-6" />

        <Detail label="Address">
          {recipient.addressLine1}
          <br />
          {recipient.city}, {recipient.state} {recipient.postalCode}
          <br />
          {recipient.country}
        </Detail>

        <div className="mt-6 flex flex-wrap gap-2">
          {canEditRecipient && !kycApproved && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/recipients/${recipient.id}/edit`}>
                <Pencil />
                Edit details
              </a>
            </Button>
          )}
          {!kycApproved && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              loading={resendKyc.isPending}
            >
              {!resendKyc.isPending && <RefreshCw />}
              Resend KYC
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setConfirmUnlink(true)}>
            <UserMinus />
            Remove from my list
          </Button>
        </div>
        {!canEditRecipient && (
          <p className="mt-3 text-xs text-muted-foreground">
            Shared recipient — only the user who first added {recipient.firstName} can edit their
            profile details.
          </p>
        )}
      </Card>

      <Card variant="elevated" className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Banknote className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-xl text-foreground">Bank accounts</h2>
              <p className="text-sm text-muted-foreground">
                {hasBanks
                  ? `${banks.length} account${banks.length > 1 ? "s" : ""} — default used by transfers unless specified.`
                  : "No bank account linked yet."}
              </p>
            </div>
          </div>
          {kycApproved && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/recipients/${recipient.id}/bank`}>
                <Plus />
                Add bank
              </a>
            </Button>
          )}
        </div>

        {banksLoading ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : banksError ? (
          <div className="p-6 text-sm text-destructive">
            Couldn&rsquo;t load bank accounts.{" "}
            {banksError instanceof Error ? banksError.message : ""}
          </div>
        ) : hasBanks ? (
          <ul className="divide-y divide-border">
            {banks.map((bank) => (
              <li key={bank.id} className="flex items-center gap-4 p-6">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Banknote className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">
                      {bank.label ?? bank.bankName ?? "Bank account"}
                    </span>
                    {bank.isDefault && (
                      <Badge variant="secondary" className="h-5">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {bank.bankName ? `${bank.bankName} · ` : ""}
                    {bank.bankAccountNumberMasked}
                    {bank.bankIfsc ? ` · ${bank.bankIfsc}` : ""}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Bank actions">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!bank.isDefault && (
                      <DropdownMenuItem onClick={() => handleSetDefault(bank.id)}>
                        <Check className="size-4" />
                        Set as default
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => router.push(`/send?recipient=${recipient.id}&bank=${bank.id}`)}
                      disabled={!canSend}
                    >
                      <Send className="size-4" />
                      Send to this bank
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setBankToRemove(bank)}
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-6">
            {kycApproved ? (
              <Button variant="brand" size="sm" asChild>
                <a href={`/recipients/${recipient.id}/bank`}>
                  <LinkIcon />
                  Link a bank account
                </a>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Once KYC is approved, you can add bank accounts.
              </p>
            )}
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-2">
        <Button
          variant="brand"
          size="lg"
          className="w-full"
          disabled={!canSend}
          onClick={() => router.push(`/send?recipient=${recipient.id}`)}
        >
          <Send />
          Send money
        </Button>
        {!canSend && (
          <p className="text-center text-xs text-muted-foreground">
            {kycApproved
              ? "Add a bank account to send money."
              : "Recipient must complete KYC before you can send money."}
          </p>
        )}
      </div>

      <AlertDialog open={!!bankToRemove} onOpenChange={(open) => !open && setBankToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this bank?</AlertDialogTitle>
            <AlertDialogDescription>
              {bankToRemove?.bankName
                ? `${bankToRemove.bankName} · ${bankToRemove.bankAccountNumberMasked} will no longer be available for transfers.`
                : "This account will no longer be available for transfers."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveBank} disabled={deleteBank.isPending}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmUnlink} onOpenChange={setConfirmUnlink}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from your list?</AlertDialogTitle>
            <AlertDialogDescription>
              {recipient.firstName} will be removed from your recipients. The recipient&rsquo;s
              profile is shared across users, so other senders who have added them are unaffected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnlink} disabled={unlinkRecipient.isPending}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-foreground">{children}</div>
    </div>
  );
}
