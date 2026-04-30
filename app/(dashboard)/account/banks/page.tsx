"use client";

import { useState } from "react";
import { Banknote, Check, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAddMyBank, useDeleteMyBank, useMyBanks, useSetDefaultMyBank } from "@/hooks/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { BackLink } from "@/components/ui/back-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { RecipientBankForm } from "@/components/recipients/recipient-bank-form";
import type { BankDetails } from "@/types/recipient";

export default function MyBanksPage() {
  const { data: banks = [], isLoading } = useMyBanks();
  const addBank = useAddMyBank();
  const setDefault = useSetDefaultMyBank();
  const deleteBank = useDeleteMyBank();

  const [addOpen, setAddOpen] = useState(false);
  const [toDelete, setToDelete] = useState<BankDetails | null>(null);

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3">
        <BackLink href="/account" />
        <PageHeader
          eyebrow="Settings"
          title="Your bank accounts"
          subtitle="Add and manage the Indian bank accounts associated with your own profile."
        />
      </div>

      <Card variant="elevated" className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Banknote className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-xl text-foreground">Saved banks</h2>
              <p className="text-sm text-muted-foreground">
                {banks.length > 0
                  ? `${banks.length} account${banks.length > 1 ? "s" : ""}.`
                  : "No saved banks yet."}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
            <Plus />
            Add bank
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : banks.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            Add a bank to start sending to yourself or to receive saved-account shortcuts when a
            friend pays you.
          </div>
        ) : (
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
                      <DropdownMenuItem
                        onClick={async () => {
                          try {
                            await setDefault.mutateAsync(bank.id);
                            toast.success("Default bank updated");
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Failed");
                          }
                        }}
                      >
                        <Check className="size-4" />
                        Set as default
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setToDelete(bank)}
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a bank account</DialogTitle>
          </DialogHeader>
          <RecipientBankForm
            submitLabel="Add bank"
            submitting={addBank.isPending}
            onSubmit={async (data) => {
              try {
                await addBank.mutateAsync(data);
                toast.success("Bank added");
                setAddOpen(false);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to add bank");
              }
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this bank?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.bankName
                ? `${toDelete.bankName} · ${toDelete.bankAccountNumberMasked} will be removed from your saved banks.`
                : "This account will be removed from your saved banks."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!toDelete) return;
                try {
                  await deleteBank.mutateAsync(toDelete.id);
                  toast.success("Bank removed");
                  setToDelete(null);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Failed to remove");
                }
              }}
              disabled={deleteBank.isPending}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
