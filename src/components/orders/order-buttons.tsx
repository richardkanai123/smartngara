"use client";

import type { Order } from "@convex/schema";
import CancelOrderButton from "./order-action-buttons/cancel-order-button";
import type { Id } from "@convex/_generated/dataModel";
import ProcessOrderBtn from "./order-action-buttons/process-order-btn";
import ReadyOrderBtn from "./order-action-buttons/ready-order-button";
import DeleteOrderButton from "./order-action-buttons/delete-order-button";

const OrderButtons = ({
  orderId,
  status,
}: {
  orderId: Id<"orders">;
  status: Order["status"];
}) => {
  return (
    <div className="flex gap-2">
      {status === "pending" && (
        <ProcessOrderBtn orderId={orderId} status={status} />
      )}
      {status === "processing" && (
        <ReadyOrderBtn orderId={orderId} status={status} />
      )}
      {status !== "cancelled" && status !== "delivered" && (
        <CancelOrderButton orderId={orderId} status={status} />
      )}
      <DeleteOrderButton orderId={orderId} status={status} />
    </div>
  );
};

export default OrderButtons;
