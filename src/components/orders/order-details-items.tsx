
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OrderDetailsItemsProps = {
  items: { name: string; quantity: number }[];
};

export function OrderDetailsItems({ items }: OrderDetailsItemsProps) {
  const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <Card className="ring-foreground/10 w-full mx-auto">
      <CardHeader className="border-border/60 border-b">
        <CardTitle className="text-sm font-medium">Order Items</CardTitle>
        <p className="text-muted-foreground text-xs">
          {items.length} line{items.length === 1 ? "" : "s"} · {totalQty} pc
          {totalQty === 1 ? "" : "s"} total
        </p>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40%] pl-2">Item</TableHead>
              <TableHead className="text-right tabular-nums">Qty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row, idx) => (
              <TableRow key={`${row.name}-${idx}`}>
                <TableCell className="pl-4 font-medium">{row.name}</TableCell>
                <TableCell className="text-right font-medium tabular-nums text-muted-foreground">
                  {row.quantity} pcs
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
