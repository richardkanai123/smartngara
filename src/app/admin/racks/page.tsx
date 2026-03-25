import { api } from "@convex/_generated/api";
import { preloadAuthQuery } from "@/lib/auth-server";
import { Suspense } from "react";
import DefaultError from "@/components/default-error";
import RacksLister from "@/components/racks/racks-lister";

async function RacksSection() {
  try {
    const preloaded = await preloadAuthQuery(api.racks.getAllRacks);
    return( <Suspense fallback={<div>Loading racks...</div>}>
        <RacksLister preloadedRacks={preloaded} />
      </Suspense>);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load racks";
    return (
      <DefaultError errorMessage={message} />
    );
  }
}

export default function AdminRackPage() {
  return (
    <div className="mt-20 flex w-full bg-background justify-center items-center">
     <Suspense fallback={<div>Loading racks...</div>}>
        <RacksSection />
      </Suspense>
    </div>
  );
}
