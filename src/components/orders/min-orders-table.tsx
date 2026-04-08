"use client";

import type { Order } from "@convex/schema";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import OrderStatusBadge from "@/components/orders/order-status-badge";

function orderIdSuffix(id: string): string {
  const tail = id.slice(-5);
  return tail.length === 5 ? tail : id;
}

const columns: ColumnDef<Order>[] = [
  {
    id: "orderId",
    header: "Order",
    accessorFn: (row) => row._id,
    cell: ({ row }) => (
      <span className="font-mono text-sm tabular-nums text-foreground">
        …{orderIdSuffix(row.original._id)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <OrderStatusBadge status={row.original.status} />
    ),
  },
];

const MinOrdersTable = ({ orders }: { orders: Order[] }) => {
  const router = useRouter();
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No orders yet.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
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
        {table.getRowModel().rows.map((row) => {
          const href = `/admin/orders/${row.original._id}`;
          return (
            <TableRow
              key={row.id}
              className="cursor-pointer hover:bg-muted/50"
              tabIndex={0}
              aria-label={`View order …${orderIdSuffix(row.original._id)}`}
              onClick={() => router.push(href)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(href);
                }
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default MinOrdersTable;
