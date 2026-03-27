'use client'
import { Order } from "@convex/schema"
import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "../ui/badge"

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({row}) => {
      const status = row.original.status
      return <Badge variant="outline">{status}</Badge>
    }
  },
  {
    accessorKey: "rackId",
    header: "Rack",
    cell: ({row}) => {
      const rackId = row.original.rackId
      return <Badge variant="outline">{rackId}</Badge>
    }
  },
  {
    accessorKey: "deliveryId",
    header: "Delivery",
    cell: ({row}) => {
      const deliveryId = row.original.deliveryId
      return <Badge variant="outline">{deliveryId}</Badge>
    }
  },
]
const MinOrdersTable = ({orders}: {orders: Order[]}) => {
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  return <Table>
    <TableHeader>
      <TableRow>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableHead key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>{header.toString()}</TableHead>
            ))}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {table.getRowModel().rows.map((row) => (
        <TableRow key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>{cell.getValue() as React.ReactNode}</TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
}

export default MinOrdersTable