// Search and filter orders via URL: debounced `name`, `status`, `delivery`, `date` (+ `from`/`to` for range).

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CalendarIcon, XIcon } from "lucide-react";
import { type ReactNode, useEffect, useState, useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "use-debounce";
import { format, parse } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  type DatePresetParam,
  parseDatePreset,
  parseDeliveryFilter,
  parseStatusFilter,
  parseYmdParam,
} from "@/lib/order-filters";
import { orderStatuses } from "@/lib/order-helpers";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const NAME_DEBOUNCE_MS = 700;

function statusLabel(s: string): string {
  return s.replace(/-/g, " ");
}

function datePresetLabel(
  preset: DatePresetParam,
  fromYmd: string | null,
  toYmd: string | null,
): string {
  if (preset === "all") return "All";
  if (preset === "today") return "Today";
  if (preset === "yesterday") return "Yesterday";
  if (preset === "week") return "This week";
  if (preset === "month") return "This month";
  if (preset === "range" && fromYmd && toYmd) {
    const a = parse(fromYmd, "yyyy-MM-dd", new Date());
    const b = parse(toYmd, "yyyy-MM-dd", new Date());
    return `${format(a, "MMM d")} – ${format(b, "MMM d, yyyy")}`;
  }
  return "Custom range";
}

function ymdRangeToDateRange(
  fromYmd: string | null,
  toYmd: string | null,
): DateRange | undefined {
  if (!fromYmd || !toYmd) return undefined;
  const from = parse(fromYmd, "yyyy-MM-dd", new Date());
  const to = parse(toYmd, "yyyy-MM-dd", new Date());
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return undefined;
  return { from, to };
}

function FilterField({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("flex min-w-0 flex-col gap-1", className)}
    >
      <Label
        htmlFor={htmlFor}
        className="text-[0.65rem] text-muted-foreground uppercase tracking-wide"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}

