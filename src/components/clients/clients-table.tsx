"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import type { Column } from "@tanstack/react-table"
import type { Client } from "@convex/schema"
import { filterClientsBySearchParams } from "@/lib/client-filters"
import ClientsFilterSearch from "./clients-filter-search"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import EditClientDialog from "./edit-client-dialog"
import DeleteClientDialog from "./delete-client-dialog"

function MobileClientCard({ client }: { client: Client }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
            Client
          </p>
          <p className="truncate text-sm font-semibold leading-snug text-foreground">
            {client.name}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 border border-border bg-muted/30 p-0.5">
          <EditClientDialog client={client} />
          <DeleteClientDialog id={client._id} name={client.name} />
        </div>
      </div>
      <dl className="grid gap-2.5 text-xs">
        <div className="grid gap-0.5">
          <dt className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
            Email
          </dt>
          <dd className="wrap-break-word text-foreground">{client.email}</dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
            Phone
          </dt>
          <dd className="tabular-nums text-foreground">
            {client.phone || "—"}
          </dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
            Address
          </dt>
          <dd className="whitespace-normal wrap-break-word text-muted-foreground">
            {client.address || "—"}
          </dd>
        </div>
      </dl>
    </div>
  )
}

function SortableHeader<TData>({
  column,
  children,
  className,
}: {
  column: Column<TData, unknown>
  children: React.ReactNode
  className?: string
}) {
  const sorted = column.getIsSorted()
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "-ml-2 h-8 gap-1 px-2 font-medium text-foreground hover:bg-muted/80",
        className
      )}
      onClick={column.getToggleSortingHandler()}
    >
      {children}
      <span className="inline-flex shrink-0" aria-hidden>
        {sorted === "desc" ? (
          <ArrowDown className="size-3.5 text-muted-foreground" />
        ) : sorted === "asc" ? (
          <ArrowUp className="size-3.5 text-muted-foreground" />
        ) : (
          <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
        )}
      </span>
    </Button>
  )
}

function buildColumns(): ColumnDef<Client>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortableHeader column={column}>Name</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <SortableHeader column={column}>Email</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <SortableHeader column={column}>Phone</SortableHeader>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums">
          {row.original.phone || "—"}
        </span>
      ),
    },
    {
      accessorKey: "address",
      header: ({ column }) => (
        <SortableHeader column={column}>Address</SortableHeader>
      ),
      cell: ({ row }) => (
        <span
          className="max-w-[min(280px,40vw)] whitespace-normal text-muted-foreground"
          title={row.original.address || undefined}
        >
          {row.original.address || "—"}
        </span>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      header: () => (
        <span className="flex w-full justify-end pr-1 text-muted-foreground">
          Actions
        </span>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-0.5">
          <EditClientDialog client={row.original} />
          <DeleteClientDialog id={row.original._id} name={row.original.name} />
        </div>
      ),
    },
  ]
}

const DEFAULT_PAGE_SIZE = 10

const ClientsTable = ({ clients }: { clients: Client[] }) => {
  const searchParams = useSearchParams()
  const filterKey = searchParams.toString()
  const filteredClients = useMemo(
    () => filterClientsBySearchParams(clients, searchParams),
    [clients, searchParams]
  )

  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const columns = useMemo(() => buildColumns(), [])

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [filterKey, clients.length])

  const table = useReactTable({
    data: filteredClients,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const rowCount = filteredClients.length
  const { pageIndex, pageSize } = table.getState().pagination
  const from = rowCount === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, rowCount)
  const pageCount = table.getPageCount()

  const emptyMessage =
    clients.length > 0 && filteredClients.length === 0
      ? "No clients match your search or filters."
      : "No clients found."

  return (
    <div className="space-y-3">
      <ClientsFilterSearch />
      <div className="overflow-hidden rounded-none border border-border bg-card ring-1 ring-border/40">
      <Table>
        <TableHeader className="hidden md:table-header-group">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b bg-muted/30 hover:bg-muted/30"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    header.column.getCanSort() && "text-foreground",
                    header.column.id === "actions" && "text-right"
                  )}
                  aria-sort={
                    header.column.getIsSorted() === "asc"
                      ? "ascending"
                      : header.column.getIsSorted() === "desc"
                        ? "descending"
                        : undefined
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                <TableCell
                  colSpan={columns.length}
                  className="align-top p-3 sm:p-4 md:hidden"
                >
                  <MobileClientCard client={row.original} />
                </TableCell>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      "hidden md:table-cell",
                      cell.column.id === "actions" && "text-right"
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {rowCount > 0 && (
        <div className="flex flex-col gap-3 border-t border-border bg-muted/20 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground tabular-nums">
            Showing {from}–{to} of {rowCount}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Rows per page
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  table.setPageSize(Number(v))
                  table.setPageIndex(0)
                }}
              >
                <SelectTrigger className="h-8 w-[4.5rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="min-w-[5.5rem] px-1 text-center text-xs text-muted-foreground tabular-nums">
                Page {pageCount === 0 ? 0 : pageIndex + 1} of{" "}
                {Math.max(1, pageCount)}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default ClientsTable
