"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Wallet, Plus, Trash2, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useExternalAccounts,
  useCreateExternalAccount,
  useDeleteExternalAccount,
} from "@/hooks/api";
import { ApiError } from "@/services/api";
import {
  externalAccountSchema,
  type ExternalAccountFormData,
} from "@/schemas/external-account.schema";

function truncateAddress(address: string) {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="ghost" size="icon-xs" onClick={handleCopy}>
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

export default function WalletsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: accounts, isLoading } = useExternalAccounts();
  const createAccount = useCreateExternalAccount();
  const deleteAccount = useDeleteExternalAccount();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ExternalAccountFormData>({
    resolver: yupResolver(externalAccountSchema) as any,
  });

  function onSubmit(data: ExternalAccountFormData) {
    createAccount.mutate(
      {
        walletAddress: data.walletAddress,
        chain: data.chain as "ethereum" | "solana" | undefined,
        label: data.label || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Wallet added successfully!");
          setDialogOpen(false);
          reset();
        },
        onError: (err) => {
          toast.error(
            err instanceof ApiError ? err.message : "Failed to add wallet"
          );
        },
      }
    );
  }

  function handleDelete(id: string) {
    deleteAccount.mutate(id, {
      onSuccess: () => {
        toast.success("Wallet removed successfully.");
      },
      onError: (err) => {
        toast.error(
          err instanceof ApiError ? err.message : "Failed to remove wallet"
        );
      },
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Wallets</h1>
          <p className="text-muted-foreground">
            Manage your external wallet addresses.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus />
              Add Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Add Wallet Address</DialogTitle>
                <DialogDescription>
                  Add an external wallet address for receiving funds.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="walletAddress">Wallet Address</Label>
                  <Input
                    id="walletAddress"
                    placeholder="0x... or Solana address"
                    {...register("walletAddress")}
                  />
                  {errors.walletAddress && (
                    <p className="text-sm text-destructive">
                      {errors.walletAddress.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chain">Chain (optional)</Label>
                  <Select
                    onValueChange={(val) =>
                      setValue("chain", val as "ethereum" | "solana")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-detect" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="solana">Solana</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.chain && (
                    <p className="text-sm text-destructive">
                      {errors.chain.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Label (optional)</Label>
                  <Input
                    id="label"
                    placeholder="e.g. My MetaMask"
                    {...register("label")}
                  />
                  {errors.label && (
                    <p className="text-sm text-destructive">
                      {errors.label.message}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createAccount.isPending}>
                  {createAccount.isPending && (
                    <Loader2 className="animate-spin" />
                  )}
                  Add Wallet
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!accounts?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wallet className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No wallets yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a wallet address to receive funds.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardContent className="flex items-center gap-3 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {account.label || truncateAddress(account.walletAddress)}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {account.type}
                    </Badge>
                    <Badge
                      variant={
                        account.status === "ACTIVE" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {account.status.toLowerCase()}
                    </Badge>
                  </div>
                  {account.label && (
                    <div className="flex items-center gap-1">
                      <p className="text-sm text-muted-foreground">
                        {truncateAddress(account.walletAddress)}
                      </p>
                      <CopyButton text={account.walletAddress} />
                    </div>
                  )}
                  {!account.label && (
                    <CopyButton text={account.walletAddress} />
                  )}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Wallet</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove this wallet? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(account.id)}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        {deleteAccount.isPending ? (
                          <Loader2 className="animate-spin" />
                        ) : null}
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
