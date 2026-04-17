"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useAccount } from "@/hooks/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Phone,
  Calendar,
  MapPin,
  UserPen,
  ChevronRight,
  LogOut,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { signOutWithCleanup } from "@/lib/auth/sign-out";

export default function AccountPage() {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const { data: account, isLoading } = useAccount();
  const serverUser = account?.user;

  const handleSignOut = async () => {
    try {
      await signOutWithCleanup(signOut);
    } catch {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const displayName =
    (serverUser
      ? `${serverUser.firstName} ${serverUser.lastName}`.trim()
      : null) ||
    clerkUser?.fullName ||
    clerkUser?.emailAddresses[0]?.emailAddress ||
    "";
  const email =
    serverUser?.email || clerkUser?.emailAddresses[0]?.emailAddress || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-10">
      <Card
        variant="elevated"
        className="relative overflow-hidden border-brand/15 p-7"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-brand/15 blur-3xl"
        />
        <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <Avatar size="lg" className="size-20 ring-4 ring-brand/15">
            <AvatarImage src={clerkUser?.imageUrl} alt={displayName} />
            <AvatarFallback className="bg-brand/15 font-semibold text-2xl text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h1 className="font-semibold text-3xl leading-tight text-foreground">
              {displayName}
            </h1>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : serverUser ? (
        <Section title="Profile">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            {serverUser.phoneNumber && (
              <Row icon={<Phone className="size-4" />} label="Phone">
                {serverUser.phoneNumberPrefix}
                {serverUser.phoneNumber}
              </Row>
            )}
            {serverUser.dateOfBirth && (
              <Row icon={<Calendar className="size-4" />} label="Date of birth">
                {new Date(serverUser.dateOfBirth).toLocaleDateString()}
              </Row>
            )}
            <Row icon={<MapPin className="size-4" />} label="Addresses">
              {account?.addresses?.length ?? 0} saved
            </Row>
          </div>
        </Section>
      ) : null}

      <Section title="Preferences">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <NavRow
            icon={<UserPen className="size-4" />}
            label="Edit profile"
            onClick={() => router.push("/edit-profile")}
          />
          <NavRow
            icon={<MapPin className="size-4" />}
            label="Edit addresses"
            onClick={() => router.push("/edit-addresses")}
          />
          {account?.accountStatus && account.accountStatus !== "ACTIVE" && (
            <NavRow
              icon={<ShieldCheck className="size-4" />}
              label="Complete KYC"
              onClick={() => router.push("/kyc")}
              accent
            />
          )}
          <Row icon={<Sun className="size-4" />} label="Appearance">
            <ThemeToggle />
          </Row>
        </div>
      </Section>

      <Section title="Actions">
        <button
          onClick={handleSignOut}
          className="group flex w-full items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 text-left text-sm font-medium text-destructive shadow-soft transition-all hover:border-destructive/40 hover:bg-destructive/5"
        >
          <span className="flex items-center gap-3">
            <LogOut className="size-4" />
            Sign out
          </span>
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="px-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5 last:border-0">
      <span className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="text-muted-foreground/70">{icon}</span>
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">{children}</span>
    </div>
  );
}

function NavRow({
  icon,
  label,
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center justify-between gap-3 border-b border-border px-5 py-3.5 text-sm transition-colors last:border-0 hover:bg-accent/40",
        accent && "bg-brand/5",
      )}
    >
      <span className="flex items-center gap-3">
        <span
          className={cn(
            "transition-colors",
            accent ? "text-brand" : "text-muted-foreground/70",
          )}
        >
          {icon}
        </span>
        <span
          className={cn(
            "font-medium",
            accent ? "text-foreground" : "text-foreground",
          )}
        >
          {label}
        </span>
      </span>
      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </button>
  );
}
