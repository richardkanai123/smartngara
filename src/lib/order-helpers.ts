import { X, Truck, Package, Loader2, CheckCircle, PauseCircle, MapPin, LucideIcon } from "lucide-react";
import type { Order } from "@convex/schema";

// Statuses for the orders
export const orderStatuses: Order["status"][] = [
    "pending",
    "processing",
    "ready-for-pickup",
    "in-transit",
    "on-delivery",
    "delivered",
    "cancelled"
] as const;

// Icons mapping for O(1) lookup and exhaustive type checking
export const statusIcons: Record<Order["status"], LucideIcon> = {
    "pending": PauseCircle,
    "processing": Loader2,
    "ready-for-pickup": Package,
    "in-transit": Truck,
    "on-delivery": MapPin,
    "delivered": CheckCircle,
    "cancelled": X,
};

export const getStatusIcon = (status: Order["status"]) => statusIcons[status];

// Actions mapping for the next step in the workflow
export const statusActions: Record<Order["status"], string | null> = {
    "pending": "Process",
    "processing": "Ready for Pickup",
    "ready-for-pickup": "Ship / Deliver",
    "in-transit": "Out for Delivery",
    "on-delivery": "Complete",
    "delivered": null, // Terminal state
    "cancelled": null, // Terminal state
};

export const getActionsForStatus = (status: Order["status"]) => statusActions[status];

// Colors mapping depending on the status
export const statusColors: Record<Order["status"], string> = {
    "pending": "bg-yellow-500",
    "processing": "bg-blue-500",
    "ready-for-pickup": "bg-indigo-500",
    "in-transit": "bg-orange-500",
    "on-delivery": "bg-purple-500",
    "delivered": "bg-green-500",
    "cancelled": "bg-red-500",
};

export const getColorForStatus = (status: Order["status"]) => statusColors[status];