"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAddRecipientBank, useRecipient } from "@/hooks/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipientBankForm } from "@/components/recipients/recipient-bank-form";

export default function RecipientBankPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: recipient, isLoading } = useRecipient(id);
  const addBank = useAddRecipientBank();

  const existing = recipient?.hasBankAccount;

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
          <CardTitle className="text-2xl">
            {existing ? "Update bank" : "Add bank account"}
          </CardTitle>
          <CardDescription>
            This is where your money will be delivered.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || !recipient ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <RecipientBankForm
              submitLabel={existing ? "Update bank" : "Save bank"}
              submitting={addBank.isPending}
              defaultValues={{
                bankName: recipient.bankName ?? "",
                accountName: `${recipient.firstName} ${recipient.lastName}`.trim(),
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
        </CardContent>
      </Card>
    </div>
  );
}
