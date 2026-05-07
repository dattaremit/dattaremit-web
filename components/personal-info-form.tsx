"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { personalInfoSchema, type PersonalInfoFormData } from "@/schemas/personal-info.schema";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useCreateUser, useUpdateUser } from "@/hooks/api";
import { queryKeys } from "@/constants/query-keys";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { ROUTES } from "@/constants/routes";
import { stripPhonePrefix } from "@/lib/phone-utils";
import safeStorage from "@/lib/safe-storage";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateSelect } from "@/components/ui/date-select";
import { TextField } from "@/components/ui/text-field";
import { PageHeader } from "@/components/ui/page-header";
import { FormSkeletonLoader } from "@/components/ui/form-skeleton-loader";
import { PhoneInput } from "@/components/phone-input";

export interface PersonalInfoFormProps {
  nextHrefOnCreate?: string;
  nextHrefOnUpdate?: string;
  onAfterSubmit?: (mode: "create" | "update") => void | Promise<void>;
  chromeless?: boolean;
  title?: string;
  description?: string;
  submitLabel?: { create?: string; update?: string };
}

export function PersonalInfoForm({
  nextHrefOnCreate = ROUTES.EDIT_ADDRESSES,
  nextHrefOnUpdate,
  onAfterSubmit,
  chromeless = false,
  title,
  description,
  submitLabel,
}: PersonalInfoFormProps = {}) {
  const router = useRouter();
  const { user: clerkUser } = useUser();

  const { data: account, isLoading } = useAccount();
  const existingUser = account?.user;
  const isExistingUser = !!existingUser;

  const queryClient = useQueryClient();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const loading = createUserMutation.isPending || updateUserMutation.isPending;

  const form = useForm<PersonalInfoFormData>({
    resolver: yupResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumberPrefix: "+1",
      phoneNumber: "",
      dateOfBirth: "",
    },
  });

  const hasPopulated = useRef(false);

  useEffect(() => {
    if (!account?.user || hasPopulated.current) return;
    hasPopulated.current = true;

    const u = account.user;
    form.reset({
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      phoneNumberPrefix: u.phoneNumberPrefix || "+1",
      phoneNumber: u.phoneNumber || "",
      dateOfBirth: u.dateOfBirth ? u.dateOfBirth.substring(0, 10) : "",
    });
  }, [account, form]);

  const onSubmit = async (data: PersonalInfoFormData) => {
    try {
      if (isExistingUser) {
        await updateUserMutation.mutateAsync({
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumberPrefix: data.phoneNumberPrefix,
          phoneNumber: data.phoneNumber,
          dateOfBirth: data.dateOfBirth,
          nationality: "US",
        });
      } else {
        await createUserMutation.mutateAsync({
          clerkUserId: clerkUser?.id || "",
          firstName: data.firstName,
          lastName: data.lastName,
          email: clerkUser?.emailAddresses[0]?.emailAddress || "",
          phoneNumberPrefix: data.phoneNumberPrefix,
          phoneNumber: data.phoneNumber,
          dateOfBirth: data.dateOfBirth,
          nationality: "US",
        });

        safeStorage.removeItem(STORAGE_KEYS.REFERRAL_CODE);
      }

      if (!isExistingUser) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.account });
      }

      toast.success(
        isExistingUser ? "Profile updated successfully" : "Profile created successfully",
      );

      if (onAfterSubmit) {
        await onAfterSubmit(isExistingUser ? "update" : "create");
      } else if (!isExistingUser) {
        router.push(nextHrefOnCreate);
      } else if (nextHrefOnUpdate) {
        router.push(nextHrefOnUpdate);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    }
  };

  if (isLoading) {
    return <FormSkeletonLoader fieldCount={4} chromeless={chromeless} />;
  }

  const headerTitle = title ?? "Edit your profile";
  const headerDescription = description ?? "Tell us about yourself.";
  const submitText = isExistingUser
    ? (submitLabel?.update ?? "Save changes")
    : (submitLabel?.create ?? "Continue");

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <TextField
            control={form.control}
            name="firstName"
            label="First name"
            placeholder="John"
          />
          <TextField control={form.control} name="lastName" label="Last name" placeholder="Doe" />
        </div>

        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input
              value={account?.user?.email || clerkUser?.emailAddresses[0]?.emailAddress || ""}
              disabled
              readOnly
            />
          </FormControl>
        </FormItem>

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <PhoneInput
                label="Phone number"
                value={form.getValues("phoneNumberPrefix") + field.value}
                onChangePhone={(fullPhone) => {
                  field.onChange(stripPhonePrefix(fullPhone, form.getValues("phoneNumberPrefix")));
                }}
                onChangeCountry={(dialCode) => {
                  form.setValue("phoneNumberPrefix", dialCode);
                }}
                placeholder="1XXX-XXXXXX"
                error={form.formState.errors.phoneNumber?.message}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field, fieldState }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of birth</FormLabel>
              <FormControl>
                <DateSelect
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!fieldState.error}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="brand" size="lg" className="w-full" loading={loading}>
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
      <PageHeader eyebrow="Profile" title={headerTitle} subtitle={headerDescription} />
      <Card variant="elevated" className="p-6 sm:p-8">
        {formContent}
      </Card>
    </div>
  );
}
