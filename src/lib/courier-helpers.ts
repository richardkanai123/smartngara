// Helpers for couriers

import { Courier } from "@convex/schema";
import { MotorcycleIcon, PersonSimpleWalkIcon } from "@phosphor-icons/react";
import { BicycleIcon } from "@phosphor-icons/react/dist/ssr";
import { CarFrontIcon } from "lucide-react";

const statusColors = {
    "available": { border: "border-green-500", bg: "bg-green-500", text: "text-green-500" },
    "in-transit": { border: "border-blue-500", bg: "bg-blue-500", text: "text-blue-500" },
    "on-delivery": { border: "border-yellow-500", bg: "bg-yellow-500", text: "text-yellow-500" },
    "off-duty": { border: "border-gray-500", bg: "bg-gray-500", text: "text-gray-500" },
}

export const getCourierStatusColor = (status: Courier["status"]) => {
    return statusColors[status as keyof typeof statusColors] || { border: "border-gray-500", bg: "bg-gray-500", text: "text-gray-500" };
}


// vehicle icons
const vehicleIcons = {
    "motorcycle": MotorcycleIcon,
    "car": CarFrontIcon,
    "bicycle": BicycleIcon,
    "other": PersonSimpleWalkIcon,
}

export const getVehicleIcon = (vehicle: Courier["vehicle"]) => {
    return vehicleIcons[vehicle as keyof typeof vehicleIcons];
}