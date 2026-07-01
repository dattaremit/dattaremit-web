"use client";

import Link from "next/link";
import { ArrowRight, Banknote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Recipient } from "@/types/recipient";

export function RecipientCard({ recipient }: { recipient: Recipient }) {
  return (
    <Link
      href={`/recipients/${recipient.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-soft transition-all hover:-translate-y-px hover:border-foreground/15 hover:shadow-lift"
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-brand/25 to-brand-soft/40 font-semibold text-base text-foreground">
        {recipient.firstName[0]}
        {recipient.lastName[0]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-foreground">
          {recipient.firstName} {recipient.lastName}
        </div>
        <div className="truncate text-sm text-muted-foreground">{recipient.email}</div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {recipient.hasBankAccount && (
            <Badge variant="outline" className="gap-1">
              <Banknote className="h-3 w-3" />
              Bank linked
            </Badge>
          )}
        </div>
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
    </Link>
  );
}
