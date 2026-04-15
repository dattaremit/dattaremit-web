"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAccount, useCreateRecipient } from "@/hooks/api";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { BackLink } from "@/components/ui/back-link";
import { RecipientForm } from "@/components/recipients/recipient-form";
import { KycGate } from "@/components/kyc-gate";

export default function NewRecipientPage() {
  const router = useRouter();
  const createRecipient = useCreateRecipient();
  const { data: account } = useAccount();

  if (account && account.accountStatus !== "ACTIVE") {
    return (
      <div className="space-y-7">
        <BackLink href="/recipients" />
        <KycGate
          accountStatus={account.accountStatus}
          feature="adding recipients"
        />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3">
        <BackLink href="/recipients" />
        <PageHeader
          eyebrow="New recipient"
          title={
            <>
              Add{" "}
              <span className="text-brand">
                someone new
              </span>
              .
            </>
          }
          subtitle="You'll add their bank details in the next step."
        />
      </div>

      <Card variant="elevated" className="p-6 sm:p-8">
        <RecipientForm
          submitLabel="Continue"
          submitting={createRecipient.isPending}
          onSubmit={async (data) => {
            try {
              const recipient = await createRecipient.mutateAsync(data);
              toast.success("Recipient added");
              router.push(`/recipients/${recipient.id}/bank`);
            } catch (err) {
              toast.error(
                err instanceof Error
                  ? err.message
                  : "Failed to add recipient",
              );
            }
          }}
        />
      </Card>
    </div>
  );
}
