import CourierLister from "@/components/couriers/courier-lister";
import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "@convex/_generated/api";
import { Suspense } from "react";

const AdminCouriersPage = async () => {

  const preloaded = await preloadAuthQuery(api.couriers.getAll)

  return (
    <div className="w-full flex flex-col items-center justify-center gap-2">
      <div className="w-full">
        <h1 className="text-2xl font-bold">Couriers</h1>
        <p className="text-sm text-muted-foreground">
          Manage your couriers.
        </p>
      </div>

      <Suspense fallback={<div>Loading couriers...</div>}>
        <CourierLister preloadedCouriers={preloaded} />
      </Suspense>
    </div>
  );
};

export default AdminCouriersPage;