export default function OrdersFilterSearch() {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const status = parseStatusFilter(searchParams.get("status"));
  const delivery = parseDeliveryFilter(searchParams.get("delivery"));
  const datePreset = parseDatePreset(searchParams.get("date"));
  const fromYmd = parseYmdParam(searchParams.get("from"));
  const toYmd = parseYmdParam(searchParams.get("to"));

  const nameFromUrl = searchParams.get("name") || "";

  const [nameInput, setNameInput] = useState(nameFromUrl);
  const [debouncedName] = useDebounce(nameInput, NAME_DEBOUNCE_MS);
  const [rangeOpen, setRangeOpen] = useState(false);

  const router = useRouter();
  const currentPath = usePathname();

  useEffect(() => {
    setNameInput(nameFromUrl);
  }, [nameFromUrl]);

  useEffect(() => {
    const trimmedInput = nameInput.trim();
    const trimmedDebounced = debouncedName.trim();
    const urlTrimmed = nameFromUrl.trim();

    if (trimmedInput !== trimmedDebounced) return;
    if (trimmedDebounced === urlTrimmed) return;

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (trimmedDebounced) params.set("name", trimmedDebounced);
      else params.delete("name");
      router.replace(`${currentPath}?${params.toString()}`);
    });
  }, [
    debouncedName,
    nameInput,
    nameFromUrl,
    currentPath,
    router,
    searchParams,
  ]);

  const handleStatusChange = (value: string | null) => {
    const next = value ?? "all";
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "all") params.delete("status");
      else params.set("status", next);
      router.push(`${currentPath}?${params.toString()}`);
    });
  };

  const handleDeliveryChange = (value: string | null) => {
    const next = value ?? "all";
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "all") params.delete("delivery");
      else params.set("delivery", next);
      router.push(`${currentPath}?${params.toString()}`);
    });
  };

  const applyDatePreset = (next: DatePresetParam) => {
    const prevPreset = parseDatePreset(searchParams.get("date"));
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "all") {
        params.delete("date");
        params.delete("from");
        params.delete("to");
      } else {
        params.set("date", next);
        if (next !== "range") {
          params.delete("from");
          params.delete("to");
        } else if (prevPreset !== "range") {
          params.delete("from");
          params.delete("to");
        }
      }
      router.push(`${currentPath}?${params.toString()}`);
    });
    if (next === "range") setRangeOpen(true);
    else setRangeOpen(false);
  };

  const handleDatePresetChange = (value: string | null) => {
    const next = (value ?? "all") as DatePresetParam;
    if (
      next === "today" ||
      next === "yesterday" ||
      next === "week" ||
      next === "month" ||
      next === "all" ||
      next === "range"
    ) {
      applyDatePreset(next);
    }
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    const from = range?.from;
    const to = range?.to;
    if (!from || !to) return;
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("date", "range");
      params.set("from", format(from, "yyyy-MM-dd"));
      params.set("to", format(to, "yyyy-MM-dd"));
      router.push(`${currentPath}?${params.toString()}`);
    });
    setRangeOpen(false);
  };

  const handleClearFilters = () => {
    setNameInput("");
    setRangeOpen(false);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("name");
      params.delete("status");
      params.delete("delivery");
      params.delete("date");
      params.delete("from");
      params.delete("to");
      router.push(`${currentPath}?${params.toString()}`);
    });
  };

  const hasActiveFilters =
    status !== "all" ||
    delivery !== "all" ||
    nameFromUrl.trim() !== "" ||
    datePreset !== "all";

  const statusValue = status === "all" ? "all" : status;
  const dateValue = datePreset === "all" ? "all" : datePreset;
  const rangeSelected = ymdRangeToDateRange(fromYmd, toYmd);

  return (
    <div className="flex w-full flex-wrap items-end gap-x-3 gap-y-2.5">
      <FilterField label="Search" htmlFor="orders-filter-search" className="min-w-[8rem] flex-1 sm:max-w-[14rem] sm:flex-none">
        <Input
          id="orders-filter-search"
          className="h-8 w-full sm:w-52"
          type="search"
          autoComplete="off"
          placeholder="Id, client, email, phone…"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          disabled={isPending}
        />
      </FilterField>

      <FilterField label="Status" htmlFor="orders-filter-status">
        <Select
          value={statusValue}
          disabled={isPending}
          onValueChange={(value) => handleStatusChange(value || "")}
        >
          <SelectTrigger id="orders-filter-status" className="min-w-[10.5rem] w-full max-w-[min(100%,12rem)] sm:w-auto">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {orderStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Delivery" htmlFor="orders-filter-delivery">
        <Select
          value={delivery}
          disabled={isPending}
          onValueChange={(value) => handleDeliveryChange(value || "")}
        >
          <SelectTrigger id="orders-filter-delivery" className="min-w-[11rem] w-full max-w-[min(100%,13rem)] sm:w-auto">
            <SelectValue placeholder="Delivery" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">Delivery required</SelectItem>
            <SelectItem value="no">Pickup only</SelectItem>
          </SelectContent>
        </Select>
      </FilterField>

      <FilterField label="Period" htmlFor="orders-filter-date">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <Select
            value={dateValue}
            disabled={isPending}
            onValueChange={(value) => handleDatePresetChange(value || "")}
          >
            <SelectTrigger
              id="orders-filter-date"
              className="min-w-[9.5rem] flex-1 sm:min-w-[10.5rem] sm:flex-none sm:max-w-[14rem]"
            >
              <SelectValue placeholder="Date">
                {datePresetLabel(datePreset, fromYmd, toYmd)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="range">Custom range…</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isPending || datePreset !== "range"}
                  className="size-8 shrink-0"
                  aria-label="Pick date range"
                />
              }
            >
              <CalendarIcon className="size-4" />
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-auto max-w-[calc(100vw-2rem)] p-0"
            >
              <Calendar
                mode="range"
                className="p-2"
                numberOfMonths={1}
                defaultMonth={rangeSelected?.from ?? new Date()}
                selected={rangeSelected}
                onSelect={handleRangeSelect}
              />
            </PopoverContent>
          </Popover>
        </div>
      </FilterField>

      {isPending ? <Spinner className="mb-1 size-4 shrink-0 animate-spin" /> : null}

      <Button
        type="button"
        variant="outline"
        onClick={handleClearFilters}
        disabled={isPending || !hasActiveFilters}
        className="h-8 gap-1.5 shrink-0"
      >
        {isPending ? (
          <Spinner className="size-4 animate-spin" />
        ) : (
          <XIcon className="size-4" />
        )}
        Clear filters
      </Button>
    </div>
  );
}
