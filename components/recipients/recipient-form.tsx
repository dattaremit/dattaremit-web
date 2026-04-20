"use client";

import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  recipientSchema,
  type RecipientFormData,
} from "@/schemas/recipient.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DateSelect } from "@/components/ui/date-select";
import { TextField } from "@/components/ui/text-field";
import { PhoneInput } from "@/components/phone-input";
import { useCheckEmailAvailability } from "@/hooks/api";
import { stripPhonePrefix } from "@/lib/phone-utils";

export interface RecipientFormProps {
  defaultValues?: Partial<RecipientFormData>;
  submitLabel?: string;
  onSubmit: (data: RecipientFormData) => Promise<void> | void;
  submitting?: boolean;
  /**
   * The recipient's current email (for edit flows). When the entered email
   * equals this value, the availability check is skipped so the user isn't
   * blocked from saving unrelated edits.
   */
  originalEmail?: string;
}

export function RecipientForm({
  defaultValues,
  submitLabel = "Save recipient",
  onSubmit,
  submitting,
  originalEmail,
}: RecipientFormProps) {
  const form = useForm<RecipientFormData>({
    resolver: yupResolver(
      recipientSchema,
    ) as unknown as Resolver<RecipientFormData>,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumberPrefix: "+91",
      phoneNumber: "",
      dateOfBirth: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      ...defaultValues,
    },
  });

  const emailValue = form.watch("email") ?? "";
  const isUnchanged =
    !!originalEmail &&
    emailValue.trim().toLowerCase() === originalEmail.trim().toLowerCase();
  const { available, isChecking } = useCheckEmailAvailability(
    isUnchanged ? "" : emailValue,
    "recipient",
  );
  const emailTaken = !isUnchanged && available === false;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="firstName"
            label="First name"
            placeholder="Asha"
          />
          <TextField
            control={form.control}
            name="lastName"
            label="Last name"
            placeholder="Patel"
          />
        </div>

        <div>
          <TextField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            placeholder="asha@example.com"
          />
          {emailTaken && (
            <p className="mt-1.5 text-sm text-destructive">
              You already have a recipient with this email.
            </p>
          )}
          {isChecking && !emailTaken && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              Checking availability…
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <PhoneInput
                label="Phone"
                value={form.getValues("phoneNumberPrefix") + field.value}
                onChangePhone={(fullPhone) => {
                  field.onChange(
                    stripPhonePrefix(
                      fullPhone,
                      form.getValues("phoneNumberPrefix"),
                    ),
                  );
                }}
                onChangeCountry={(dialCode) =>
                  form.setValue("phoneNumberPrefix", dialCode)
                }
                placeholder="9XXXXXXXXX"
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

        <TextField
          control={form.control}
          name="addressLine1"
          label="Address line 1"
        />
        <TextField
          control={form.control}
          name="addressLine2"
          label="Address line 2"
          placeholder="Optional"
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <TextField control={form.control} name="city" label="City" />
          <TextField control={form.control} name="state" label="State" />
          <TextField
            control={form.control}
            name="postalCode"
            label="Postal code"
          />
        </div>

        <Button
          type="submit"
          variant="brand"
          size="lg"
          className="w-full"
          loading={submitting}
          disabled={emailTaken}
        >
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
