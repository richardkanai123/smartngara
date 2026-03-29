// Helpers for couriers

import { Courier } from "@convex/schema";
import { MotorcycleIcon, PersonSimpleWalkIcon } from "@phosphor-icons/react";
import { BicycleIcon } from "@phosphor-icons/react/dist/ssr";
import { CarFrontIcon } from "lucide-react";

const statusColors = {
    "available": "border-green-500",
    "in-transit": "border-blue-500",
    "on-delivery": "border-yellow-500",
    "off-duty": "border-gray-500",
}

export const getCourierStatusColor = (status: Courier["status"]) => {
    return statusColors[status as keyof typeof statusColors];
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