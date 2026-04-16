"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES, type Country, getFlagEmoji } from "@/constants/countries";

interface CountrySelectorProps {
  label?: string;
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
  countries?: Country[];
}

export function CountrySelector({
  label,
  value,
  onSelect,
  placeholder = "Select country",
  error,
  countries = COUNTRIES,
}: CountrySelectorProps) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select value={value || undefined} onValueChange={onSelect}>
        <SelectTrigger aria-invalid={!!error || undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="text-lg leading-none">
                {getFlagEmoji(country.code)}
              </span>
              <span>{country.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
