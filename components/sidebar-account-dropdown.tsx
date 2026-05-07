"use client";

import { ChevronsUpDown, CircleUser } from "lucide-react";

import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AccountMenuItems, useAccountIdentity } from "@/components/account-menu";

export function SidebarAccountDropdown() {
  const { displayName, email } = useAccountIdentity();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 text-sm transition-all hover:border-sidebar-border hover:bg-sidebar-accent">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
            <CircleUser className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium leading-tight text-sidebar-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/55">{email}</p>
          </div>
          <ChevronsUpDown className="size-4 shrink-0 text-sidebar-foreground/40 transition-colors group-hover:text-sidebar-foreground" />
        </button>
      </DropdownMenuTrigger>
      <AccountMenuItems align="start" side="top" />
    </DropdownMenu>
  );
}
