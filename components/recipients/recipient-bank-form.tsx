"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Loader2 } from "lucide-react";
import {
  recipientBankSchema,
  type RecipientBankFormData,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface RecipientBankFormProps {
  defaultValues?: Partial<RecipientBankFormData>;
  submitLabel?: string;
  onSubmit: (data: RecipientBankFormData) => Promise<void> | void;
  submitting?: boolean;
}

export function RecipientBankForm({
  defaultValues,
  submitLabel = "Save bank",
  onSubmit,
  submitting,
}: RecipientBankFormProps) {
  const form = useForm<RecipientBankFormData>({
    resolver: yupResolver(recipientBankSchema),
    defaultValues: {
      bankName: "",
      accountName: "",
      accountNumber: "",
      ifsc: "",
      branchName: "",
      bankAccountType: "SAVINGS",
      phoneNumber: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank name</FormLabel>
              <FormControl>
                <Input placeholder="State Bank of India" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account holder name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account number</FormLabel>
                <FormControl>
                  <Input inputMode="numeric" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ifsc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IFSC</FormLabel>
                <FormControl>
                  <Input
                    placeholder="SBIN0001234"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="branchName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="bankAccountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
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
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone number</FormLabel>
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
