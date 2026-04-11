import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import OrderButtons from "./order-buttons";
import OrderStatusBadge from "./order-status-badge";
import { OrderDetailsItems } from "./order-details-items";
import { OrderDetailsNotes } from "./order-details-notes";
import OrderDetailsHeader from "./order-detail-header";
import OrderDetailsClient from "./order-details-client-card";
import OrderHandlerCard from "./order-handler-card";
import OrderDetailsDeliveryCard from "./order-details-delivery-card";
import OrderDetailsRackCard from "./order-details-rack-card";
import OrderDetailsCancellationCard from "./order-details-cancellation-card";
import { OrderDetailsFeesCard } from "./order-details-fees-card";
import { Suspense } from "react";
import { Spinner } from "../ui/spinner";

const OrderDetails = async ({ orderId }: { orderId: string }) => {
  const order = await fetchAuthQuery(api.orders.getOrderById, {
    id: orderId as Id<"orders">,
  });

  const {
    clientId,
    handlerId,
    items,
    isDeliveryRequired,
    instructions,
    ironing,
    ironingFee,
    orderFee,
    rackId,
    status,
    completedAt,
    deliveryId,
    createdAt,
    cancelledAt,
    cancelledBy,
    cancelledReason,
  } = order;

  const id = orderId as Id<"orders">;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-1 pb-8 sm:px-0">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
            Order details
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Summary, line items, fees, and customer context.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <OrderStatusBadge status={status} />
          <OrderButtons orderId={id} status={status} />
        </div>
      </header>

      <OrderDetailsHeader
        orderId={id}
        createdAt={createdAt}
        delivery={isDeliveryRequired}
        ironing={ironing}
        completedAt={completedAt}
      />

      <Suspense fallback={<Spinner className="size-4" />}>
        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <OrderDetailsItems items={items} />
            <OrderDetailsFeesCard
              orderFee={orderFee}
              ironingFee={ironingFee}
              ironing={ironing}
            />
            <OrderDetailsNotes instructions={instructions} />
          </div>

          <aside className="flex flex-col gap-6 lg:col-span-1">
          <Suspense fallback={<Spinner className="size-4" />}>
              <OrderDetailsCancellationCard
                status={status}
                cancelledAt={cancelledAt}
                cancelledReason={cancelledReason}
                cancelledBy={cancelledBy}
              />
            </Suspense>
            <Suspense fallback={<Spinner className="size-4" />}>
            <OrderDetailsClient clientId={clientId} />
            </Suspense>
            <Suspense fallback={<Spinner className="size-4" />}>
            <OrderHandlerCard handlerId={handlerId} />
            </Suspense>
            <Suspense fallback={<Spinner className="size-4" />}>
            <OrderDetailsDeliveryCard deliveryId={deliveryId} orderId={id} />
            </Suspense>
            <Suspense fallback={<Spinner className="size-4" />}>
            <OrderDetailsRackCard rackId={rackId} />
            </Suspense>
           
          </aside>
        </div>
      </Suspense>
    </div>
  );
};

export default OrderDetails;
