"use client";

import { useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  COUNTRIES,
  DEFAULT_COUNTRY_CODE,
  getFlagEmoji,
} from "@/constants/countries";

interface PhoneInputProps {
  label?: string;
  value: string;
  onChangePhone: (value: string) => void;
  onChangeCountry?: (dialCode: string) => void;
  placeholder?: string;
  error?: string;
  defaultCountryCode?: string;
}

const countriesByDialLength = [...COUNTRIES].sort(
  (a, b) => b.dial.length - a.dial.length,
);

export function PhoneInput({
  label,
  value,
  onChangePhone,
  onChangeCountry,
  placeholder = "Enter phone number",
  error,
  defaultCountryCode = DEFAULT_COUNTRY_CODE,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { selectedCountry, localNumber } = useMemo(() => {
    if (!value) {
      const country =
        COUNTRIES.find((c) => c.code === defaultCountryCode) || COUNTRIES[0];
      return { selectedCountry: country, localNumber: "" };
    }

    const matched = countriesByDialLength.find((c) =>
      value.startsWith(c.dial),
    );
    if (matched) {
      return {
        selectedCountry: matched,
        localNumber: value.substring(matched.dial.length),
      };
    }

    const country =
      COUNTRIES.find((c) => c.code === defaultCountryCode) || COUNTRIES[0];
    return { selectedCountry: country, localNumber: value };
  }, [value, defaultCountryCode]);

  const handleCountrySelect = (countryCode: string) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    if (country) {
      onChangePhone(country.dial + localNumber);
      onChangeCountry?.(country.dial);
    }
    setOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangePhone(selectedCountry.dial + e.target.value);
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div
        className={cn(
          "flex h-11 w-full items-center rounded-lg border border-input bg-card/60 shadow-soft backdrop-blur-sm transition-all",
          "hover:border-foreground/20",
          focused && !error && "border-brand bg-card ring-[3px] ring-brand/30",
          error && "border-destructive ring-[3px] ring-destructive/20",
        )}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Select country"
              className="flex shrink-0 items-center gap-1.5 rounded-l-lg px-3 outline-none transition-colors hover:bg-accent/40"
            >
              <span className="text-lg leading-none">
                {getFlagEmoji(selectedCountry.code)}
              </span>
              <span className="text-sm font-medium">
                {selectedCountry.dial}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={8} className="w-56 p-1">
            <div role="listbox" className="flex flex-col">
              {COUNTRIES.map((country) => {
                const isSelected = selectedCountry.code === country.code;
                return (
                  <button
                    key={country.code}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => handleCountrySelect(country.code)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none transition-colors",
                      "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent",
                      isSelected && "bg-brand/10",
                    )}
                  >
                    <span className="text-lg leading-none">
                      {getFlagEmoji(country.code)}
                    </span>
                    <span className="flex-1 text-left">{country.name}</span>
                    <span className="text-muted-foreground">
                      {country.dial}
                    </span>
                    {isSelected && (
                      <Check className="size-3.5 shrink-0 text-brand" />
                    )}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        <div className="h-5 w-px shrink-0 bg-border" />

        <input
          ref={inputRef}
          type="tel"
          className="h-full flex-1 bg-transparent px-3 text-base placeholder:text-muted-foreground/70 outline-none md:text-sm"
          value={localNumber}
          onChange={handleLocalNumberChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
        />
      </div>
      <p className="min-h-5 text-sm text-destructive">{error || " "}</p>
    </div>
  );
}
