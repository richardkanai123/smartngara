
import DefaultError from "@/components/default-error";
import AddRack from "@/components/racks/add-rack";
import { isAuthenticated, preloadAuthQuery } from "@/lib/auth-server";
import { api } from "@convex/_generated/api";
import { Suspense } from "react";

const AddRackPage = async () => {
  const IsLoggedIn = await isAuthenticated();
  if (!IsLoggedIn) {
    return <DefaultError errorMessage="You are not authorized to access this page" />;
  }
    const userRole = await preloadAuthQuery(api.userRoles.getMyRole, {});
  return (
    <div className="w-full align-middle flex flex-col items-center justify-center gap-4">
        <div className="">
            <h1 className="text-2xl font-bold">Add Rack</h1>
            <p className="text-sm text-muted-foreground">
                Add a new rack to the system.
            </p>
        </div>
      <Suspense fallback={<div>Loading...</div>}>
        <AddRack preloadedUserQuery={userRole} />
      </Suspense>
    </div>
  )
}

export default AddRackPage