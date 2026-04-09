import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { OrderAddDeliveryPlaceholder } from "@/components/orders/order-add-delivery-placeholder";
import { formatMoney } from "@/components/orders/order-details-utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Banknote, Calendar, MapPin, Truck } from "lucide-react";

function deliveryStatusBadge(status: Doc<"deliveries">["status"]) {
  const map: Record<
    Doc<"deliveries">["status"],
    { label: string; className: string }
  > = {
    pending: {
      label: "Pending",
      className:
        "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-400",
    },
    "in-transit": {
      label: "In transit",
      className: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    },
    "on-delivery": {
      label: "On delivery",
      className:
        "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-400",
    },
    delivered: {
      label: "Delivered",
      className:
        "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    cancelled: {
      label: "Cancelled",
      className: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400",
    },
  };
  const cfg = map[status];
  return (
    <Badge variant="outline" className={`font-medium ${cfg.className}`}>
      {cfg.label}
    </Badge>
  );
}

export default async function OrderDetailsDeliveryCard({
  deliveryId,
  orderId,
}: {
  deliveryId: Id<"deliveries"> | undefined;
  orderId: Id<"orders">;
}) {
  if (!deliveryId) {
    return <OrderAddDeliveryPlaceholder orderId={orderId} />;
  }

  const delivery = await fetchAuthQuery(api.deliveries.getDeliveryById, {
    id: deliveryId,
  });

  return (
    <Card className="w-full border-foreground/10">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
        <CardTitle className="text-lg">Delivery</CardTitle>
        {deliveryStatusBadge(delivery.status)}
      </CardHeader>
      <CardContent className="space-y-4">
        {delivery.deliveryAddress ? (
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/60 text-secondary-foreground">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Drop-off address
              </span>
              <span className="text-sm font-medium leading-snug">
                {delivery.deliveryAddress}
              </span>
            </div>
          </div>
        ) : null}

        {delivery.pickupAddress ? (
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/60 text-secondary-foreground">
              <Truck className="h-5 w-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Pickup address
              </span>
              <span className="text-sm font-medium leading-snug">
                {delivery.pickupAddress}
              </span>
            </div>
          </div>
        ) : null}

        {delivery.deliveryFee != null ? (
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/60 text-secondary-foreground">
              <Banknote className="h-5 w-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Fee</span>
              <span className="text-sm font-medium tabular-nums">
                {formatMoney(delivery.deliveryFee)}
              </span>
            </div>
          </div>
        ) : null}

        {(delivery.pickupDateTime != null || delivery.deliveryDateTime != null) && (
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/60 text-secondary-foreground">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              {delivery.pickupDateTime != null ? (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Pickup
                  </span>
                  <p className="text-sm font-medium tabular-nums">
                    {format(new Date(delivery.pickupDateTime), "MMM d, yyyy · HH:mm")}
                  </p>
                </div>
              ) : null}
              {delivery.deliveryDateTime != null ? (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Expected drop-off
                  </span>
                  <p className="text-sm font-medium tabular-nums">
                    {format(new Date(delivery.deliveryDateTime), "MMM d, yyyy · HH:mm")}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
