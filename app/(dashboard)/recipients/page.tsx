"use client";

import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { useAccount, useRecipients } from "@/hooks/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { RecipientCard } from "@/components/recipients/recipient-card";
import { KycGate } from "@/components/kyc-gate";

export default function RecipientsPage() {
  const { data: recipients, isLoading, error, refetch } = useRecipients();
  const { data: account } = useAccount();
  const isActive = account?.accountStatus === "ACTIVE";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Recipients"
        title={
          <>
            Your{" "}
            <span className="text-brand">
              circle
            </span>
            .
          </>
        }
        subtitle="People you can send money to."
        action={
          isActive ? (
            <Button asChild variant="brand">
              <Link href="/recipients/new">
                <Plus />
                Add recipient
              </Link>
            </Button>
          ) : null
        }
      />

      {!isActive && (
        <KycGate
          accountStatus={account?.accountStatus}
          feature="adding recipients"
        />
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p className="text-destructive">
            {error instanceof Error
              ? error.message
              : "Failed to load recipients."}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {isActive && !isLoading && !error && recipients?.length === 0 && (
        <EmptyState
          icon={<Users className="size-5" />}
          title="No recipients yet"
          description="Add your first recipient to start sending money across borders."
          action={
            <Button asChild variant="brand">
              <Link href="/recipients/new">
                <Plus />
                Add recipient
              </Link>
            </Button>
          }
        />
      )}

      {isActive && recipients && recipients.length > 0 && (
        <div className="space-y-3">
          {recipients.map((r) => (
            <RecipientCard key={r.id} recipient={r} />
          ))}
        </div>
      )}
    </div>
  );
}
