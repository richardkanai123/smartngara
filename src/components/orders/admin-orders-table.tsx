"use client";

/**
 * Orders list table (admin).
 * Desktop (md+): full-width table inside horizontal scroll (columns keep min width).
 * Mobile: stacked cards + sort selector (same sort state as table).
 * Search/filters via URL (see OrdersFilterSearch).
 */

import { useMemo, useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import { format } from "date-fns";
import {
  type Column,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { api } from "@convex/_generated/api";
import type { Order } from "@convex/schema";
import type { Preloaded } from "convex/react";
import type { OrderWithClient } from "@/lib/order-filters";
import { filterOrdersBySearchParams } from "@/lib/order-filters";
import OrdersFilterSearch from "@/components/orders/orders-filter-search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OrderStatusBadge from "@/components/orders/order-status-badge";
import { OrderClientHoverCard } from "@/components/orders/order-client-hover-card";
import { orderStatuses } from "@/lib/order-helpers";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 10;

function orderIdSuffix(id: string): string {
  const tail = id.slice(-5);
  return tail.length === 5 ? tail : id;
}

function statusSortIndex(status: Order["status"]): number {
  const i = orderStatuses.indexOf(status);
  return i === -1 ? orderStatuses.length : i;
}

/** Maps to/from SortingState for mobile &lt;select&gt; */
const SORT_PRESETS: { id: string; label: string; sorting: SortingState }[] = [
  { id: "created-desc", label: "Date (newest first)", sorting: [{ id: "created", desc: true }] },
  { id: "created-asc", label: "Date (oldest first)", sorting: [{ id: "created", desc: false }] },
  { id: "client-asc", label: "Client (A–Z)", sorting: [{ id: "client", desc: false }] },
  { id: "client-desc", label: "Client (Z–A)", sorting: [{ id: "client", desc: true }] },
  { id: "status-asc", label: "Status (workflow order)", sorting: [{ id: "status", desc: false }] },
  { id: "status-desc", label: "Status (reverse)", sorting: [{ id: "status", desc: true }] },
];

function sortingToPresetId(sorting: SortingState): string {
  const s = sorting[0];
  if (!s) return "created-desc";
  const match = SORT_PRESETS.find(
    (p) => p.sorting[0]?.id === s.id && p.sorting[0]?.desc === s.desc,
  );
  return match?.id ?? "created-desc";
}

function SortableHeader<TData>({
  column,
  children,
  className,
}: {
  column: Column<TData, unknown>;
  children: React.ReactNode;
  className?: string;
}) {
  const sorted = column.getIsSorted();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "-ml-2 h-8 gap-1 px-2 font-medium text-foreground hover:bg-muted/80",
        className,
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
  );
}

function buildColumns(
  router: ReturnType<typeof useRouter>,
): ColumnDef<OrderWithClient>[] {
  return [
    {
      id: "orderId",
      accessorFn: (row) => row.order._id,
      header: "Order ID",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="font-mono text-xs tabular-nums text-foreground sm:text-sm">
        {orderIdSuffix(row.original.order._id)}
        </span>
      ),
    },
    {
      id: "status",
      accessorFn: (row) => row.order.status,
      header: ({ column }) => (
        <SortableHeader column={column}>Status</SortableHeader>
      ),
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId) as Order["status"];
        const b = rowB.getValue(columnId) as Order["status"];
        return statusSortIndex(a) - statusSortIndex(b);
      },
      cell: ({ row }) => (
        <OrderStatusBadge status={row.original.order.status} />
      ),
    },
    {
      id: "client",
      accessorFn: (row) =>
        row.client?.name?.trim() ? row.client.name : "\uFFFF",
      header: ({ column }) => (
        <SortableHeader column={column}>Client</SortableHeader>
      ),
      sortingFn: (rowA, rowB, columnId) => {
        const a = String(rowA.getValue(columnId));
        const b = String(rowB.getValue(columnId));
        return a.localeCompare(b, undefined, { sensitivity: "base" });
      },
      cell: ({ row }) => {
        const { client } = row.original;
        const name = client?.name ?? "Unknown client";
        return <OrderClientHoverCard client={client} displayName={name} />;
      },
    },
    {
      id: "created",
      accessorFn: (row) => row.order.createdAt,
      header: ({ column }) => (
        <SortableHeader column={column}>Created</SortableHeader>
      ),
      sortingFn: "basic",
      cell: ({ row }) => (
        <time
          className="text-muted-foreground text-xs tabular-nums sm:text-sm"
          dateTime={new Date(row.original.order.createdAt).toISOString()}
        >
          {format(new Date(row.original.order.createdAt), "MMM d, yyyy · HH:mm")}
        </time>
      ),
    },
    {
      id: "actions",
      enableSorting: false,
      header: () => (
        <span className="flex w-full justify-end pr-1 text-[10px] text-muted-foreground uppercase tracking-wide">
          Actions
        </span>
      ),
      cell: ({ row }) => {
        const href = `/admin/orders/${row.original.order._id}`;
        return (
          <div
            className="flex justify-end"
            data-order-action
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              aria-label={`View order …${orderIdSuffix(row.original.order._id)}`}
              onClick={(e) => {
                e.stopPropagation();
                router.push(href);
              }}
            >
              <Eye className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}

function MobileOrderCard({
  row,
  router,
}: {
  row: Row<OrderWithClient>;
  router: ReturnType<typeof useRouter>;
}) {
  const href = `/admin/orders/${row.original.order._id}`;
  const { order, client } = row.original;
  const name = client?.name ?? "Unknown client";

  return (
    <li
      className="cursor-pointer rounded-lg border border-border/80 bg-card/50 p-4 shadow-sm"
      tabIndex={0}
      onClick={(e) => {
        const t = e.target as HTMLElement;
        if (t.closest("[data-order-action]")) return;
        if (t.closest("[data-slot='hover-card-trigger']")) return;
        router.push(href);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(href);
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 text-left">
          <p className="font-mono text-foreground text-sm tabular-nums">
            …{orderIdSuffix(order._id)}
          </p>
          <p className="mt-2 text-muted-foreground text-xs tabular-nums">
            {format(new Date(order.createdAt), "MMM d, yyyy · HH:mm")}
          </p>
        </div>
        <div
          data-order-action
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9"
            aria-label={`View order …${orderIdSuffix(order._id)}`}
            onClick={() => router.push(href)}
          >
            <Eye className="size-4" />
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 border-border/60 border-t pt-3">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
          Status
        </span>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
          Client
        </span>
        <div className="mt-1">
          <OrderClientHoverCard client={client} displayName={name} />
        </div>
      </div>
    </li>
  );
}

export default function AdminOrdersTable({
  preloadedOrders,
}: {
  preloadedOrders: Preloaded<typeof api.orders.listOrdersWithClients>;
}) {
  const rows = usePreloadedAuthQuery(preloadedOrders);
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterKey = searchParams.toString();

  const filteredRows = useMemo(
    () =>
      rows?.length ? filterOrdersBySearchParams(rows, searchParams) : [],
    [rows, searchParams],
  );

  const [sorting, setSorting] = useState<SortingState>([
    { id: "created", desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const columns = useMemo(() => buildColumns(router), [router]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  }, [filterKey, filteredRows.length]);

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const mobileSortId = sortingToPresetId(sorting);

  if (rows === undefined) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">Loading…</p>
    );
  }

  if (!rows?.length) {
    return (
      <div className="flex min-h-[32vh] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-muted-foreground/25 bg-muted/15 px-6 py-12 text-center">
        <p className="text-muted-foreground text-sm">No orders yet.</p>
      </div>
    );
  }

  const tableRows = table.getRowModel().rows;
  const noMatches = filteredRows.length === 0;

  const rowCount = filteredRows.length;
  const { pageIndex, pageSize } = table.getState().pagination;
  const from = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, rowCount);
  const pageCount = table.getPageCount();

  return (
    <div className="space-y-3 px-4 pb-6 md:px-6 lg:px-8">
      <Suspense fallback={<div className="h-8 text-muted-foreground text-xs">Loading filters…</div>}>
        <OrdersFilterSearch />
      </Suspense>

      {noMatches ? (
        <div className="rounded-xl border border-border/80 border-dashed bg-muted/15 px-4 py-12 text-center text-muted-foreground text-sm">
          No orders match your search or filters.
        </div>
      ) : (
        <>
      {/* Mobile: sort + card list (no column shrink) */}
      <div className="md:hidden">
        <div className="mb-4">
          <label
            htmlFor="orders-sort-mobile"
            className="mb-1.5 block text-[10px] text-muted-foreground uppercase tracking-wide"
          >
            Sort by
          </label>
          <select
            id="orders-sort-mobile"
            className="h-9 w-full max-w-full border border-input bg-background px-2.5 text-foreground text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 dark:bg-input/30"
            value={mobileSortId}
            onChange={(e) => {
              const preset = SORT_PRESETS.find((p) => p.id === e.target.value);
              if (preset) setSorting(preset.sorting);
            }}
          >
            {SORT_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <ul className="flex flex-col gap-3">
          {tableRows.map((row) => (
            <MobileOrderCard key={row.id} row={row} router={router} />
          ))}
        </ul>
      </div>

      {/* Desktop: horizontal scroll keeps column widths; table can grow with viewport */}
      <div className="hidden md:block">
        <div
          className="w-full overflow-x-auto rounded-xl border border-border/80 bg-card/40 shadow-sm [-webkit-overflow-scrolling:touch]"
          role="region"
          aria-label="Orders table"
        >
          <Table className="w-full min-w-[52rem] table-auto">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "whitespace-nowrap text-[10px] text-muted-foreground uppercase tracking-wide",
                        header.column.id === "actions" && "w-[4.5rem] text-right",
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {tableRows.map((row) => {
                const href = `/admin/orders/${row.original.order._id}`;
                return (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-foreground/10 transition-all ease-in-out duration-200"
                    tabIndex={0}
                    aria-label={`View order …${orderIdSuffix(row.original.order._id)}`}
                    onClick={(e) => {
                      if (
                        (e.target as HTMLElement).closest("[data-order-action]")
                      ) {
                        return;
                      }
                      router.push(href);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(href);
                      }
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "align-middle",
                          cell.column.id === "actions" && "w-[4.5rem]",
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {rowCount > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/20 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs tabular-nums">
            Showing {from}–{to} of {rowCount}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap text-muted-foreground text-xs">
                Rows per page
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  table.setPageSize(Number(v));
                  table.setPageIndex(0);
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
              <span className="min-w-[5.5rem] px-1 text-center text-muted-foreground text-xs tabular-nums">
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
        </>
      )}
    </div>
  );
}
