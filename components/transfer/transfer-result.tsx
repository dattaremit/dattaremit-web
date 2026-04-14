"use client";

import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface TransferResultProps {
  status: "success" | "error";
  title: string;
  description?: string;
  transactionId?: string;
  primaryHref?: string;
  primaryLabel?: string;
  onRetry?: () => void;
}

export function TransferResult({
  status,
  title,
  description,
  transactionId,
  primaryHref = "/activity",
  primaryLabel = "View activity",
  onRetry,
}: TransferResultProps) {
  const Icon = status === "success" ? CheckCircle2 : XCircle;
  const iconColor =
    status === "success" ? "text-green-600" : "text-destructive";

  return (
    <Card>
      <CardHeader className="flex flex-col items-center gap-2 text-center">
        <Icon className={`h-12 w-12 ${iconColor}`} />
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        {transactionId && (
          <div className="text-xs text-muted-foreground">
            Transaction: <span className="font-mono">{transactionId}</span>
          </div>
        )}
        <div className="flex w-full gap-2">
          {status === "error" && onRetry && (
            <Button variant="outline" className="flex-1" onClick={onRetry}>
              Try again
            </Button>
          )}
          <Button asChild className="flex-1">
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
