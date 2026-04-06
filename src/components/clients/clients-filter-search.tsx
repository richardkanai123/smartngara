// Search and filter clients via URL: debounced `name`, `walkIn` (all / walk-in / non–walk-in).

"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { Spinner } from "../ui/spinner"
import { Input } from "../ui/input"
import { useDebounce } from "use-debounce"
import { parseWalkInFilter } from "@/lib/client-filters"

const NAME_DEBOUNCE_MS = 700

const ClientsFilterSearch = () => {
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const walkIn = parseWalkInFilter(searchParams.get("walkIn"))
  const nameFromUrl = searchParams.get("name") || ""

  const [nameInput, setNameInput] = useState(nameFromUrl)
  const [debouncedName] = useDebounce(nameInput, NAME_DEBOUNCE_MS)

  const router = useRouter()
  const currentPath = usePathname()

  useEffect(() => {
    setNameInput(nameFromUrl)
  }, [nameFromUrl])

  useEffect(() => {
    const trimmedInput = nameInput.trim()
    const trimmedDebounced = debouncedName.trim()
    const urlTrimmed = nameFromUrl.trim()

    if (trimmedInput !== trimmedDebounced) return
    if (trimmedDebounced === urlTrimmed) return

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (trimmedDebounced) params.set("name", trimmedDebounced)
      else params.delete("name")
      router.replace(`${currentPath}?${params.toString()}`)
    })
  }, [
    debouncedName,
    nameInput,
    nameFromUrl,
    currentPath,
    router,
    searchParams,
  ])

  const handleWalkInChange = (value: string | null) => {
    const next = value ?? "all"
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (next === "all") params.delete("walkIn")
      else params.set("walkIn", next)
      router.push(`${currentPath}?${params.toString()}`)
    })
  }

  const handleClearFilters = () => {
    setNameInput("")
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("name")
      params.delete("walkIn")
      router.push(`${currentPath}?${params.toString()}`)
    })
  }

  const hasActiveFilters =
    walkIn !== "all" || nameFromUrl.trim() !== ""

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <Input
        className="h-8 min-w-[8rem] max-w-[14rem] flex-1 sm:w-44 sm:flex-none"
        type="search"
        autoComplete="off"
        placeholder="Search name, email, phone…"
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
        aria-label="Search clients"
        disabled={isPending}
      />
      <Select
        value={walkIn}
        disabled={isPending}
        onValueChange={(value) => handleWalkInChange(value || "")}
      >
        <SelectTrigger className="min-w-[10rem]">
          <SelectValue placeholder="Walk-in" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All clients</SelectItem>
          <SelectItem value="yes">Walk-in only</SelectItem>
          <SelectItem value="no">Non–walk-in only</SelectItem>
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
  )
}

export default ClientsFilterSearch
