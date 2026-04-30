"use client";

import * as React from "react";
import { Check, ChevronDown, Calendar as CalendarIcon } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const pad2 = (n: number) => n.toString().padStart(2, "0");

function daysInMonth(year: number, monthIndex: number) {
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) return 31;
  return new Date(year, monthIndex + 1, 0).getDate();
}

function parse(value: string | undefined) {
  if (!value) return { day: undefined, month: undefined, year: undefined };
  const [y, m, d] = value.split("-");
  return {
    day: d ? Number(d) : undefined,
    month: m ? Number(m) - 1 : undefined,
    year: y ? Number(y) : undefined,
  };
}

function format(day: number | undefined, month: number | undefined, year: number | undefined) {
  if (day === undefined || month === undefined || year === undefined) return "";
  const maxDay = daysInMonth(year, month);
  const clamped = Math.min(day, maxDay);
  return `${year}-${pad2(month + 1)}-${pad2(clamped)}`;
}

type DateSelectProps = {
  value?: string;
  onChange: (value: string) => void;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  id?: string;
};

export function DateSelect({
  value,
  onChange,
  minYear = 1920,
  maxYear = new Date().getFullYear(),
  disabled,
  invalid,
  className,
  id,
}: DateSelectProps) {
  const parsed = parse(value);
  const [day, setDay] = React.useState<number | undefined>(parsed.day);
  const [month, setMonth] = React.useState<number | undefined>(parsed.month);
  const [year, setYear] = React.useState<number | undefined>(parsed.year);

  // Sync inbound value changes (e.g. form.reset)
  React.useEffect(() => {
    const p = parse(value);
    setDay(p.day);
    setMonth(p.month);
    setYear(p.year);
  }, [value]);

  const maxDay = React.useMemo(
    () => (month !== undefined && year !== undefined ? daysInMonth(year, month) : 31),
    [month, year],
  );

  // Auto-emit a complete ISO date whenever all three are set
  const emit = (d: number | undefined, m: number | undefined, y: number | undefined) => {
    const iso = format(d, m, y);
    if (iso) onChange(iso);
  };

  const onSelectDay = (d: number) => {
    setDay(d);
    emit(d, month, year);
  };
  const onSelectMonth = (m: number) => {
    setMonth(m);
    const safeDay = day !== undefined ? Math.min(day, daysInMonth(year ?? maxYear, m)) : day;
    if (safeDay !== undefined && safeDay !== day) setDay(safeDay);
    emit(safeDay, m, year);
  };
  const onSelectYear = (y: number) => {
    setYear(y);
    const safeDay =
      day !== undefined && month !== undefined ? Math.min(day, daysInMonth(y, month)) : day;
    if (safeDay !== undefined && safeDay !== day) setDay(safeDay);
    emit(safeDay, month, y);
  };

  const days = React.useMemo(() => Array.from({ length: maxDay }, (_, i) => i + 1), [maxDay]);
  const years = React.useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i),
    [minYear, maxYear],
  );

  return (
    <div
      id={id}
      aria-invalid={invalid || undefined}
      className={cn(
        "group flex h-11 items-stretch overflow-hidden rounded-lg border border-input bg-card/60 shadow-soft backdrop-blur-sm transition-all",
        "hover:border-foreground/20",
        "focus-within:border-brand focus-within:bg-card focus-within:ring-[3px] focus-within:ring-brand/30",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
    >
      <span className="pointer-events-none flex items-center pl-3 text-muted-foreground">
        <CalendarIcon className="size-4" />
      </span>

      <Segment label="Day" placeholder="DD" display={day !== undefined ? pad2(day) : undefined}>
        <OptionList
          options={days.map((d) => ({
            value: d,
            label: pad2(d),
          }))}
          selected={day}
          onSelect={onSelectDay}
        />
      </Segment>

      <Divider />

      <Segment
        label="Month"
        placeholder="Month"
        display={month !== undefined ? MONTHS[month] : undefined}
        grow
      >
        <OptionList
          options={MONTHS.map((m, i) => ({ value: i, label: m }))}
          selected={month}
          onSelect={onSelectMonth}
        />
      </Segment>

      <Divider />

      <Segment
        label="Year"
        placeholder="YYYY"
        display={year !== undefined ? year.toString() : undefined}
      >
        <OptionList
          options={years.map((y) => ({ value: y, label: y.toString() }))}
          selected={year}
          onSelect={onSelectYear}
        />
      </Segment>
    </div>
  );
}

function Divider() {
  return <span aria-hidden="true" className="my-2 w-px bg-border" />;
}

function Segment({
  label,
  placeholder,
  display,
  grow,
  children,
}: {
  label: string;
  placeholder: string;
  display?: string;
  grow?: boolean;
  children: React.ReactNode;
}) {
  const filled = display !== undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "group/seg flex items-center gap-1.5 px-3 text-sm outline-none transition-colors hover:bg-accent/40 focus-visible:bg-accent/40",
            grow ? "flex-1 min-w-0" : "shrink-0",
          )}
        >
          <span
            className={cn(
              "truncate tabular",
              filled ? "font-medium text-foreground" : "text-muted-foreground/70",
            )}
          >
            {filled ? display : placeholder}
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover/seg:text-muted-foreground group-data-[state=open]/seg:rotate-180" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="p-1 w-[var(--radix-popover-trigger-width)] min-w-36"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

type Opt<T extends number> = { value: T; label: string };

function OptionList<T extends number>({
  options,
  selected,
  onSelect,
}: {
  options: Opt<T>[];
  selected: T | undefined;
  onSelect: (value: T) => void;
}) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const selectedRef = React.useRef<HTMLButtonElement>(null);

  // Scroll the selected option into view when the popover opens.
  React.useEffect(() => {
    if (!selectedRef.current || !listRef.current) return;
    const el = selectedRef.current;
    const parent = listRef.current;
    parent.scrollTo({ top: el.offsetTop - parent.clientHeight / 2 + el.clientHeight / 2 });
  }, []);

  return (
    <div ref={listRef} role="listbox" className="max-h-60 overflow-y-auto overscroll-contain">
      {options.map((opt) => {
        const isSelected = opt.value === selected;
        return (
          <button
            key={opt.value}
            ref={isSelected ? selectedRef : undefined}
            role="option"
            aria-selected={isSelected}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-sm outline-none transition-colors",
              "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent",
              isSelected && "bg-brand/10 text-foreground",
            )}
          >
            <span className="tabular">{opt.label}</span>
            {isSelected && <Check className="size-3.5 text-brand" />}
          </button>
        );
      })}
    </div>
  );
}
