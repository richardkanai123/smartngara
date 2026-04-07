// order-helpers.ts : This file contains the helper functions and constants for the orders.
import { X, Truck, Package, Loader2, CheckCircle, PauseCircle, MapPin } from "lucide-react";
import type { Order } from "@convex/schema";

// Statuses for the orders
export const orderStatuses: Order["status"][] = [
    "pending",
    "in-transit",
    "processing",
    "ready-for-pickup",
    "on-delivery",
    "delivered",
    "cancelled"
] as const;
// Icons for the order actions
export const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
        case "pending":
            return PauseCircle;
        case "in-transit":
            return Truck;
        case "processing":
            return Loader2;
        case "ready-for-pickup":
            return Package;
        case "on-delivery":
            return MapPin;
        case "delivered":
            return CheckCircle;
        case "cancelled":
            return X;
    }
}


// actions depending on the status
export const getActionsForStatus = (status: Order["status"]) => {
    switch (status) {
        case "pending":
            return "Process";
        case "processing":
            return "Ready for Pickup";
        case "ready-for-pickup":
            return "Deliver";
        case "on-delivery":
            return "Complete";
        case "delivered":
            return "Complete";
        case "cancelled":
            return "Complete";
    }
}

// colors depending on the status
export const getColorForStatus = (status: Order["status"]) => {
    switch (status) {
        case "pending":
            return "bg-yellow-500";
        case "in-transit":
            return "bg-blue-500";
        case "processing":
            return "bg-green-500";
        case "ready-for-pickup":
            return "bg-green-500";
        case "on-delivery":
            return "bg-blue-500";
        case "delivered":
            return "bg-green-500";
        case "cancelled":
            return "bg-red-500";
    }
}