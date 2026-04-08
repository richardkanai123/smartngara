import { api } from "@convex/_generated/api";
import { fetchAuthQuery, preloadAuthQuery } from "@/lib/auth-server";
import { Suspense } from "react";
import DefaultError from "@/components/default-error";
import RacksLister from "@/components/racks/racks-lister";
import UnAuthorised from "@/components/auth/un-authorised";

async function RacksSection() {
  try {
    const preloaded = await preloadAuthQuery(api.racks.getAllRacks);
    return (
      <Suspense fallback={<div>Loading racks...</div>}>
        <RacksLister preloadedRacks={preloaded} />
      </Suspense>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load racks";
    return <DefaultError errorMessage={message} />;
  }
}

export default async function AdminRackPage() {
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
    <div className="flex flex-col w-full bg-background justify-center items-center">
      <div className="w-full border-b border-border/60 p-4">
        <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
          Rack wall
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Click a slot to open details. Colors show status at a glance.
        </p>
      </div>
      <div className="w-full">
        <Suspense fallback={<div>Loading racks...</div>}>
          <RacksSection />
        </Suspense>
      </div>
    </div>
  );
}
