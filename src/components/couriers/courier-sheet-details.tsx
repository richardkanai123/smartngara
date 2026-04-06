'use client'

import { api } from "@convex/_generated/api"
import type { Courier } from "@convex/schema"
import { useQuery } from "convex/react"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"
import { Badge } from "../ui/badge"
import { getCourierStatusColor, getVehicleIcon } from "@/lib/courier-helpers"
import { cn } from "@/lib/utils"
import {
  Mail,
  Phone,
  Package,
  CalendarClock,
  Hash,
  User,
  ClipboardList,
} from "lucide-react"

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">
          {label}
        </p>
        <div className="text-sm text-foreground">{children}</div>
      </div>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-1 pb-2">
      {children}
    </h3>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-xs text-muted-foreground/60 italic py-1">{message}</p>
  )
}

const CourierSheetDetails = ({ courier }: { courier: Courier }) => {
  const {
    email,
    phone,
    vehicle,
    status,
    currentClientId,
    vehicleReg,
    currentOrderId,
    handledDeliveries,
  } = courier

  const currentOrder = useQuery(
    api.orders.getOrderById,
    currentOrderId ? { id: currentOrderId } : "skip"
  )
  const currentClient = useQuery(
    api.clients.getClientById,
    currentClientId ? { id: currentClientId } : "skip"
  )

  const statusColor = getCourierStatusColor(status)
  const VehicleIcon = getVehicleIcon(vehicle)

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="flex flex-col gap-0 p-3">
        {/* Status + Vehicle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VehicleIcon className="size-4 text-muted-foreground" />
            <span className="text-sm capitalize text-foreground">{vehicle}</span>
            {vehicleReg && (
              <span className="text-xs text-muted-foreground font-mono">
                {vehicleReg}
              </span>
            )}
          </div>
          <Badge
            variant="outline"
            className={cn(
              "capitalize text-[10px] font-medium h-5 bg-background",
              statusColor.text,
              statusColor.border
            )}
          >
            {status.replace("-", " ")}
          </Badge>
        </div>

        <Separator />

        {/* Contact */}
        <div className="py-2">
          <SectionHeading>Contact</SectionHeading>
          <DetailRow icon={Mail} label="Email">
            {email}
          </DetailRow>
          <DetailRow icon={Phone} label="Phone">
            {phone}
          </DetailRow>
        </div>

        <Separator />

        {/* Stats */}
        <div className="py-2">
          <SectionHeading>Activity</SectionHeading>
          <DetailRow icon={ClipboardList} label="Deliveries handled">
            <span className="font-medium tabular-nums">
              {handledDeliveries?.length ?? 0}
            </span>
          </DetailRow>
        </div>

        <Separator />

        {/* Current Order */}
        <div className="py-2">
          <SectionHeading>Current Order</SectionHeading>
          {currentOrder ? (
            <div className="space-y-0">
              <DetailRow icon={Hash} label="Order ID">
                <span className="font-mono text-xs">
                  {currentOrder._id.slice(-8)}
                </span>
              </DetailRow>
              <DetailRow icon={Package} label="Status">
                <Badge variant="secondary" className="capitalize text-[10px] h-5">
                  {currentOrder.status}
                </Badge>
              </DetailRow>
              <DetailRow icon={CalendarClock} label="Created">
                {new Date(currentOrder.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </DetailRow>
            </div>
          ) : (
            <EmptyState message="No active order" />
          )}
        </div>

        <Separator />

        {/* Current Client */}
        <div className="py-2">
          <SectionHeading>Current Client</SectionHeading>
          {currentClient ? (
            <div className="space-y-0">
              <DetailRow icon={User} label="Name">
                {currentClient.name}
              </DetailRow>
              <DetailRow icon={Hash} label="Client ID">
                <span className="font-mono text-xs">
                  {currentClient._id.slice(-8)}
                </span>
              </DetailRow>
            </div>
          ) : (
            <EmptyState message="No assigned client" />
          )}
        </div>
      </div>
    </ScrollArea>
  )
}

export default CourierSheetDetails
