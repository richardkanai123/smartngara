"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import type { api } from "@convex/_generated/api";
import type { Preloaded } from "convex/react";
import CourierCard from "./courier-card";
import CourierFilter from "./courier-filter";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import EmptyState from "./empty-state";

const CourierLister = ({
  preloadedCouriers,
}: {
  preloadedCouriers: Preloaded<typeof api.couriers.getAll>;
}) => {
  const couriers =
    usePreloadedAuthQuery<typeof api.couriers.getAll>(preloadedCouriers);
  const searchParams = useSearchParams();
  if (!couriers || couriers.length === 0){
    return <EmptyState />;
  }

  // filter couriers by status and vehicle
  const status = searchParams.get("status") || "all";
  const vehicle = searchParams.get("vehicle") || "all";
  const filteredCouriers = couriers.filter((courier) => {
    if (status !== "all") {
      return courier.status === status;
    }
    if (vehicle !== "all") {
      return courier.vehicle === vehicle;
    }
    return true;
  });
  return (
    <div className="w-full p-2">
        <CourierFilter />
        <div className="w-full mt-2 grid grid-cols-1 auto-rows-fr items-center md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Suspense fallback={<div>Loading couriers...</div>}>
        {filteredCouriers.length === 0 ? <EmptyState filtered={true} /> : (
          filteredCouriers.map((courier) => (
            <CourierCard key={courier._id} courier={courier} />
          ))
        )}
        </Suspense>
        </div>
    </div>
  );
};
export default CourierLister;
