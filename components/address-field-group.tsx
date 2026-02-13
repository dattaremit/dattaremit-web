"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { CountrySelector } from "@/components/country-selector";

interface AddressFieldGroupProps {
  prefix: "presentAddress" | "permanentAddress";
  title: string;
}

export function AddressFieldGroup({ prefix, title }: AddressFieldGroupProps) {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <FormField
        control={form.control}
        name={`${prefix}.addressLine1`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address</FormLabel>
            <FormControl>
              <Input placeholder="Enter street address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${prefix}.addressLine2`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address Line 2 (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Apt, Suite, Floor, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name={`${prefix}.city`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="Enter city" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}.state`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>State / Division</FormLabel>
              <FormControl>
                <Input placeholder="Enter state" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name={`${prefix}.postalCode`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Postal Code</FormLabel>
            <FormControl>
              <Input placeholder="Enter postal code" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`${prefix}.country`}
        render={({ field }) => {
          const addressErrors = form.formState.errors[prefix] as
            | FieldErrors<{ country: string }>
            | undefined;
          return (
            <FormItem>
              <CountrySelector
                label="Country"
                value={field.value}
                onSelect={field.onChange}
                placeholder="Select country"
                error={addressErrors?.country?.message}
              />
            </FormItem>
          );
        }}
      />
    </div>
  );
}
