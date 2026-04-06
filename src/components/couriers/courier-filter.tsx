// Courier Filter component, used to filter couriers by status, vehicle, etc.
// Stores the filter state in the URL

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
import { useEffect, useState, useTransition } from "react";
import { Spinner } from "../ui/spinner";
import { Input } from "../ui/input";
import { useDebounce } from "use-debounce";

/** Typing updates instantly; URL updates after pause to avoid navigation on every keypress */
const NAME_DEBOUNCE_MS = 700;

const CourierFilter = () => {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "all";
  const vehicle = searchParams.get("vehicle") || "all";
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

    // While debounce lags behind the input (typing or clear), do not write URL — otherwise
    // clearing the query re-adds `name` from a stale debounced value on the first attempt.
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

  const handleStatusChange = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("status", value);
      router.push(`${currentPath}?${params.toString()}`);
    });
  };

  const handleVehicleChange = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("vehicle", value);
      router.push(`${currentPath}?${params.toString()}`);
    });
  };

  const handleClearFilters = () => {
    setNameInput("");
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("status");
      params.delete("vehicle");
      params.delete("name");
      router.push(`${currentPath}?${params.toString()}`);
    });
  };

  const handleNameChange = (value: string) => {
    setNameInput(value);
  };

  const hasActiveFilters =
    status !== "all" || vehicle !== "all" || nameFromUrl.trim() !== "";

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <Input
        className="h-8 min-w-[8rem] max-w-[14rem] flex-1 sm:w-40 sm:flex-none"
        type="search"
        autoComplete="off"
        placeholder="Search by name"
        value={nameInput}
        onChange={(e) => handleNameChange(e.target.value)}
        aria-label="Filter couriers by name"
      />
      <Select
        value={status || "all"}
        disabled={isPending}
        onValueChange={(value) => handleStatusChange(value || "")}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="in-transit">In Transit</SelectItem>
          <SelectItem value="on-delivery">On Delivery</SelectItem>
          <SelectItem value="off-duty">Off Duty</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={vehicle || "all"}
        disabled={isPending}
        onValueChange={(value) => handleVehicleChange(value || "")}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filter by vehicle" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="motorcycle">Motorcycle</SelectItem>
          <SelectItem value="car">Car</SelectItem>
          <SelectItem value="bicycle">Bicycle</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
      {isPending && <Spinner className="size-4 animate-spin" />}
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
  );
};

export default CourierFilter;
