"use client";
import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import type { api } from "@convex/_generated/api";
import type { Preloaded } from "convex/react";
import RackCard from "./rack-card";
import Link from "next/link";

const RacksLister = ({
  preloadedRacks,
}: {
  preloadedRacks: Preloaded<typeof api.racks.getAllRacks>;
}) => {
  const racks = usePreloadedAuthQuery(preloadedRacks);
  if (!racks || racks.length === 0)
    return (
      <div className="flex min-h-[40vh] w-full max-w-lg flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted-foreground/25 bg-muted/20 p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">No racks yet</h1>
        <p className="text-muted-foreground text-sm">
          Add a rack to build your wall.
        </p>
        <Link className="text-primary hover:text-primary/80 p-3 border border-primary/20 rounded-md" href="/admin/racks/add">Add Rack</Link>
      </div>
    );

  return (
    <div className="w-full sm:px-4 md:px-6">
      {/* Wall: dense brick-style grid + mortar lines */}
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
    </div>
  );
};

export default RacksLister;
