import React from 'react'
import type { Doc } from '@convex/_generated/dataModel'
import { racks } from '@convex/schema'
type Rack = Doc<"racks">;

const RackCard = ({ rack }: { rack: Rack }) => {
  return (
    <div>RackCard</div>
  )
}

export default RackCard