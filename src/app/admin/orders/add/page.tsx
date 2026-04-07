import AddOrderForm from "@/components/orders/add-order"
import UnAuthorised from "@/components/auth/un-authorised"
import { fetchAuthQuery } from "@/lib/auth-server"
import { api } from "@convex/_generated/api"
import { Suspense } from "react"
import { Spinner } from "@/components/ui/spinner"

const AdminOrdersAddPage = async () => {
  const myRole = await fetchAuthQuery(api.userRoles.amIAdmin)

  if (!myRole) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <UnAuthorised
          title="Unauthorised Access"
          message="You are not authorised to access this page. Please contact the administrator."
        />
      </div>
    )
  }

  const [clients, racks] = await Promise.all([
    fetchAuthQuery(api.clients.getAllClients),
    fetchAuthQuery(api.racks.getAllRacks),
  ])

  return (
    <div className="flex min-h-screen w-full flex-col gap-4 bg-background p-4">
      <div className="mx-auto w-full max-w-lg space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          New order
        </h1>
        <p className="text-xs text-muted-foreground">
          Client, optional racks, line items, and fees. Status is set to pending.
        </p>
      </div>
      <Suspense fallback={<Spinner className="size-4" />}>
      <AddOrderForm
        clients={clients ?? []}
        racks={Array.isArray(racks) ? racks : []}
        />
        </Suspense>
    </div>
  )
}

export default AdminOrdersAddPage
