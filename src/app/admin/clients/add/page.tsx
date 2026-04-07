import AddWalkInClientForm from "@/components/clients/add-walk-in-clients"

const AddWalkinClientPage = () => {
  return (
    <div className="flex flex-col gap-2 min-h-screen w-full bg-background">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Clients</h2>
        <p className="text-sm font-light tracking-tight text-foreground">
          Add New Client, this client will be added as a walk in client and will not have an account on the platform
        </p>
        <div className="mx-auto w-full max-w-md">
          <AddWalkInClientForm  />
        </div>
    </div>
  )
}

export default AddWalkinClientPage