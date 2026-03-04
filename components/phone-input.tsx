"use client";

import { useMemo, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";
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

// Sort countries by dial code length (longest first) for proper matching
const countriesByDialLength = [...COUNTRIES].sort(
  (a, b) => b.dial.length - a.dial.length
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
      value.startsWith(c.dial)
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
    // Focus the input after country selection
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
          "border-input flex h-11 w-full items-center rounded-lg border shadow-xs transition-[color,box-shadow]",
          "dark:bg-input/30 dark:border-input",
          focused && !error && "border-ring ring-ring/50 ring-[3px]",
          error && "border-destructive ring-destructive/20 dark:ring-destructive/40"
        )}
      >
        {/* Country code selector */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              role="combobox"
              aria-expanded={open}
              className="flex shrink-0 items-center gap-1.5 rounded-l-lg px-3 outline-none transition-colors hover:bg-accent/50"
            >
              <span className="text-lg leading-none">
                {getFlagEmoji(selectedCountry.code)}
              </span>
              <span className="text-sm font-medium">
                {selectedCountry.dial}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0">
            <Command>
              <CommandInput placeholder="Search country..." />
              <CommandList>
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {COUNTRIES.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={`${country.name} ${country.dial}`}
                      onSelect={() => handleCountrySelect(country.code)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCountry.code === country.code
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <span className="text-lg leading-none">
                        {getFlagEmoji(country.code)}
                      </span>{" "}
                      {country.name}{" "}
                      <span className="ml-auto text-muted-foreground">
                        {country.dial}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <div className="h-5 w-px shrink-0 bg-border" />

        {/* Phone number input */}
        <input
          ref={inputRef}
          type="tel"
          className="placeholder:text-muted-foreground h-full flex-1 bg-transparent px-3 text-base outline-none md:text-sm"
          value={localNumber}
          onChange={handleLocalNumberChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
