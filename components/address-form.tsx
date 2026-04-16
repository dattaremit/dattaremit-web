"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addressSchema, type AddressFormData } from "@/schemas/address.schema";
import { useAccount } from "@/hooks/api";
import { submitOnboardingAddress, createZynkEntity } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TextField } from "@/components/ui/text-field";
import { PageHeader } from "@/components/ui/page-header";
import { CountrySelector } from "@/components/country-selector";
import type { Country } from "@/constants/countries";

export interface AddressFormProps {
  nextHrefOnCreate?: string;
  nextHrefOnUpdate?: string;
  onAfterSubmit?: (mode: "create" | "update") => void | Promise<void>;
  chromeless?: boolean;
  title?: string;
  description?: string;
  submitLabel?: { create?: string; update?: string };
  countries?: Country[];
  fixedCountry?: string;
}

export function AddressForm({
  nextHrefOnCreate = "/kyc",
  nextHrefOnUpdate = "/",
  onAfterSubmit,
  chromeless = false,
  title,
  description,
  submitLabel,
  countries,
  fixedCountry,
}: AddressFormProps = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: account, isLoading } = useAccount();
  const existingAddress = account?.addresses?.find(
    (a) => a.type === "PRESENT",
  );

  const addressMutation = useMutation({
    mutationFn: submitOnboardingAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.account });
    },
  });

  const form = useForm<AddressFormData>({
    resolver: yupResolver(addressSchema),
    defaultValues: {
      country: fixedCountry ?? "",
      state: "",
      city: "",
      addressLine1: "",
      postalCode: "",
    },
  });

  const hasPopulated = useRef(false);

  useEffect(() => {
    if (!account || hasPopulated.current) return;
    hasPopulated.current = true;

    const present = account.addresses?.find((a) => a.type === "PRESENT");
    if (present) {
      form.reset({
        country: present.country || "",
        state: present.state || "",
        city: present.city || "",
        addressLine1: present.addressLine1 || "",
        postalCode: present.postalCode || "",
      });
    }
  }, [account, form]);

  const onSubmit = async (data: AddressFormData) => {
    try {
      await addressMutation.mutateAsync({
        type: "PRESENT",
        addressLine1: data.addressLine1,
        city: data.city,
        state: data.state,
        country: data.country,
        postalCode: data.postalCode,
      });

      await createZynkEntity();

      toast.success("Address saved successfully");

      if (onAfterSubmit) {
        await onAfterSubmit(existingAddress ? "update" : "create");
      } else if (existingAddress) {
        router.replace(nextHrefOnUpdate);
      } else {
        router.replace(nextHrefOnCreate);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    }
  };

  if (isLoading) {
    const skeletons = (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    );
    if (chromeless) return skeletons;
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-72" />
        <Card variant="elevated" className="p-6 sm:p-8">
          {skeletons}
        </Card>
      </div>
    );
  }

  const headerTitle = title ?? "Your address";
  const headerDescription = description ?? "Where do you currently live?";
  const submitText = existingAddress
    ? (submitLabel?.update ?? "Save changes")
    : (submitLabel?.create ?? "Continue");

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <CountrySelector
                label="Country"
                value={field.value}
                onSelect={field.onChange}
                placeholder="Select country"
                error={form.formState.errors.country?.message}
                countries={countries}
                disabled={!!fixedCountry}
              />
            </FormItem>
          )}
        />
        <TextField
          control={form.control}
          name="state"
          label="State / Division"
          placeholder="Enter state"
        />
        <TextField
          control={form.control}
          name="city"
          label="City"
          placeholder="Enter city"
        />
        <TextField
          control={form.control}
          name="addressLine1"
          label="Street address"
          placeholder="Enter street address"
        />
        <TextField
          control={form.control}
          name="postalCode"
          label="Postal code"
          placeholder="Enter postal code"
        />

        <Button
          type="submit"
          variant="brand"
          size="lg"
          className="w-full"
          loading={addressMutation.isPending}
        >
          {submitText}
        </Button>
      </form>
    </Form>
  );

  if (chromeless) {
    return (
      <div className="flex flex-col gap-7">
        <PageHeader title={headerTitle} subtitle={headerDescription} />
        {formContent}
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Address"
        title={headerTitle}
        subtitle={headerDescription}
      />
      <Card variant="elevated" className="p-6 sm:p-8">
        {formContent}
      </Card>
    </div>
  );
}
