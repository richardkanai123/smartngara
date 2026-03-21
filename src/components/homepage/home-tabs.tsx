import { fetchAuthQuery } from "@/lib/auth-server"
import { api } from "@convex/_generated/api"
import AdminTabs from "./admin-tabs"


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
        <div className="w-full p-2 sm:p-3 md:p-4">
          <p className="text-sm sm:text-base text-muted-foreground">Courier Tabs</p>
        </div>
      )
    }

  return (
   <div className='w-full p-2 sm:p-3 md:p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-7xl mx-auto'>
    <p className="text-sm sm:text-base text-muted-foreground col-span-full">Client Tabs</p>
   </div>
  )
}

export default HomeTabs