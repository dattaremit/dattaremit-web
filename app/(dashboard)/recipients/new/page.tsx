"use client";

import { useAccount } from "@/hooks/api";
import { PageHeader } from "@/components/ui/page-header";
import { BackLink } from "@/components/ui/back-link";
import { NewRecipientWizard } from "@/components/recipients/new-recipient-wizard";
import { KycGate } from "@/components/kyc/kyc-gate";
import { ROUTES } from "@/constants/routes";

export default function NewRecipientPage() {
  const { data: account } = useAccount();

  if (account && account.accountStatus !== "ACTIVE") {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-7">
        <BackLink href={ROUTES.RECIPIENTS} />
        <KycGate accountStatus={account.accountStatus} feature="adding recipients" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-7">
      <div className="flex flex-col gap-3">
        <BackLink href={ROUTES.RECIPIENTS} />
        <PageHeader
          eyebrow="New recipient"
          title={
            <>
              Add <span className="text-brand">someone new</span>.
            </>
          }
          subtitle="Add their details so you can send money to them."
        />
      </div>

      <NewRecipientWizard />
    </div>
  );
}
