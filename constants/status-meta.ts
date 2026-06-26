import { CheckCircle2, Clock, ShieldCheck, XCircle, type LucideIcon } from "lucide-react";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface StatusMetaEntry {
  label: string;
  variant: BadgeVariant;
  icon: LucideIcon;
}

export const ACCOUNT_STATUS_META: Record<string, StatusMetaEntry> = {
  INITIAL: { label: "Not started", variant: "secondary", icon: ShieldCheck },
  PENDING: { label: "In review", variant: "secondary", icon: Clock },
  ACTIVE: { label: "Verified", variant: "default", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", variant: "destructive", icon: XCircle },
};

export function getActivityStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "COMPLETE":
      return "default";
    case "PENDING":
      return "secondary";
    case "FAILED":
      return "destructive";
    default:
      return "outline";
  }
}
