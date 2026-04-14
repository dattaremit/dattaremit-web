"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCreateRecipient } from "@/hooks/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecipientForm } from "@/components/recipients/recipient-form";

export default function NewRecipientPage() {
  const router = useRouter();
  const createRecipient = useCreateRecipient();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/recipients">
          <ArrowLeft />
          Back
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add recipient</CardTitle>
          <CardDescription>
            You&apos;ll add their bank details in the next step.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
