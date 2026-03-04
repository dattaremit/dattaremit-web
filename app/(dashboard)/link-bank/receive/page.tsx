"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, ShieldCheck, ArrowRight } from "lucide-react";
import { queryKeys } from "@/constants/query-keys";
import {
  depositAccountSchema,
  type DepositAccountFormData,
} from "@/schemas/deposit-account.schema";
import { useAccount, useAddDepositAccount } from "@/hooks/api";
import { ApiError } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReceiveBankPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: account } = useAccount();
  const accountStatus = account?.accountStatus;
  const addDeposit = useAddDepositAccount();

  const form = useForm<DepositAccountFormData>({
    resolver: yupResolver(depositAccountSchema),
    defaultValues: {
      accountNumber: "",
      ifscCode: "",
      accountHolderName: "",
      bankName: "",
      branchName: "",
      bankAccountType: undefined,
      phoneNumber: "",
    },
  });

  const onSubmit = async (data: DepositAccountFormData) => {
    try {
      await addDeposit.mutateAsync({
        accountNumber: data.accountNumber,
        ifscCode: data.ifscCode,
        accountHolderName: data.accountHolderName,
        bankName: data.bankName,
        branchName: data.branchName,
        bankCountry: "IN",
        bankAccountType: data.bankAccountType,
        phoneNumber: `+91${data.phoneNumber}`,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account });
      toast.success("Beneficiary added successfully!");
      router.push("/link-bank");
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to add beneficiary"
      );
    }
  };

  if (accountStatus !== "ACTIVE") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Verify Your Identity</CardTitle>
            <CardDescription>
              {accountStatus === "PENDING"
                ? "Your KYC verification is being reviewed. You'll be able to add a beneficiary once it's approved."
                : "Complete your KYC verification to add a beneficiary."}
            </CardDescription>
          </CardHeader>
          {accountStatus !== "PENDING" && (
            <CardContent className="flex justify-center">
              <Button onClick={() => router.push("/kyc")}>
                Complete KYC
                <ArrowRight />
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button
            variant="ghost"
            size="icon"
            className="mb-2 -ml-2"
            onClick={() => router.push("/link-bank")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle>Add Beneficiary</CardTitle>
          <CardDescription>
            Enter your recipient&apos;s bank details to send money to India.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="accountHolderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Holder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="As per bank records" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter account number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ifscCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. SBIN0001234"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. State Bank of India" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branchName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Main Branch" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bankAccountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Savings">Savings</SelectItem>
                        <SelectItem value="Current">Current</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                          +91
                        </span>
                        <Input
                          className="rounded-l-none"
                          placeholder="10-digit phone number"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={addDeposit.isPending}
              >
                {addDeposit.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Beneficiary
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
