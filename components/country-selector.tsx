"use client";

import { useState } from "react";
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
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { COUNTRIES, getFlagEmoji } from "@/constants/countries";

interface CountrySelectorProps {
  label?: string;
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function CountrySelector({
  label,
  value,
  onSelect,
  placeholder = "Select country",
  error,
}: CountrySelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedCountry = COUNTRIES.find((c) => c.code === value);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "border-input flex h-11 w-full items-center justify-between rounded-lg border bg-transparent px-4 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "dark:bg-input/30 dark:border-input",
              error && "border-destructive ring-destructive/20 dark:ring-destructive/40",
              !error && "hover:bg-accent/50"
            )}
          >
            {selectedCountry ? (
              <span className="flex items-center gap-2 truncate">
                <span className="text-lg leading-none">{getFlagEmoji(selectedCountry.code)}</span>
                <span>{selectedCountry.name}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {COUNTRIES.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.code}`}
                    onSelect={() => {
                      onSelect(country.code);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === country.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="text-lg leading-none">{getFlagEmoji(country.code)}</span>{" "}
                    {country.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
