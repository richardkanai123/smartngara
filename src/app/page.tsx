import UnauthenticatedCard from "@/components/auth/unauthenticated-card";
import HomeTabs from "@/components/homepage/home-tabs";
import { isAuthenticated } from "@/lib/auth-server";
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

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Suspense fallback={<div>Loading...</div>}>
        <HomeTabs />
      </Suspense>
    </div>
  );
};

export default Home;
