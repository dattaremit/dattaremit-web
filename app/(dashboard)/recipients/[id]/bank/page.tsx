"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAccount, useAddRecipientBank, useRecipient } from "@/hooks/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { BackLink } from "@/components/ui/back-link";
import { RecipientBankForm } from "@/components/recipients/recipient-bank-form";
import { KycGate } from "@/components/kyc-gate";
import { ApiError } from "@/services/api";

export default function RecipientBankPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: recipient, isLoading } = useRecipient(id);
  const { data: account } = useAccount();
  const addBank = useAddRecipientBank();

  const hasExistingBanks = (recipient?.banks.length ?? 0) > 0;

  if (account && account.accountStatus !== "ACTIVE") {
    return (
      <div className="space-y-7">
        <BackLink href={`/recipients/${id}`} />
        <KycGate accountStatus={account.accountStatus} feature="adding recipient banks" />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3">
        <BackLink href={`/recipients/${id}`} />
        <PageHeader
          eyebrow="Bank"
          title={
            <>
              Add a <span className="text-brand">bank account</span>.
            </>
          }
          subtitle={
            hasExistingBanks
              ? "This will be added alongside their existing account(s). First bank becomes the default."
              : "This is where the money will be delivered. You can add more banks later."
          }
        />
      </div>

      <Card variant="elevated" className="p-6 sm:p-8">
        {isLoading || !recipient ? (
          <div className="space-y-3">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        ) : (
          <RecipientBankForm
            submitLabel="Add bank account"
            submitting={addBank.isPending}
            defaultValues={{
              accountName: `${recipient.firstName} ${recipient.lastName}`.trim(),
            }}
            onSubmit={async (data) => {
              try {
                await addBank.mutateAsync({ id, data });
                toast.success("Bank account added");
                router.push(`/recipients/${id}`);
              } catch (err) {
                // Server signals a same-account duplicate via code so we
                // can route the user to the existing bank instead of
                // showing an opaque error.
                if (err instanceof ApiError && err.code === "BANK_ALREADY_LINKED") {
                  toast.info("This account is already on this recipient. Opening it now.");
                  router.push(`/recipients/${id}`);
                  return;
                }
                toast.error(err instanceof Error ? err.message : "Failed to save bank");
              }
            }}
          />
        )}
      </Card>
    </div>
  );
}
