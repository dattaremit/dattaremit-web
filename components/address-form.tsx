"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addressSchema, type AddressFormData } from "@/schemas/address.schema";
import {
  useAccount,
  useCreateAddress,
  useUpdateAddress,
} from "@/hooks/api";
import { apiAddressToForm, addressesEqual } from "@/utils/profile-helpers";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressFieldGroup } from "@/components/address-field-group";

export function AddressForm() {
  const router = useRouter();

  const { data: account, isLoading } = useAccount();
  const existingPresentAddress = account?.addresses?.find(
    (a) => a.type === "PRESENT"
  );
  const existingPermanentAddress = account?.addresses?.find(
    (a) => a.type === "PERMANENT"
  );

  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();
  const loading =
    createAddressMutation.isPending || updateAddressMutation.isPending;

  const emptyAddress = {
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  };

  const form = useForm<AddressFormData>({
    resolver: yupResolver(addressSchema),
    defaultValues: {
      presentAddress: emptyAddress,
      sameAsPresent: false,
      permanentAddress: emptyAddress,
    },
  });

  const sameAsPresent = form.watch("sameAsPresent");
  const hasPopulated = useRef(false);

  useEffect(() => {
    if (!account || hasPopulated.current) return;
    hasPopulated.current = true;

    const present = account.addresses?.find((a) => a.type === "PRESENT");
    const permanent = account.addresses?.find((a) => a.type === "PERMANENT");

    const values: Partial<AddressFormData> = {};

    if (present) {
      const presentForm = apiAddressToForm(present);
      values.presentAddress = presentForm;

      if (permanent) {
        const permanentForm = apiAddressToForm(permanent);
        values.permanentAddress = permanentForm;
        values.sameAsPresent = addressesEqual(presentForm, permanentForm);
      }
    } else if (permanent) {
      values.permanentAddress = apiAddressToForm(permanent);
    }

    form.reset({ ...form.getValues(), ...values });
  }, [account, form]);

  const onSubmit = async (data: AddressFormData) => {
    try {
      const presentData = {
        type: "PRESENT" as const,
        addressLine1: data.presentAddress.addressLine1,
        addressLine2: data.presentAddress.addressLine2 || undefined,
        city: data.presentAddress.city,
        state: data.presentAddress.state,
        postalCode: data.presentAddress.postalCode,
        country: data.presentAddress.country,
        isDefault: true,
      };

      const finalPermanent = data.sameAsPresent
        ? data.presentAddress
        : data.permanentAddress;
      const permanentData = {
        type: "PERMANENT" as const,
        addressLine1: finalPermanent.addressLine1,
        addressLine2: finalPermanent.addressLine2 || undefined,
        city: finalPermanent.city,
        state: finalPermanent.state,
        postalCode: finalPermanent.postalCode,
        country: finalPermanent.country,
      };

      const presentPromise = existingPresentAddress
        ? updateAddressMutation.mutateAsync({
            id: existingPresentAddress.id,
            data: presentData,
          })
        : createAddressMutation.mutateAsync(presentData);

      const permanentPromise = existingPermanentAddress
        ? updateAddressMutation.mutateAsync({
            id: existingPermanentAddress.id,
            data: permanentData,
          })
        : createAddressMutation.mutateAsync(permanentData);

      await Promise.all([presentPromise, permanentPromise]);

      toast.success("Addresses updated successfully");
      router.replace("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Edit addresses</CardTitle>
        <CardDescription>Where do you live?</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AddressFieldGroup prefix="presentAddress" title="Present Address" />

            {/* Same as present checkbox */}
            <FormField
              control={form.control}
              name="sameAsPresent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 text-sm font-normal text-muted-foreground">
                    Permanent address same as present
                  </FormLabel>
                </FormItem>
              )}
            />

            {!sameAsPresent && (
              <AddressFieldGroup prefix="permanentAddress" title="Permanent Address" />
            )}

            <div className="space-y-3 pt-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {existingPresentAddress || existingPermanentAddress
                  ? "Update"
                  : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
