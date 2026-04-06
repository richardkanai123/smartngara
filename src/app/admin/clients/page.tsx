import UnAuthorised from "@/components/auth/un-authorised"
import ClientsTable from "@/components/clients/clients-table"
import { fetchAuthQuery } from "@/lib/auth-server"
import { api } from "@convex/_generated/api"
import { Suspense } from "react"

const AdminClientsPage = async () => {
    const myRole = await fetchAuthQuery(api.userRoles.amIAdmin)

    if(!myRole ) {
    return (
        <div className="w-full flex flex-col items-center justify-center h-screen gap-4">
        <UnAuthorised
            title="Unauthorised Access"
            message="You are not authorised to access this page. Please contact the administrator."
        />
        </div>
    )
    }


    const clients = await fetchAuthQuery(api.clients.getAllClients, {
        limit: 10 as never,
        offset: 0 as never,
    } as never)

    if(!clients) {
        return (
            <div className="w-full flex flex-col items-center justify-center h-screen gap-4">
                <UnAuthorised
                    title="No clients found"
                    message="No clients found. Please add a client to get started."
                />
            </div>
        )
      }
 
  return (
    <div className="mx-auto w-full min-h-[50vh] space-y-4 p-1 sm:p-2">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <p className="text-xs text-muted-foreground">
          Sort columns by header. Edit or remove clients from the row actions.
        </p>
      </div>
      <Suspense fallback={<div>Loading clients...</div>}>
      <ClientsTable clients={clients} />
      </Suspense>
    </div>
  )
}

export default AdminClientsPage