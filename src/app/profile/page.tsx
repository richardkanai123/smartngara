import UserProfile from "@/components/auth/profile";
import UnauthenticatedCard from "@/components/auth/unauthenticated-card";
import { isAuthenticated, preloadAuthQuery } from "@/lib/auth-server";
import { api } from "@convex/_generated/api";

export default async function ProfilePage() {
  const IsLoggedIn = await isAuthenticated();
  if (!IsLoggedIn) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <UnauthenticatedCard />
      </div>
    )
  }
  const preloadedUser =  await preloadAuthQuery(api.auth.getCurrentUser);

  return <UserProfile preloadedUserQuery={preloadedUser} />;
}
