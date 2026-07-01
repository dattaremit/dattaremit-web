"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Landmark, Wallet } from "lucide-react";

import { UpiLogo } from "@/components/ui/upi-logo";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useAccount, useMyBanks, useNreAccount } from "@/hooks/api";
import type { NreBankAccount } from "@/types/api";
import type { SelfAccountType } from "@/types/transfer";

/** Last-4 masked label for a linked NRE account, e.g.
 *  "HDFC Bank •••• 9012 · HDFC0001234". */
function nreAccountSummary(nre: NreBankAccount): string {
  const last4 = nre.accountNumber ? nre.accountNumber.slice(-4) : null;
  return [nre.bankName, last4 ? `•••• ${last4}` : null, nre.ifscCode].filter(Boolean).join(" · ");
}

/**
 * The "Send to yourself" column on the send page. Renders the three self-payout
 * destinations (regular / NRE / UPI) as tappable cards instead of hiding them
 * behind a link. Picking one deep-links into the self-send flow at the amount
 * step (or the add-NRE form when no NRE account is linked yet), so the flow's
 * state machine on /send/self is reused rather than duplicated here.
 */
export function SelfDestinationOptions() {
  const router = useRouter();
  const { data: account } = useAccount();
  const hasUserBank = !!account?.hasUserBank;
  const hasNreBank = !!account?.hasNreBank;
  const { data: nreAccount } = useNreAccount({ enabled: hasNreBank });
  const { data: myBanks } = useMyBanks();
  const defaultBank = myBanks?.find((b) => b.isDefault) ?? myBanks?.[0];
  const regularLast4 = defaultBank?.bankAccountNumberMasked?.slice(-4) ?? null;

  // Every self off-ramp needs a saved Indian bank first; without one, funnel the
  // user to add it rather than into a flow that would only dead-end on the gate.
  if (account && !hasUserBank) {
    return (
      <OptionCard
        icon={<Landmark className="size-5" />}
        title="My Indian account"
        subtitle="Add a bank account to send to yourself"
        tone="warning"
        onClick={() => router.push(ROUTES.ACCOUNT_BANKS)}
      />
    );
  }

  const go = (type: SelfAccountType, start: "amount" | "add-nre") =>
    router.push(`${ROUTES.SEND_SELF}?account=${type}&start=${start}`);

  return (
    <div className="space-y-3">
      <OptionCard
        icon={<Wallet className="size-5" />}
        title="Regular account"
        subtitle={regularLast4 ? `•••• ${regularLast4}` : "Your linked NRO / savings account"}
        onClick={() => go("NRO", "amount")}
      />

      {hasNreBank ? (
        <OptionCard
          icon={<Landmark className="size-5" />}
          title="NRE account"
          subtitle={
            nreAccount ? nreAccountSummary(nreAccount) : "Your linked Non-Resident External account"
          }
          onClick={() => go("NRE", "amount")}
        />
      ) : (
        <OptionCard
          icon={<Landmark className="size-5" />}
          title="NRE account"
          subtitle="Add your Non-Resident External account"
          dashed
          onClick={() => go("NRE", "add-nre")}
        />
      )}

      <OptionCard
        icon={
          <span className="flex h-full w-full items-center justify-center rounded-xl bg-white ring-1 ring-border">
            <UpiLogo className="h-5" />
          </span>
        }
        plainIcon
        title="UPI transfer"
        subtitle="Send to your UPI ID"
        onClick={() => go("UPI", "amount")}
      />
    </div>
  );
}

function OptionCard({
  icon,
  title,
  subtitle,
  onClick,
  plainIcon = false,
  dashed = false,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  /** Render the icon slot as-is (self-contained chip) instead of in the tinted
   *  brand box — used for the UPI logo. */
  plainIcon?: boolean;
  dashed?: boolean;
  tone?: "warning";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left shadow-soft transition-all hover:-translate-y-px hover:border-foreground/15 hover:shadow-lift",
        dashed ? "border-dashed border-border" : "border-border",
      )}
    >
      <div
        className={cn(
          "size-11 shrink-0",
          !plainIcon && "flex items-center justify-center rounded-xl bg-brand/15 text-brand",
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-foreground">{title}</div>
        <div
          className={cn(
            "mt-0.5 truncate text-xs text-muted-foreground",
            tone === "warning" && "font-medium text-warning",
          )}
        >
          {subtitle}
        </div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </button>
  );
}
