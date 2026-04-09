import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/components/orders/order-details-utils";

type OrderDetailsFeesCardProps = {
  orderFee: number | undefined;
  ironingFee: number | undefined;
  ironing: boolean;
};

export function OrderDetailsFeesCard({
  orderFee,
  ironingFee,
  ironing,
}: OrderDetailsFeesCardProps) {
  const service = orderFee ?? 0;
  const iron = ironing ? ironingFee ?? 0 : 0;
  const total = service + iron;

  return (
    <Card size="sm" className="ring-foreground/10">
      <CardHeader className="border-border/60 border-b pb-3">
        <CardTitle className="text-sm font-medium">Fees</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Service</span>
          <span className="tabular-nums font-medium">{formatMoney(service)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Ironing</span>
          <span className="tabular-nums font-medium text-foreground">
            {ironing ? formatMoney(iron) : "—"}
          </span>
        </div>
        <Separator className="bg-border/80" />
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="font-medium">Total</span>
          <span className="tabular-nums font-semibold">{formatMoney(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
