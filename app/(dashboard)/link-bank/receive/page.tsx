"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { queryKeys } from "@/constants/query-keys";
import {
  depositAccountSchema,
  type DepositAccountFormData,
} from "@/schemas/deposit-account.schema";
import { useAccount, useAddDepositAccount } from "@/hooks/api";
import { ApiError } from "@/services/api";
import { ROUTES } from "@/constants/routes";
import { KycGate } from "@/components/kyc-gate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextField } from "@/components/ui/text-field";
import { PageHeader } from "@/components/ui/page-header";
import { BackLink } from "@/components/ui/back-link";

export default function ReceiveBankPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: account } = useAccount();
  const accountStatus = account?.accountStatus;
  const indianKycStatus = account?.indianKycStatus ?? "NONE";
  const addDeposit = useAddDepositAccount();

  const form = useForm<DepositAccountFormData>({
    resolver: yupResolver(depositAccountSchema),
    defaultValues: {
      accountNumber: "",
      ifsc: "",
      accountName: "",
      bankName: "",
      bankAccountType: undefined,
    },
  });

  const onSubmit = async (data: DepositAccountFormData) => {
    try {
      await addDeposit.mutateAsync({
        accountNumber: data.accountNumber,
        ifsc: data.ifsc,
        accountName: data.accountName,
        bankName: data.bankName,
        bankAccountType: data.bankAccountType,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account });
      toast.success("Indian bank added successfully!");
      router.push(ROUTES.LINK_BANK);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to add Indian bank",
      );
    }
  };

  if (accountStatus !== "ACTIVE") {
    return <KycGate accountStatus={accountStatus} feature="adding an Indian bank" />;
  }

  if (indianKycStatus !== "APPROVED") {
    return (
      <Gate
        title="Indian KYC required"
        description={
          indianKycStatus === "PENDING"
            ? "Your Indian KYC verification is being reviewed. You'll be able to add your Indian bank account once it's approved."
            : "Complete Indian KYC verification to send money to your own Indian bank account."
        }
        cta={
          indianKycStatus !== "PENDING" ? (
            <Button variant="brand" onClick={() => router.push(ROUTES.KYC_INDIAN)}>
              {indianKycStatus === "REJECTED" || indianKycStatus === "FAILED"
                ? "Resubmit Indian KYC"
                : "Start Indian KYC"}
              <ArrowRight />
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-7">
      <div className="flex flex-col gap-3">
        <BackLink href={ROUTES.LINK_BANK} />
        <PageHeader
          eyebrow="Your Indian bank"
          title={
            <>
              Add your{" "}
              <span className="text-brand">
                Indian bank
              </span>
              .
            </>
          }
          subtitle="Enter your own Indian bank details. This is where money will land when you send to yourself."
        />
      </div>

      <Card variant="elevated" className="p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <TextField
              control={form.control}
              name="accountName"
              label="Account holder name"
              placeholder="As per bank records"
            />
            <TextField
              control={form.control}
              name="accountNumber"
              label="Account number"
              placeholder="Enter account number"
            />
            <TextField
              control={form.control}
              name="ifsc"
              label="IFSC code"
              placeholder="e.g. SBIN0001234"
              transform={(v) => v.toUpperCase()}
            />
            <TextField
              control={form.control}
              name="bankName"
              label="Bank name"
              placeholder="e.g. State Bank of India"
            />

            <FormField
              control={form.control}
              name="bankAccountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SAVINGS">Savings</SelectItem>
                      <SelectItem value="CURRENT">Current</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="w-full"
              loading={addDeposit.isPending}
            >
              Add Indian bank
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}

function Gate({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card variant="elevated" className="p-8 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-brand/15 text-brand">
          <ShieldCheck className="size-6" />
        </div>
        <h2 className="font-semibold text-2xl text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {cta && <div className="mt-5 flex justify-center">{cta}</div>}
      </Card>
    </div>
  );
}
