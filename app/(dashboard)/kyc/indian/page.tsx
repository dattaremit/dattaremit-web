"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeft, CreditCard, Hash, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  indianKycSchema,
  type IndianKycFormData,
} from "@/schemas/indian-kyc.schema";
import { useSubmitIndianKyc } from "@/hooks/api";
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

export default function IndianKycPage() {
  const router = useRouter();
  const submit = useSubmitIndianKyc();

  const form = useForm<IndianKycFormData>({
    resolver: yupResolver(indianKycSchema),
    defaultValues: { aadharNumber: "", panNumber: "" },
  });

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
        <Link href="/kyc">
          <ArrowLeft />
          Back
        </Link>
      </Button>

      <Card>
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Indian KYC</CardTitle>
          <CardDescription>
            Your Aadhar and PAN are encrypted in your browser before being
            sent to our server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(async (data) => {
                try {
                  await submit.mutateAsync(data);
                  toast.success("Indian KYC submitted — verification in progress.");
                  router.replace("/kyc");
                } catch (err) {
                  toast.error(
                    err instanceof Error
                      ? err.message
                      : "Failed to submit Indian KYC",
                  );
                }
              })}
            >
              <FormField
                control={form.control}
                name="aadharNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhar number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          inputMode="numeric"
                          maxLength={12}
                          placeholder="12-digit Aadhar number"
                          className="pl-9"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value.replace(/\D/g, ""))
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="panNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          maxLength={10}
                          placeholder="ABCDE1234F"
                          className="pl-9"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
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
                disabled={submit.isPending}
              >
                {submit.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Submit Indian KYC
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
