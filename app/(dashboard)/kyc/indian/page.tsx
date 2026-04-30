"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CreditCard, Hash, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { indianKycSchema, type IndianKycFormData } from "@/schemas/indian-kyc.schema";
import { useSubmitIndianKyc } from "@/hooks/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { TextField } from "@/components/ui/text-field";
import { PageHeader } from "@/components/ui/page-header";
import { BackLink } from "@/components/ui/back-link";
import { ROUTES } from "@/constants/routes";

export default function IndianKycPage() {
  const router = useRouter();
  const submit = useSubmitIndianKyc();

  const form = useForm<IndianKycFormData>({
    resolver: yupResolver(indianKycSchema),
    defaultValues: { aadharNumber: "", panNumber: "" },
  });

  return (
    <div className="mx-auto w-full max-w-lg space-y-7">
      <div className="flex flex-col gap-3">
        <BackLink href={ROUTES.KYC} />
        <PageHeader
          eyebrow="Indian KYC"
          title={
            <>
              Aadhar & <span className="text-brand">PAN</span>.
            </>
          }
          subtitle="Encrypted in your browser before being sent. Verification takes 3–5 minutes."
        />
      </div>

      <Card variant="elevated" className="p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-brand" />
          End-to-end encrypted submission.
        </div>

        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit(async (data) => {
              try {
                await submit.mutateAsync(data);
                toast.success("Indian KYC submitted — verification in progress.");
                router.replace(ROUTES.KYC);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed to submit Indian KYC");
              }
            })}
          >
            <TextField
              control={form.control}
              name="aadharNumber"
              label="Aadhar number"
              inputMode="numeric"
              maxLength={12}
              placeholder="12-digit Aadhar number"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              leading={<CreditCard className="size-4" />}
              transform={(v) => v.replace(/\D/g, "")}
            />
            <TextField
              control={form.control}
              name="panNumber"
              label="PAN number"
              maxLength={10}
              placeholder="ABCDE1234F"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              leading={<Hash className="size-4" />}
              transform={(v) => v.toUpperCase()}
            />
            <Button
              type="submit"
              variant="brand"
              size="lg"
              className="w-full"
              loading={submit.isPending}
            >
              Submit Indian KYC
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
