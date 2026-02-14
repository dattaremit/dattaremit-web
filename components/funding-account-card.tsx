"use client";

import { Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FundingAccount } from "@/types/api";

interface FundingAccountCardProps {
  fundingAccount: FundingAccount;
}

export function FundingAccountCard({
  fundingAccount,
}: FundingAccountCardProps) {
  const { accountInfo, status } = fundingAccount;
  const last4 = accountInfo.bank_account_number.slice(-4);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-base">{accountInfo.bank_name}</CardTitle>
          <p className="text-sm text-muted-foreground">****{last4}</p>
        </div>
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {accountInfo.payment_rails.map((rail) => (
            <Badge key={rail} variant="outline" className="text-xs">
              {rail}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
