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

export const INDIAN_KYC_STATUS_LABEL: Record<string, string> = {
  NONE: "Not started",
  PENDING: "In review",
  APPROVED: "Verified",
  REJECTED: "Rejected",
  FAILED: "Failed",
};

export function getIndianKycStatusVariant(status: string): BadgeVariant {
  if (status === "APPROVED") return "default";
  if (status === "PENDING") return "secondary";
  if (status === "REJECTED" || status === "FAILED") return "destructive";
  return "outline";
}

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
