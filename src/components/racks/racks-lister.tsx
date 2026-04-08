"use client";

import { useMemo } from "react";
import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import type { api } from "@convex/_generated/api";
import type { Rack } from "@convex/schema";
import type { Preloaded } from "convex/react";
import Link from "next/link";
import RackCard from "./rack-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type RackGroup =
  | "available"
  | "reserved"
  | "occupied"
  | "maintenance"
  | "full";

/**
 * Groups match tabs: reserved first, then unusable (maintenance/out-of-order),
 * then full (status or at capacity), then empty available slots, else occupied.
 */
function rackGroup(rack: Rack): RackGroup {
  const used = rack.orders?.length ?? 0;
  if (rack.isReserved) return "reserved";
  if (rack.status === "maintenance" || rack.status === "out-of-order") {
    return "maintenance";
  }
  if (rack.status === "full" || used >= rack.maxOrders) return "full";
  if (rack.status === "available" && used === 0) return "available";
  return "occupied";
}

const GROUP_ORDER: RackGroup[] = [
  "available",
  "reserved",
  "occupied",
  "maintenance",
  "full",
];

const GROUP_LABEL: Record<RackGroup, string> = {
  available: "Available",
  reserved: "Reserved",
  occupied: "Occupied",
  maintenance: "Maintenance",
  full: "Full",
};

const GROUP_DESCRIPTION: Record<RackGroup, string> = {
  available: "Empty slots ready for new orders",
  reserved: "Held for a specific use",
  occupied: "In use with capacity remaining",
  maintenance: "Under maintenance or out of order — not assignable",
  full: "At maximum capacity (status full or all slots used)",
};

function RackGrid({ racks }: { racks: Rack[] }) {
  if (racks.length === 0) {
    return (
      <p className="text-muted-foreground py-10 text-center text-sm">
        None in this group.
      </p>
    );
  }

  return (
    <div
      className="rounded-xl border border-border/80 bg-muted/25 p-3 shadow-inner sm:p-4 md:p-5 dark:bg-muted/15"
      style={{
        backgroundImage: `
            linear-gradient(to right, hsl(var(--border) / 0.35) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.35) 1px, transparent 1px)
          `,
        backgroundSize: "12px 12px",
      }}
    >
      <div
        className="grid w-full gap-2 sm:gap-2.5 md:gap-3"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
        }}
      >
        {racks.map((rack) => (
          <RackCard key={rack._id} rack={rack} />
        ))}
      </div>
    </div>
  );
}

const RacksLister = ({
  preloadedRacks,
}: {
  preloadedRacks: Preloaded<typeof api.racks.getAllRacks>;
}) => {
  const racks = usePreloadedAuthQuery(preloadedRacks);

  const grouped = useMemo(() => {
    const map: Record<RackGroup, Rack[]> = {
      available: [],
      reserved: [],
      occupied: [],
      maintenance: [],
      full: [],
    };
    if (!racks) return map;
    for (const rack of racks) {
      map[rackGroup(rack)].push(rack);
    }
    return map;
  }, [racks]);

  if (!racks || racks.length === 0)
    return (
      <div className="flex min-h-[40vh] w-full max-w-lg flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted-foreground/25 bg-muted/20 p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">No racks yet</h1>
        <p className="text-muted-foreground text-sm">
          Add a rack to build your wall.
        </p>
        <Link
          className="rounded-md border border-primary/20 p-3 text-primary hover:text-primary/80"
          href="/admin/racks/add"
        >
          Add Rack
        </Link>
      </div>
    );

  return (
    <div className="w-full sm:px-4 md:px-6">
      <Tabs defaultValue="available" className="gap-4">
        <TabsList
          variant="line"
          className="h-auto min-h-8 w-full max-w-full flex-wrap justify-start gap-0 border-b border-border/80 bg-transparent p-0"
        >
          {GROUP_ORDER.map((key) => {
            const count = grouped[key].length;
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="shrink-0 rounded-none px-3 py-2 text-xs data-active:after:bottom-0 sm:text-sm"
              >
                <span>{GROUP_LABEL[key]}</span>
                <span className="text-muted-foreground tabular-nums">({count})</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {GROUP_ORDER.map((key) => (
          <TabsContent key={key} value={key} className="mt-0 space-y-2">
            <p className="text-muted-foreground text-xs">{GROUP_DESCRIPTION[key]}</p>
            <RackGrid racks={grouped[key]} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default RacksLister;
