import LogOutBtn from "@/components/auth/log-out-btn";
import UnauthenticatedCard from "@/components/auth/unauthenticated-card";
import UserCard from "@/components/auth/user-card";
import { isAuthenticated, preloadAuthQuery } from "@/lib/auth-server";
import { api } from "@convex/_generated/api";
import { Suspense } from "react";

const Home = async () => {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <UnauthenticatedCard />
      </div>
    );
  }

  const preloadedUserQuery = await preloadAuthQuery(api.auth.getCurrentUser);
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Suspense fallback={<div>Loading...</div>}>
        <UserCard preloadedUserQuery={preloadedUserQuery} />
        <LogOutBtn />
      </Suspense>
    </div>
  );
};

export default Home;
