"use client";

import { useState } from "react";
import {
  Clock3,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useActivities } from "@/hooks/api";
import { cn } from "@/lib/utils";
import { TRANSFER_TYPES, KYC_TYPES, ACCOUNT_TYPES } from "@/constants/activity-types";
import { getActivityStatusVariant } from "@/constants/status-meta";
import type { ActivityType, ActivityQueryParams } from "@/types/api";

const PAGE_SIZE = 20;

type FilterTab = "all" | "transfers" | "kyc" | "account";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "transfers", label: "Transfers" },
  { key: "kyc", label: "KYC" },
  { key: "account", label: "Account" },
];

function getActivityIcon(type: ActivityType) {
  if (["DEPOSIT", "REFUND"].includes(type)) return ArrowDownLeft;
  if (["WITHDRAWAL", "TRANSFER", "PAYMENT"].includes(type)) return ArrowUpRight;
  if (type.startsWith("KYC_")) return ShieldCheck;
  if (type.startsWith("ACCOUNT_")) return UserCheck;
  return Clock3;
}

function getIconAccent(type: ActivityType) {
  if (["DEPOSIT", "REFUND"].includes(type)) return "bg-success/15 text-success";
  if (["WITHDRAWAL", "TRANSFER", "PAYMENT"].includes(type)) return "bg-brand/15 text-brand";
  if (type.startsWith("KYC_")) return "bg-accent text-foreground";
  return "bg-muted text-muted-foreground";
}

function formatType(type: string) {
  return type
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [offset, setOffset] = useState(0);

  const params: ActivityQueryParams = { limit: PAGE_SIZE, offset };
  const { data, isLoading } = useActivities(params);

  const filteredItems = (() => {
    if (!data?.items) return [];
    if (activeTab === "all") return data.items;
    if (activeTab === "transfers") return data.items.filter((a) => TRANSFER_TYPES.includes(a.type));
    if (activeTab === "kyc") return data.items.filter((a) => KYC_TYPES.includes(a.type));
    if (activeTab === "account") return data.items.filter((a) => ACCOUNT_TYPES.includes(a.type));
    return data.items;
  })();

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Activity"
        title={
          <>
            Your <span className="text-brand">ledger</span>.
          </>
        }
        subtitle="Every transfer, KYC update, and account event in one place."
      />

      <div className="flex flex-wrap items-center gap-2">
        {FILTER_TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setOffset(0);
              }}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                active
                  ? "border-foreground/20 bg-foreground text-background shadow-soft"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && !filteredItems.length && (
        <EmptyState
          icon={<Clock3 className="size-5" />}
          title="Nothing yet"
          description="When you send or receive money, it'll show up here."
        />
      )}

      {!isLoading && filteredItems.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          {filteredItems.map((activity, i) => {
            const Icon = getActivityIcon(activity.type);
            const accent = getIconAccent(activity.type);
            return (
              <div
                key={activity.id}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent/40",
                  i > 0 && "border-t border-border",
                )}
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full",
                    accent,
                  )}
                >
                  <Icon className="size-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {activity.description || formatType(activity.type)}
                    </p>
                    <Badge
                      variant={getActivityStatusVariant(activity.status)}
                      className="text-[10px]"
                    >
                      {activity.status.toLowerCase()}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {activity.amount != null && (
                  <p className="font-semibold text-base tabular text-foreground">
                    ${Number(activity.amount).toFixed(2)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground tabular">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setOffset(offset + PAGE_SIZE)}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
