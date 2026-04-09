import { Suspense } from "react";
import OrderDetails from "@/components/orders/order-details";

function OrderDetailsLoading() {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center px-4 py-16 text-muted-foreground text-sm">
      Loading order…
    </div>
  );
}

const AdminOrdersIdPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return (
    <div className="w-full bg-background">
      <Suspense fallback={<OrderDetailsLoading />}>
        <OrderDetails orderId={id} />
      </Suspense>
    </div>
  );
};

export default AdminOrdersIdPage;