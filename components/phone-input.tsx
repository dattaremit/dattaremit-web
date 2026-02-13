"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
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
  placeholder,
  error,
  defaultCountryCode = DEFAULT_COUNTRY_CODE,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);

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
  };

  const handleLocalNumberChange = (num: string) => {
    onChangePhone(selectedCountry.dial + num);
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[120px] justify-between px-2"
            >
              <span className="truncate">
                {getFlagEmoji(selectedCountry.code)} {selectedCountry.dial}
              </span>
              <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
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
                      {getFlagEmoji(country.code)} {country.name} ({country.dial})
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Input
          className="flex-1"
          value={localNumber}
          onChange={(e) => handleLocalNumberChange(e.target.value)}
          placeholder={placeholder}
          type="tel"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
