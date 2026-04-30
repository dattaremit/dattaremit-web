"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useAppSignOut } from "@/hooks/use-app-sign-out";
import { LogOut, Moon, Sun, UserPen, MapPin, ShieldCheck } from "lucide-react";

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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  const { setTheme } = useTheme();
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
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Sun className="dark:hidden" />
          <Moon className="hidden dark:block" />
          Theme
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
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

/** Compact avatar-only trigger for top headers. */
export function AccountMenu() {
  const { user, displayName, initials } = useAccountIdentity();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open account menu"
          className="flex size-9 items-center justify-center rounded-full ring-2 ring-transparent transition-all hover:ring-brand/30 focus-visible:outline-none focus-visible:ring-brand/50"
        >
          <Avatar size="sm" className="size-9">
            <AvatarImage src={user?.imageUrl} alt={displayName} />
            <AvatarFallback className="bg-brand/15 text-sm font-medium text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <AccountMenuItems align="end" side="bottom" />
    </DropdownMenu>
  );
}
