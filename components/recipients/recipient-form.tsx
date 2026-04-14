"use client";

import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PhoneInput } from "@/components/phone-input";
import { cn } from "@/lib/utils";

export interface RecipientFormProps {
  defaultValues?: Partial<RecipientFormData>;
  submitLabel?: string;
  onSubmit: (data: RecipientFormData) => Promise<void> | void;
  submitting?: boolean;
}

export function RecipientForm({
  defaultValues,
  submitLabel = "Save recipient",
  onSubmit,
  submitting,
}: RecipientFormProps) {
  const form = useForm<RecipientFormData>({
    resolver: yupResolver(recipientSchema) as unknown as Resolver<RecipientFormData>,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input placeholder="Asha" {...field} />
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
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input placeholder="Patel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="asha@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <PhoneInput
                label="Phone"
                value={form.getValues("phoneNumberPrefix") + field.value}
                onChangePhone={(fullPhone) => {
                  const prefix = form.getValues("phoneNumberPrefix");
                  if (fullPhone.startsWith(prefix)) {
                    field.onChange(fullPhone.substring(prefix.length));
                  } else {
                    field.onChange(fullPhone.replace(/^\+\d{1,4}/, ""));
                  }
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
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of birth</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <button
                      type="button"
                      className={cn(
                        "border-input flex h-11 w-full items-center gap-2 rounded-lg border bg-transparent px-4 text-left text-base font-normal shadow-xs md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                        "hover:bg-accent/50",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="h-4 w-4 shrink-0 opacity-60" />
                      <span className="flex-1">
                        {field.value
                          ? format(new Date(field.value), "PPP")
                          : "Select a date"}
                      </span>
                    </button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) =>
                      field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                    }
                    disabled={(date) => date > new Date()}
                    captionLayout="dropdown"
                    defaultMonth={
                      field.value ? new Date(field.value) : new Date(1990, 0)
                    }
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
          name="addressLine1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address line 1</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="addressLine2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address line 2 (optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
