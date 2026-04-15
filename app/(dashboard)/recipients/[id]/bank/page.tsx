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

export default function RecipientBankPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: recipient, isLoading } = useRecipient(id);
  const { data: account } = useAccount();
  const addBank = useAddRecipientBank();

  const existing = recipient?.hasBankAccount;

  if (account && account.accountStatus !== "ACTIVE") {
    return (
      <div className="space-y-7">
        <BackLink href={`/recipients/${id}`} />
        <KycGate
          accountStatus={account.accountStatus}
          feature="adding recipient banks"
        />
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
              {existing ? "Update" : "Add a"}{" "}
              <span className="text-brand">
                bank account
              </span>
              .
            </>
          }
          subtitle="This is where the money will be delivered."
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
            submitLabel={existing ? "Update bank" : "Save bank"}
            submitting={addBank.isPending}
            defaultValues={{
              bankName: recipient.bankName ?? "",
              accountName:
                `${recipient.firstName} ${recipient.lastName}`.trim(),
              ifsc: recipient.bankIfsc ?? "",
              phoneNumber: recipient.phoneNumber,
            }}
            onSubmit={async (data) => {
              try {
                await addBank.mutateAsync({ id, data });
                toast.success(existing ? "Bank updated" : "Bank added");
                router.push(`/recipients/${id}`);
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : "Failed to save bank",
                );
              }
            }}
          />
        )}
      </Card>
    </div>
  );
}
