// Search and filter orders via URL: debounced `name`, `status`, `delivery` (URL shareable).

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
import { XIcon } from "lucide-react";
import { Suspense, useEffect, useState, useTransition } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";
import {
  parseDeliveryFilter,
  parseStatusFilter,
} from "@/lib/order-filters";
import { orderStatuses } from "@/lib/order-helpers";

const NAME_DEBOUNCE_MS = 700;

function statusLabel(s: string): string {
  return s.replace(/-/g, " ");
}

export default function OrdersFilterSearch() {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const status = parseStatusFilter(searchParams.get("status"));
  const delivery = parseDeliveryFilter(searchParams.get("delivery"));
  const nameFromUrl = searchParams.get("name") || "";

  const [nameInput, setNameInput] = useState(nameFromUrl);
  const [debouncedName] = useDebounce(nameInput, NAME_DEBOUNCE_MS);

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

  const handleClearFilters = () => {
    setNameInput("");
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("name");
      params.delete("status");
      params.delete("delivery");
      router.push(`${currentPath}?${params.toString()}`);
    });
  };

  const hasActiveFilters =
    status !== "all" ||
    delivery !== "all" ||
    nameFromUrl.trim() !== "";

  const statusValue = status === "all" ? "all" : status;

  return (
    <Suspense fallback={<Spinner className="size-4" />}>
      <div className="flex w-full flex-wrap items-center gap-2">
        <Input
          className="h-8 min-w-[8rem] max-w-[14rem] flex-1 sm:w-52 sm:flex-none"
          type="search"
          autoComplete="off"
          placeholder="Search id, client, email, phone…"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          aria-label="Search orders"
          disabled={isPending}
        />
        <Select
          value={statusValue}
          disabled={isPending}
          onValueChange={(value) => handleStatusChange(value || "")}
        >
          <SelectTrigger className="min-w-[10.5rem]">
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
        <Select
          value={delivery}
          disabled={isPending}
          onValueChange={(value) => handleDeliveryChange(value || "")}
        >
          <SelectTrigger className="min-w-[11rem]">
            <SelectValue placeholder="Delivery" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">Delivery required</SelectItem>
            <SelectItem value="no">Pickup only</SelectItem>
          </SelectContent>
        </Select>
        {isPending ? <Spinner className="size-4 animate-spin" /> : null}
        <Button
          type="button"
          variant="outline"
          onClick={handleClearFilters}
          disabled={isPending || !hasActiveFilters}
          className="gap-1.5"
        >
          {isPending ? (
            <Spinner className="size-4 animate-spin" />
          ) : (
            <XIcon className="size-4" />
          )}
          Clear filters
        </Button>
      </div>
    </Suspense>
  );
}
