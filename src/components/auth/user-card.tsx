"use client";
import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import type{ api } from "@convex/_generated/api";
import type { Preloaded } from "convex/react";
export const UserCard = ({
  preloadedUserQuery,
}: {
  preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser>;
}) => {
  const user = usePreloadedAuthQuery(preloadedUserQuery);
  return (
    <div className="flex flex-col items-center justify-center bg-card p-4 rounded-md">
      <h1>Welcome {user?.name}</h1>
    </div>
  );
};
export default UserCard;