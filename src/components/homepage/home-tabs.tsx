import { fetchAuthQuery } from "@/lib/auth-server"
import { api } from "@convex/_generated/api"
import AdminTabs from "./admin-tabs"
import WorkerTabs from "./worker-tabs"
import ClientTabs from "./client-tabs"
import CourierTabs from "./courier-tabs"


const HomeTabs = async () => {

    const role = await fetchAuthQuery(api.userRoles.getMyRole)
    if (!role) {
      return (
        <div className="w-full p-2 sm:p-3 md:p-4 text-center">
          <p className="text-sm sm:text-base text-muted-foreground">No Role Found</p>
        </div>
      )
    }

    if (role === 'admin') {
      return <AdminTabs />
    }

    if (role === 'courier') {
      return (
        <CourierTabs />
      )
    }

    if (role === 'worker') {
      return <WorkerTabs />
    }

    if (role === 'client') {
      return <ClientTabs />
    }
}

export default HomeTabs