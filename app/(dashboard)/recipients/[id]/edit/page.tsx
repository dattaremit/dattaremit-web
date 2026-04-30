"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRecipient, useUpdateRecipient } from "@/hooks/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { BackLink } from "@/components/ui/back-link";
import { RecipientForm } from "@/components/recipients/recipient-form";

export default function EditRecipientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: recipient, isLoading } = useRecipient(id);
  const updateRecipient = useUpdateRecipient();

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3">
        <BackLink href={`/recipients/${id}`} />
        <PageHeader
          eyebrow="Edit"
          title={
            recipient ? (
              <>
                Update <span className="text-brand">{recipient.firstName}</span>.
              </>
            ) : (
              "Edit recipient"
            )
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
          <RecipientForm
            submitLabel="Save changes"
            submitting={updateRecipient.isPending}
            originalEmail={recipient.email}
            defaultValues={{
              firstName: recipient.firstName,
              lastName: recipient.lastName,
              email: recipient.email,
              phoneNumberPrefix: recipient.phoneNumberPrefix,
              phoneNumber: recipient.phoneNumber,
              addressLine1: recipient.addressLine1,
              city: recipient.city,
              state: recipient.state,
              postalCode: recipient.postalCode,
            }}
            onSubmit={async (data) => {
              try {
                await updateRecipient.mutateAsync({ id, data });
                toast.success("Recipient updated");
                router.push(`/recipients/${id}`);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to update recipient");
              }
            }}
          />
        )}
      </Card>
    </div>
  );
}
