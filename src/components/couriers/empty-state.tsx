'use client'

import Link from "next/link"

const EmptyState = ({filtered}:{filtered?: boolean}) => {
  return (
    <div className="flex min-h-[40vh] m-auto w-full max-w-lg flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted-foreground/25 bg-muted/20 p-8 text-center">
    <h1 className="text-2xl font-semibold tracking-tight">
      {filtered ? "No couriers found" : "No couriers yet"}
    </h1>
    <p className="text-muted-foreground text-sm">
      {filtered ? "Try clearing your filters" : "Add a courier to start delivering orders."}
    </p>
    {!filtered && <Link
      className="bg-primary hover:bg-primary/80 p-3 border border-primary/20 rounded-md"
      href="/admin/couriers/add"
    >
      Add Courier
    </Link>}
  </div>
  )
}
export default EmptyState