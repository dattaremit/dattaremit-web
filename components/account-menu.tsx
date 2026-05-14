"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppSignOut } from "@/hooks/use-app-sign-out";
import { LogOut, UserPen, MapPin, ShieldCheck, CircleUser } from "lucide-react";

import { useAccount } from "@/hooks/api";
import { ROUTES } from "@/constants/routes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function useAccountIdentity() {
  const { user } = useUser();
  const displayName = user?.fullName || user?.emailAddresses[0]?.emailAddress || "";
  const email = user?.emailAddresses[0]?.emailAddress || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return { user, displayName, email, initials };
}

export function AccountMenuItems({
  align = "end",
  side = "bottom",
}: {
  align?: "start" | "end" | "center";
  side?: "top" | "right" | "bottom" | "left";
}) {
  const router = useRouter();
  const signOut = useAppSignOut();
  const { displayName, email, user, initials } = useAccountIdentity();
  const { data: account } = useAccount();

  return (
    <DropdownMenuContent side={side} align={align} className="w-60">
      <DropdownMenuLabel className="font-normal">
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarImage src={user?.imageUrl} alt={displayName} />
            <AvatarFallback className="bg-brand/15 text-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem onClick={() => router.push(ROUTES.EDIT_PROFILE)}>
          <UserPen />
          Edit profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(ROUTES.EDIT_ADDRESSES)}>
          <MapPin />
          Edit addresses
        </DropdownMenuItem>
        {account?.accountStatus && account.accountStatus !== "ACTIVE" && (
          <DropdownMenuItem onClick={() => router.push(ROUTES.KYC)}>
            <ShieldCheck />
            Complete KYC
          </DropdownMenuItem>
        )}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        variant="destructive"
        onClick={async () => {
          try {
            await signOut();
          } catch {
            toast.error("Failed to sign out. Please try again.");
          }
        }}
      >
        <LogOut />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

/** Compact icon-only trigger for top headers. */
export function AccountMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open account menu"
          className="flex size-9 items-center justify-center rounded-full bg-brand/10 text-brand ring-2 ring-transparent transition-all hover:bg-brand/20 hover:ring-brand/30 focus-visible:outline-none focus-visible:ring-brand/50"
        >
          <CircleUser className="size-5" />
        </button>
      </DropdownMenuTrigger>
      <AccountMenuItems align="end" side="bottom" />
    </DropdownMenu>
  );
}
