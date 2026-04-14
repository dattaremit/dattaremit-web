"use client";

import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { useRecipients } from "@/hooks/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipientCard } from "@/components/recipients/recipient-card";

export default function RecipientsPage() {
  const { data: recipients, isLoading, error, refetch } = useRecipients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Recipients</h1>
          <p className="text-muted-foreground">
            People you can send money to.
          </p>
        </div>
        <Button asChild>
          <Link href="/recipients/new">
            <Plus />
            Add recipient
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm">
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Failed to load recipients."}
          </p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !error && recipients?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Users className="mb-3 h-10 w-10 text-muted-foreground" />
          <h2 className="font-semibold">No recipients yet</h2>
          <p className="mb-4 max-w-sm text-sm text-muted-foreground">
            Add your first recipient to start sending money.
          </p>
          <Button asChild>
            <Link href="/recipients/new">
              <Plus />
              Add recipient
            </Link>
          </Button>
        </div>
      )}

      {recipients && recipients.length > 0 && (
        <div className="space-y-3">
          {recipients.map((r) => (
            <RecipientCard key={r.id} recipient={r} />
          ))}
        </div>
      )}
    </div>
  );
}
