import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Tag } from "lucide-react";
import OrderAssignRackButton from "./order-action-buttons/order-assign-rack-button";
import type { Order } from "@convex/schema";

function rackStatusBadge(
  status: "available" | "occupied" | "maintenance" | "out-of-order" | "full",
) {
  const styles: Record<typeof status, string> = {
    available:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    occupied:
      "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    maintenance:
      "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-400",
    "out-of-order":
      "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400",
    full: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  };
  return (
    <Badge
      variant="outline"
      className={`font-medium capitalize ${styles[status]}`}
    >
      {status.replace(/-/g, " ")}
    </Badge>
  );
}

export default async function OrderDetailsRackCard({
  orderId,
  rackId,
  status,
}: {
  orderId: Id<"orders">;
  status: Order["status"];
  rackId: Id<"racks"> | undefined ;
}) {
  if (!rackId) {
    return (
      <Card className="w-full border-foreground/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Rack</CardTitle>
        </CardHeader>
        <CardContent>
         <OrderAssignRackButton orderId={orderId} status={status} />
        </CardContent>
      </Card>
    );
  }

  const rack = await fetchAuthQuery(api.racks.getRackById, { id: rackId });
  if (!rack) {
    return (
      <Card className="w-full border-foreground/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Rack</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Rack not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-foreground/10">
      <CardHeader className="w-full pb-2 flex items-center justify-between">
        <CardTitle className="text-lg">Rack</CardTitle>
        <OrderAssignRackButton orderId={orderId} status={status} currentRackId={rackId} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/60 text-secondary-foreground">
            <Tag className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Label
            </span>
            <span className="text-sm font-medium leading-snug">
              {rack.label}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/60 text-secondary-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Status
            </span>
            <div className="pt-0.5">{rackStatusBadge(rack.status)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
