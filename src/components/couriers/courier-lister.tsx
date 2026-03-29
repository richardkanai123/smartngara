'use client'

import { usePreloadedAuthQuery } from '@convex-dev/better-auth/nextjs/client'
import { api } from '@convex/_generated/api'
import { Preloaded } from 'convex/react'
import Link from 'next/link'
import CourierCard from './courier-card'
import CourierFilter from './courier-filter'


const CourierLister = ({ preloadedCouriers }: { preloadedCouriers: Preloaded<typeof api.couriers.getAll> }) => {
  const couriers = usePreloadedAuthQuery(preloadedCouriers)

  if (!couriers || couriers.length === 0)
    return (
      <div className="flex min-h-[40vh] w-full max-w-lg flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-muted-foreground/25 bg-muted/20 p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">No couriers yet</h1>
        <p className="text-muted-foreground text-sm">
          Add a courier to start delivering orders.
        </p>
        <Link className="text-primary hover:text-primary/80 p-3 border border-primary/20 rounded-md" href="/admin/couriers/add">Add Courier</Link>
      </div>
    )
  return (
    <div className="w-full p-2">
      <CourierFilter />
          {couriers.map((courier) => (
            <CourierCard key={courier._id} courier={courier} />
          ))}
    </div>
  )
}

export default CourierLister