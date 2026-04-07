"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

export type ComboboxItem = {
  value: string
  label: string
  /** Smaller muted line under label */
  description?: string
}

type ComboboxProps = {
  items: ComboboxItem[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  "aria-invalid"?: boolean
  className?: string
}

/**
 * Searchable list in a popover — same interaction pattern as the shadcn Combobox (Popover + filter).
 */
function Combobox({
  items,
  value,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No results.",
  disabled,
  "aria-invalid": ariaInvalid,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const selected = items.find((i) => i.value === value)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        (i.description?.toLowerCase().includes(q) ?? false) ||
        i.value.toLowerCase().includes(q),
    )
  }, [items, query])

  React.useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={ariaInvalid}
            disabled={disabled}
            className={cn(
              "h-8 w-full max-w-none justify-between border-input px-2.5 font-normal",
              !selected && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <span className="truncate text-left">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="min-w-64 w-72 max-w-[calc(100vw-2rem)] p-0"
      >
        <div className="flex flex-col gap-1 p-2">
          <Input
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8"
            autoComplete="off"
            onKeyDown={(e) => e.stopPropagation()}
          />
          <ul
            role="listbox"
            className="max-h-60 overflow-y-auto border border-border/60 bg-background"
          >
            {filtered.length === 0 ? (
              <li className="px-2 py-3 text-center text-xs text-muted-foreground">
                {emptyMessage}
              </li>
            ) : (
              filtered.map((item) => {
                const isSelected = value === item.value
                return (
                  <li key={item.value} role="none">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "flex w-full items-start gap-2 px-2 py-2 text-left text-xs transition-colors hover:bg-muted/80",
                        isSelected && "bg-muted/50",
                      )}
                      onClick={() => {
                        onValueChange(item.value)
                        setOpen(false)
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          "mt-0.5 size-3.5 shrink-0",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-foreground">
                          {item.label}
                        </span>
                        {item.description ? (
                          <span className="block text-muted-foreground">
                            {item.description}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { Combobox }
