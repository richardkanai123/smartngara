import { api } from "@convex/_generated/api";
import { fetchAuthQuery, preloadAuthQuery } from "@/lib/auth-server";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import DefaultError from "@/components/default-error";
import UnAuthorised from "@/components/auth/un-authorised";

function OrdersTableLoading() {
  return (
    <div className="rounded-xl border border-border/60 border-dashed bg-muted/20 p-4 text-center text-muted-foreground text-sm">
      Loading orders…
    </div>
  );
}

const AdminOrdersTable = dynamic(
  () => import("@/components/orders/admin-orders-table"),
  {
    loading: () => <OrdersTableLoading />,
  },
);

async function OrdersSection() {
  try {
    const preloaded = await preloadAuthQuery(api.orders.listOrdersWithClients);
    return <AdminOrdersTable preloadedOrders={preloaded} />;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load orders";
    return <DefaultError errorMessage={message} />;
  }
}

export default async function AdminOrdersPage() {
  const myRole = await fetchAuthQuery(api.userRoles.getMyRole);

  if (!myRole || (myRole !== "admin" && myRole !== "worker")) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <UnAuthorised
          title="Unauthorised Access"
          message="You are not authorised to access this page. Please contact the administrator."
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] w-full flex-col">
      <header className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="w-full px-4 py-5 md:px-4">
          <div className="min-w-0 space-y-1.5">
            <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
              Orders
            </h1>
            <p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
              Search and filter update the URL for sharing. Sort columns on desktop;
              use the bar below on mobile. Hover a client for contact details.
            </p>
          </div>
        </div>
      </header>

      <div className="w-full flex-1">
        <Suspense fallback={<OrdersTableLoading />}>
          <OrdersSection />
        </Suspense>
      </div>
    </div>
  );
}
