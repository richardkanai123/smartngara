"use client"

import { useMemo, useState } from "react"
import type { Column } from "@tanstack/react-table"
import type { Client } from "@convex/schema"
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
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
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

const ClientsTable = ({ clients }: { clients: Client[] }) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const columns = useMemo(() => buildColumns(), [])

  const table = useReactTable({
    data: clients,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
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
                No clients found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default ClientsTable
