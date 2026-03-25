// racks-helper.ts : This file contains the helper functions for the racks.

// type imports for racks
type Rack = {
    _id: string;
    label: string;
    size: "small" | "medium" | "large";
    status: "available" | "occupied" | "maintenance" | "out-of-order";
    isReserved: boolean;
    location: string;
    createdAt: number;
    updatedAt: number;
    maxOrders: number;
}

export const statusColors = {
    "available": "bg-green-500",
    "occupied": "bg-yellow-500",
    "maintenance": "bg-blue-500",
    "out-of-order": "bg-red-500",
}

export const getRackStatusColor = (status: Rack["status"]) => {
    return statusColors[status as keyof typeof statusColors];
}

