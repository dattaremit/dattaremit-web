"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  personalInfoSchema,
  type PersonalInfoFormData,
} from "@/schemas/personal-info.schema";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useCreateUser, useUpdateUser } from "@/hooks/api";
import { queryKeys } from "@/constants/query-keys";
import { toast } from "sonner";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { PhoneInput } from "@/components/phone-input";
import { CountrySelector } from "@/components/country-selector";
import { cn } from "@/lib/utils";

export interface PersonalInfoFormProps {
  /** Where to navigate after a successful create. Defaults to "/edit-addresses". */
  nextHrefOnCreate?: string;
  /** Where to navigate after a successful update. Defaults to staying put. */
  nextHrefOnUpdate?: string;
  /** Optional callback fired after a successful save. Takes precedence over
   *  the static next-href props. Used by onboarding to compute the destination
   *  from fresh server state. */
  onAfterSubmit?: (mode: "create" | "update") => void | Promise<void>;
  /** When true, skip the surrounding Card chrome. */
  chromeless?: boolean;
  title?: string;
  description?: string;
  submitLabel?: { create?: string; update?: string };
}

export function PersonalInfoForm({
  nextHrefOnCreate = "/edit-addresses",
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
      nationality: "",
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
      phoneNumberPrefix: u.phoneNumberPrefix || "+880",
      phoneNumber: u.phoneNumber || "",
      dateOfBirth: u.dateOfBirth
        ? u.dateOfBirth.substring(0, 10)
        : "",
      nationality: (u as Record<string, unknown>).nationality as string || "",
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
          nationality: data.nationality,
        });
      } else {
        const referralCode = localStorage.getItem("referral_code") || undefined;

        await createUserMutation.mutateAsync({
          clerkUserId: clerkUser?.id || "",
          firstName: data.firstName,
          lastName: data.lastName,
          email:
            clerkUser?.emailAddresses[0]?.emailAddress || "",
          publicKey: "",
          phoneNumberPrefix: data.phoneNumberPrefix,
          phoneNumber: data.phoneNumber,
          dateOfBirth: data.dateOfBirth,
          nationality: data.nationality,
          referredByCode: referralCode,
        });

        localStorage.removeItem("referral_code");
      }

      if (!isExistingUser) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.account });
      }

      toast.success(
        isExistingUser
          ? "Profile updated successfully"
          : "Profile created successfully"
      );

      if (onAfterSubmit) {
        await onAfterSubmit(isExistingUser ? "update" : "create");
      } else if (!isExistingUser) {
        router.push(nextHrefOnCreate);
      } else if (nextHrefOnUpdate) {
        router.push(nextHrefOnUpdate);
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
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
    if (chromeless) return skeletons;
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
        </CardHeader>
        <CardContent>{skeletons}</CardContent>
      </Card>
    );
  }

  const headerTitle = title ?? "Edit your profile";
  const headerDescription = description ?? "Tell us about yourself";
  const submitText = isExistingUser
    ? submitLabel?.update ?? "Update"
    : submitLabel?.create ?? "Save";

  const formContent = (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    label="Phone Number"
                    value={
                      form.getValues("phoneNumberPrefix") + field.value
                    }
                    onChangePhone={(fullPhone) => {
                      // Parse the full phone back into prefix and number
                      const prefix = form.getValues("phoneNumberPrefix");
                      if (fullPhone.startsWith(prefix)) {
                        field.onChange(fullPhone.substring(prefix.length));
                      } else {
                        // Country changed - find new prefix
                        field.onChange(fullPhone.replace(/^\+\d{1,4}/, ""));
                      }
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
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <button
                          type="button"
                          className={cn(
                            "border-input flex h-11 w-full items-center gap-2 rounded-lg border bg-transparent px-4 text-left text-base font-normal shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
                            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                            "dark:bg-input/30 dark:border-input",
                            "hover:bg-accent/50",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="h-4 w-4 shrink-0 opacity-60" />
                          <span className="flex-1">
                            {field.value
                              ? format(new Date(field.value), "PPP")
                              : "Select your date of birth"}
                          </span>
                        </button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) =>
                          field.onChange(
                            date ? format(date, "yyyy-MM-dd") : ""
                          )
                        }
                        disabled={(date) => date > new Date()}
                        defaultMonth={
                          field.value ? new Date(field.value) : new Date(2000, 0)
                        }
                        captionLayout="dropdown"
                        startMonth={new Date(1920, 0)}
                        endMonth={new Date(new Date().getFullYear(), 11)}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <CountrySelector
                    label="Nationality"
                    value={field.value}
                    onSelect={field.onChange}
                    placeholder="Select nationality"
                    error={form.formState.errors.nationality?.message}
                  />
                </FormItem>
              )}
            />

            <div className="space-y-3 pt-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {submitText}
              </Button>
            </div>
          </form>
        </Form>
  );

  if (chromeless) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{headerTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{headerDescription}</p>
        </div>
        {formContent}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{headerTitle}</CardTitle>
        <CardDescription>{headerDescription}</CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}
