"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useAccount } from "@/hooks/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CircleUser,
  Phone,
  Calendar,
  MapPin,
  UserPen,
  ChevronRight,
  LogOut,
  Sun,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AccountPage() {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const { data: account, isLoading } = useAccount();
  const serverUser = account?.user;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const displayName =
    (serverUser ? `${serverUser.firstName} ${serverUser.lastName}`.trim() : null) ||
    clerkUser?.fullName ||
    clerkUser?.emailAddresses[0]?.emailAddress;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center">
        <CircleUser className="h-20 w-20 text-muted-foreground" strokeWidth={1.2} />
        <h1 className="mt-4 text-xl font-bold">{displayName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {serverUser?.email || clerkUser?.emailAddresses[0]?.emailAddress}
        </p>
      </div>

      {/* Profile Details */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : serverUser ? (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Profile Details
          </p>
          <Card>
            <CardContent className="p-0">
              {serverUser.phoneNumber && (
                <>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{serverUser.phoneNumberPrefix}{serverUser.phoneNumber}</span>
                  </div>
                  <Separator />
                </>
              )}
              {serverUser.dateOfBirth && (
                <>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(serverUser.dateOfBirth).toLocaleDateString()}
                    </span>
                  </div>
                  <Separator />
                </>
              )}
              <div className="flex items-center gap-3 px-4 py-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {account?.addresses?.length ?? 0} addresses saved
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Preferences */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Preferences
        </p>
        <Card>
          <CardContent className="p-0">
            <button
              onClick={() => router.push("/edit-profile")}
              className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <UserPen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Edit Profile</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <Separator />
            <button
              onClick={() => router.push("/edit-addresses")}
              className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Edit Addresses</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <Separator />
            <div className="flex w-full items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Appearance</span>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Actions
        </p>
        <Card>
          <CardContent className="p-0">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-4 py-3 text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
