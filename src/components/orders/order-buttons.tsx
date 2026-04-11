"use client";

import type { Order } from "@convex/schema";
import { Button } from "../ui/button";
import { getActionsForStatus } from "@/lib/order-helpers";
import CancelOrderButton from "./order-action-buttons/cancel-order-button";
import type { Id } from "@convex/_generated/dataModel";

const OrderButtons = ({
  orderId,
  status,
}: {
  orderId: Id<"orders">;
  status: Order["status"];
}) => {
  const orderAction = getActionsForStatus(status);

  return (
    <div className="flex gap-2">
      {orderAction && <Button variant="outline">{orderAction}</Button>}
      {status !== "cancelled" && status !== "delivered" && (
        <CancelOrderButton orderId={orderId} status={status} />
      )}
    </div>
  );
};

export default OrderButtons;
