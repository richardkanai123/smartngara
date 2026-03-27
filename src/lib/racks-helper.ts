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
};

export const statusColors = {
  available: "bg-green-500",
  occupied: "bg-yellow-500",
  maintenance: "bg-blue-500",
  "out-of-order": "bg-red-500",
};

export const getRackStatusColor = (status: Rack["status"]) => {
  return statusColors[status as keyof typeof statusColors];
};

/** Left accent + soft fill for wall tiles (pairs with border-l-4) */
export const statusTileStyles: Record<
  Rack["status"],
  { border: string; tint: string; label: string }
> = {
  available: {
    border: "border-l-emerald-500",
    tint: "bg-emerald-500/[0.08] dark:bg-emerald-500/15",
    label: "text-emerald-700 dark:text-emerald-300",
  },
  occupied: {
    border: "border-l-amber-500",
    tint: "bg-amber-500/[0.08] dark:bg-amber-500/15",
    label: "text-amber-800 dark:text-amber-200",
  },
  maintenance: {
    border: "border-l-sky-500",
    tint: "bg-sky-500/[0.08] dark:bg-sky-500/15",
    label: "text-sky-800 dark:text-sky-200",
  },
  "out-of-order": {
    border: "border-l-red-500",
    tint: "bg-red-500/[0.08] dark:bg-red-500/15",
    label: "text-red-800 dark:text-red-200",
  },
};


/** Short code for compact UI (e.g. badges) */
export const getRackSize = (size: Rack["size"]) => {
  switch (size) {
    case "small":
      return "S";
    case "medium":
      return "M";
    case "large":
      return "L";
    default:
      return "S";
  }
};

/** Human-readable size for cards and labels */
export const rackSizeLabel: Record<Rack["size"], string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};