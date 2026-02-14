"use client";

import { useState } from "react";
import {
  Clock3,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  ShieldCheck,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivities } from "@/hooks/api";
import type { ActivityType, ActivityQueryParams } from "@/types/api";

const PAGE_SIZE = 20;

type FilterTab = "all" | "transfers" | "kyc" | "account";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "transfers", label: "Transfers" },
  { key: "kyc", label: "KYC" },
  { key: "account", label: "Account" },
];

const TRANSFER_TYPES: ActivityType[] = [
  "DEPOSIT",
  "WITHDRAWAL",
  "TRANSFER",
  "PAYMENT",
  "REFUND",
  "EXTERNAL_ACCOUNT_ADDED",
  "EXTERNAL_ACCOUNT_REMOVED",
];

const KYC_TYPES: ActivityType[] = [
  "KYC_SUBMITTED",
  "KYC_APPROVED",
  "KYC_REJECTED",
  "KYC_PENDING",
  "KYC_VERIFIED",
  "KYC_FAILED",
];

const ACCOUNT_TYPES: ActivityType[] = [
  "ACCOUNT_APPROVED",
  "ACCOUNT_ACTIVATED",
];

function getActivityIcon(type: ActivityType) {
  if (["DEPOSIT", "REFUND"].includes(type)) return ArrowDownLeft;
  if (["WITHDRAWAL", "TRANSFER", "PAYMENT"].includes(type))
    return ArrowUpRight;
  if (
    ["EXTERNAL_ACCOUNT_ADDED", "EXTERNAL_ACCOUNT_REMOVED"].includes(type)
  )
    return Wallet;
  if (type.startsWith("KYC_")) return ShieldCheck;
  if (type.startsWith("ACCOUNT_")) return UserCheck;
  return Clock3;
}

function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
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

function formatType(type: string) {
  return type
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [offset, setOffset] = useState(0);

  const params: ActivityQueryParams = {
    limit: PAGE_SIZE,
    offset,
  };

  const { data, isLoading } = useActivities(params);

  const filteredItems = (() => {
    if (!data?.items) return [];
    if (activeTab === "all") return data.items;
    if (activeTab === "transfers")
      return data.items.filter((a) => TRANSFER_TYPES.includes(a.type));
    if (activeTab === "kyc")
      return data.items.filter((a) => KYC_TYPES.includes(a.type));
    if (activeTab === "account")
      return data.items.filter((a) => ACCOUNT_TYPES.includes(a.type));
    return data.items;
  })();

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {FILTER_TABS.map((t) => (
            <Skeleton key={t.key} className="h-9 w-20" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity</h1>
        <p className="text-muted-foreground">Your transaction history.</p>
      </div>

      <div className="flex gap-2">
        {FILTER_TABS.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveTab(tab.key);
              setOffset(0);
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {!filteredItems.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock3 className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No activity yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your transaction history will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <Card key={activity.id}>
                <CardContent className="flex items-center gap-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {activity.description || formatType(activity.type)}
                      </p>
                      <Badge
                        variant={getStatusVariant(activity.status)}
                        className="text-xs"
                      >
                        {activity.status.toLowerCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {activity.amount != null && (
                    <p className="text-sm font-semibold tabular-nums">
                      ${Number(activity.amount).toFixed(2)}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setOffset(offset + PAGE_SIZE)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
