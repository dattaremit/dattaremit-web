"use client";

import * as React from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label?: React.ReactNode;
  description?: React.ReactNode;
  trailing?: React.ReactNode;
  leading?: React.ReactNode;
  transform?: (value: string) => string;
  className?: string;
  inputClassName?: string;
} & Omit<React.ComponentProps<"input">, "name" | "defaultValue" | "value" | "onChange" | "onBlur">;

export function TextField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  trailing,
  leading,
  transform,
  className,
  inputClassName,
  ...inputProps
}: TextFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel className="text-sm font-medium text-foreground/90">{label}</FormLabel>
          )}
          <FormControl>
            <div className="relative">
              {leading && (
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {leading}
                </span>
              )}
              <Input
                {...inputProps}
                value={field.value ?? ""}
                onBlur={field.onBlur}
                onChange={(e) =>
                  field.onChange(transform ? transform(e.target.value) : e.target.value)
                }
                ref={field.ref}
                className={cn(leading && "pl-10", trailing && "pr-10", inputClassName)}
              />
              {trailing && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {trailing}
                </span>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
