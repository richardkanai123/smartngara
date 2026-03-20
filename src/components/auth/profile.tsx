"use client";

import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
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
  AvatarBadge,
} from "@/components/ui/avatar";
import { Camera, MapPin, Pencil, User } from "lucide-react";
import LogOutBtn from "./log-out-btn";
import Link from "next/link";

const UserProfile = () => {
  const { data: sessionData, isPending: isSessionPending } =
    authClient.useSession();


  if (isSessionPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-8" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const user = sessionData?.user;

  if (!user) {
    return (
      <div>
        <h1>Not authenticated</h1>
        <Link href="/login">Login</Link>
      </div>
    )
  }

  // Convert createdAt to Date object if it's a string
  const createdAtDate = user.createdAt
    ? new Date(user.createdAt)
    : null;

  // Format date safely
  const formattedDate = createdAtDate
    ? createdAtDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  // Mock data for demonstration - in production, these would come from user metadata
  const profileData = {
    firstName: user.name?.split(" ")[0] || "",
    lastName: user.name?.split(" ").slice(1).join(" ") || "",
    creationDate: formattedDate,
    email: user.email || "",
    phone: "(+62) 821 2554-5846",
    role: "Admin",
    avatarUrl: user.image || "/logo.png",
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">My Profile</h1>
          <LogOutBtn />
        </div>

        {/* Profile Header Card */}
        <Card className="overflow-visible">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              {/* Avatar with camera badge */}
              <div className="relative">
                <Avatar size="lg" className="size-20">
                  <AvatarImage
                    src={profileData.avatarUrl}
                    alt={user.name || "User"}
                  />
                  <AvatarFallback className="text-lg">
                    {profileData.firstName?.[0] ||
                      user.name?.[0] ||
                      <User className="size-8" />}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-1">
                <h2 className="text-base font-semibold text-foreground">
                  {user.name || "User"}
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

        {/* Personal Information Card */}
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

        {/* Address Card */}
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
                  'Enter your town'
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Street</p>
                <p className="text-sm font-medium text-foreground">
                  'Enter your street'
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
