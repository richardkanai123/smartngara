"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Preloaded } from "convex/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { MapPin, Pencil, User, Loader2 } from "lucide-react";
import LogOutBtn from "./log-out-btn";

/** Format role label for display */
function formatRoleLabel(role: "client" | "admin" | "courier" | null) {
  if (!role) return "Unknown";
  switch (role) {
    case "admin":
      return "Admin";
    case "courier":
      return "Courier";
    default:
      return "Client";
  }
}

const UserProfile = ({ preloadedUserQuery }: { preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser> }) => {
  const convexUser = usePreloadedAuthQuery(preloadedUserQuery);
  const userRole = useQuery(api.userRoles.getMyRole);

  if (convexUser === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4">
        <p className="text-center text-sm text-muted-foreground">
          Could not load your account from the server.
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Check that Convex is running and you are signed in.
        </p>
      </div>
    );
  }

  // Show loading state while role is being fetched
  if (userRole === undefined) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-center text-sm text-muted-foreground">
          Loading profile...
        </p>
      </div>
    );
  }

  const createdAtDate = convexUser.createdAt
    ? new Date(convexUser.createdAt)
    : null;

  const formattedDate = createdAtDate
    ? createdAtDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const displayName =
    convexUser.name?.trim() ||
    convexUser.email ||
    "User";

  const phone =
    (convexUser as { phoneNumber?: string | null }).phoneNumber?.trim() ||
    "—";

  const profileData = {
    firstName: displayName.split(" ")[0] || "",
    lastName: displayName.split(" ").slice(1).join(" ") || "",
    creationDate: formattedDate,
    email: convexUser.email || "",
    phone,
    role: formatRoleLabel(userRole),
    avatarUrl: convexUser.image || "/logo.png",
  };

  return (
      <div className="mx-auto max-w-4xl space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">My Profile</h1>
          <LogOutBtn />
        </div>

        <Card className="overflow-visible">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar size="lg" className="size-20">
                  <AvatarImage
                    src={profileData.avatarUrl}
                      alt={convexUser.name || "User"}
                  />
                  <AvatarFallback className="text-lg">
                    {profileData.firstName?.[0] ||
                      convexUser.name?.[0] ||
                      <User className="size-8" />}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 space-y-1">
                <h2 className="text-base font-semibold text-foreground">
                  {convexUser.name || "User"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {profileData.role}
                </p>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  <span>Member since {profileData.creationDate}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">
              Personal Information
            </CardTitle>
            <CardAction>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                type="button"
              >
                <Pencil className="size-3" />
                Edit
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">First Name</p>
                <p className="text-sm font-medium text-foreground">
                  {profileData.firstName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Last Name</p>
                <p className="text-sm font-medium text-foreground">
                  {profileData.lastName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Creation Date</p>
                <p className="text-sm font-medium text-foreground">
                  {profileData.creationDate}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="text-sm font-medium text-foreground">
                  {profileData.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="text-sm font-medium text-foreground">
                  {profileData.phone}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">User Role</p>
                <p className="text-sm font-medium text-foreground">
                  {profileData.role}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-sm font-semibold text-foreground">
              Address
            </CardTitle>
            <CardAction>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                type="button"
              >
                <Pencil className="size-3" />
                Edit
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Town</p>
                <p className="text-sm font-medium text-foreground">
                  Add your town
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Street</p>
                <p className="text-sm font-medium text-foreground">
                  Add your street
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default UserProfile;
