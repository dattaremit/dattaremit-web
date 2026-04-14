"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRecipient, useUpdateRecipient } from "@/hooks/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipientForm } from "@/components/recipients/recipient-form";

export default function EditRecipientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: recipient, isLoading } = useRecipient(id);
  const updateRecipient = useUpdateRecipient();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href={`/recipients/${id}`}>
          <ArrowLeft />
          Back
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit recipient</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || !recipient ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <RecipientForm
              submitLabel="Save changes"
              submitting={updateRecipient.isPending}
              defaultValues={{
                firstName: recipient.firstName,
                lastName: recipient.lastName,
                email: recipient.email,
                phoneNumberPrefix: recipient.phoneNumberPrefix,
                phoneNumber: recipient.phoneNumber,
                dateOfBirth: recipient.dateOfBirth?.substring(0, 10) ?? "",
                addressLine1: recipient.addressLine1,
                addressLine2: recipient.addressLine2 ?? "",
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
                  toast.error(
                    err instanceof Error
                      ? err.message
                      : "Failed to update recipient",
                  );
                }
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
