"use client";

import * as React from "react";
import { Loader2, MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AutocompletePrediction } from "@/types/address";

interface AddressAutocompleteProps {
  value: string;
  onChange: (text: string) => void;
  onSelect: (prediction: AutocompletePrediction) => void;
  suggestions: AutocompletePrediction[];
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  name?: string;
  onBlur?: () => void;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  suggestions,
  isLoading = false,
  placeholder = "Search for an address",
  disabled = false,
  invalid = false,
  id,
  name,
  onBlur,
}: AddressAutocompleteProps) {
  const [focused, setFocused] = React.useState(false);
  const open = focused && !disabled && (suggestions.length > 0 || isLoading);

  const handleSelect = (prediction: AutocompletePrediction) => {
    onSelect(prediction);
    setFocused(false);
  };

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
        <MapPin className="size-4" />
      </span>
      <Input
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-invalid={invalid || undefined}
        className={cn("pl-10", isLoading && "pr-10")}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
      />
      {isLoading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
        </span>
      )}

      {open && (
        <ul
          role="listbox"
          className={cn(
            "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-input",
            "bg-popover/95 p-1 shadow-soft backdrop-blur-sm",
          )}
        >
          {suggestions.length === 0 && isLoading ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">Searching…</li>
          ) : (
            suggestions.map((prediction) => (
              <li key={prediction.placeId}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  // Fire before the input blur so the click isn't swallowed.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(prediction)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-md px-3 py-2 text-left",
                    "hover:bg-accent focus:bg-accent focus:outline-none",
                  )}
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {prediction.mainText}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {prediction.secondaryText}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
