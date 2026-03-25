"use client";
import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import { api } from "@convex/_generated/api";
import type { Preloaded } from "convex/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const RacksLister = ({
  preloadedRacks,
}: {
  preloadedRacks: Preloaded<typeof api.racks.getAllRacks>;
}) => {
  const racks = usePreloadedAuthQuery(preloadedRacks);
  const router = useRouter();
  if (!racks || racks.length === 0) return (
    <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">No racks found</h1>
        <p className="text-muted-foreground">Please add a rack to get started</p>
        <Button variant="default" onClick={() => router.push("/admin/racks/add")}>Add Rack</Button>
    </div>
  );
  
  return (
    <div className="w-full align-middle justify-center items-center flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Racks</h1>
      <p className="text-muted-foreground">List of all racks in the system</p>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {racks.map((rack) => (
          <div key={rack._id}>{rack.label}</div>
        ))}
      </div>
    </div>
  );
};

export default RacksLister;