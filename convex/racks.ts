import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { Order } from "./schema";
import { api } from "./_generated/api";

type RackStatus = Doc<"racks">["status"];

function deriveRackStatus(
  currentStatus: RackStatus,
  currentOrderCount: number,
  maxOrders: number,
): RackStatus {
  if (currentStatus === "maintenance" || currentStatus === "out-of-order") {
    return currentStatus;
  }
  if (currentOrderCount >= maxOrders) return "full";
  if (currentOrderCount > 0) return "occupied";
  return "available";
}

// Create a rack (admin only)
export const createRack = mutation({
  args: {
    label: v.string(),
    size: v.union(v.literal("small"), v.literal("medium"), v.literal("large")),
    location: v.string(),
    maxOrders: v.number(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role !== "admin") {
      return { success: false, message: "Only admins can create racks" };
    }

    const now = Date.now();
    await ctx.db.insert("racks", {
      label: args.label,
      size: args.size,
      status: "available",
      isReserved: false,
      location: args.location,
      createdAt: now,
      updatedAt: now,
      maxOrders: args.maxOrders,
    });
    return { success: true, message: "Rack created successfully" };
  },
});

// Get all racks (admin/worker)
export const getAllRacks = query({
  args: {},
  handler: async (ctx): Promise<Doc<"racks">[]> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === "client" || role === "courier") {
      return [];
    }

    return await ctx.db.query("racks").order("desc").collect();
  },
});

// Get a rack by ID (admin/worker)
export const getRackById = query({
  args: {
    id: v.id("racks"),
  },
  handler: async (ctx, args): Promise<Doc<"racks"> | null> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === "client" || role === "courier") {
      return null;
    }

    const rack = await ctx.db.get(args.id);
    if (!rack) throw new Error("Rack not found");
    return rack;
  },
});

const rackStatusValue = v.union(
  v.literal("available"),
  v.literal("occupied"),
  v.literal("maintenance"),
  v.literal("out-of-order"),
  v.literal("full"),
);

/** Active orders on the rack; used for occupancy checks. */
function getRackOccupancyCount(rack: Doc<"racks">): number {
  return rack.currentOrders?.length ?? 0;
}

/**
 * Updates rack operational status only. Blocks changes while the rack has active orders.
 * Use {@link updateRackDetails} for label, location, size, reservation, and maxOrders.
 */
export const updateRackStatus = mutation({
  args: {
    id: v.id("racks"),
    status: rackStatusValue,
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role !== "admin" && role !== "worker") {
      return { success: false, message: "You are not authorized to update rack status" };
    }

    const rack = await ctx.db.get(args.id);
    if (!rack) throw new Error("Rack not found");

    const isFull = rack.maxOrders===rack.currentOrders?.length;
    const isOccupied = (rack.currentOrders?.length ?? 0) > 0;

    if(args.status === 'occupied' && !isOccupied) {
      return {
        success: false,
        message: "Cannot change status to occupied while the rack has no active orders",
      };
    }

    if (!isFull && args.status === "full") {
      return {
        success: false,
        message: "Rack is not full",
      };
    }

    if (rack.status === args.status) {
      return {
        success: false,
        message: `Rack ${rack.label} is already ${args.status}`,
      };
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { success: true, message: "Rack status updated successfully" };
  },
});

// Update rack details (admin/worker) — does not set `status`; use updateRackStatus
export const updateRackDetails = mutation({
  args: {
    id: v.id("racks"),
    isReserved: v.optional(v.boolean()),
    label: v.optional(v.string()),
    size: v.optional(v.union(v.literal("small"), v.literal("medium"), v.literal("large"))),
    location: v.optional(v.string()),
    maxOrders: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role !== "admin" && role !== "worker") {
      return { success: false, message: "You are not authorized to update rack details" };
    }

    const rack = await ctx.db.get(args.id);
    if (!rack) throw new Error("Rack not found");

    const updates: Partial<Doc<"racks">> = { updatedAt: Date.now() };
    if (args.label !== undefined) updates.label = args.label;
    if (args.size !== undefined) updates.size = args.size;
    if (args.location !== undefined) updates.location = args.location;
    if (args.isReserved !== undefined) updates.isReserved = args.isReserved;
    if (args.maxOrders !== undefined) updates.maxOrders = args.maxOrders;

    await ctx.db.patch(args.id, updates);
    return { success: true, message: "Rack details updated successfully" };
  },
});

// Reserve a rack (admin/worker)
export const reserveRack = mutation({
  args: {
    id: v.id("racks"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role !== "admin" && role !== "worker") {
      return { success: false, message: "You are not authorized to reserve a rack" };
    }

    const rack = await ctx.db.get(args.id);
    if (!rack) throw new Error("Rack not found");

    if (rack.isReserved) {
      return { success: false, message: "Rack is already reserved" };
    }
    if (rack.status === "maintenance" || rack.status === "out-of-order") {
      return { success: false, message: `Cannot reserve a rack that is ${rack.status}` };
    }

    await ctx.db.patch(args.id, { isReserved: true, updatedAt: Date.now() });
    return { success: true, message: "Rack reserved successfully" };
  },
});

// Unreserve a rack (admin/worker)
export const unreserveRack = mutation({
  args: {
    id: v.id("racks"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role !== "admin" && role !== "worker") {
      return { success: false, message: "You are not authorized to unreserve a rack" };
    }

    const rack = await ctx.db.get(args.id);
    if (!rack) throw new Error("Rack not found");

    if (!rack.isReserved) {
      return { success: false, message: "Rack is not reserved" };
    }

    await ctx.db.patch(args.id, { isReserved: false, updatedAt: Date.now() });
    return { success: true, message: "Rack unreserved successfully" };
  },
});

// Delete a rack (admin only)
export const deleteRack = mutation({
  args: {
    id: v.id("racks"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role !== "admin") {
      return { success: false, message: "Only admins can delete racks" };
    }

    const rack = await ctx.db.get(args.id);
    if (!rack) throw new Error("Rack not found");

    if (rack.currentOrders && rack.currentOrders.length > 0) {
      return { success: false, message: "Cannot delete a rack with active orders" };
    }

    await ctx.db.delete(args.id);
    return { success: true, message: "Rack deleted successfully" };
  },
});

// Get all racks that can accept orders (not full, not reserved, not maintenance/out-of-order)
export const getAllAvailableRacks = query({
  args: {},
  handler: async (ctx): Promise<Doc<"racks">[]> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role !== "admin" && role !== "worker") {
      return [];
    }

    const allRacks = await ctx.db.query("racks").collect();
    return allRacks.filter((rack) => {
      if (rack.isReserved) return false;
      if (rack.status === "maintenance" || rack.status === "out-of-order") return false;
      const currentCount = rack.currentOrders?.length ?? 0;
      return currentCount < rack.maxOrders;
    });
  },
});

// Get all current orders for a rack (admin/worker)
export const getAllOrdersForRack = query({
  args: {
    id: v.id("racks"),
  },
  handler: async (ctx, args): Promise<Order[]> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role !== "admin" && role !== "worker") {
      return [];
    }

    const rack = await ctx.db.get(args.id);
    if (!rack) throw new Error("Rack not found");

    const orders: Order[] = [];
    for (const orderId of rack.currentOrders || []) {
      const order = await ctx.db.get(orderId);
      if (order) orders.push(order);
    }
    return orders;
  },
});

// ── Internal functions (called from orders.ts) ──────────────────────────

// Check rack availability
export const internalRackAvailabilityCheck = internalQuery({
  args: {
    id: v.id("racks"),
  },
  handler: async (ctx, args): Promise<{ available: boolean; reason: string }> => {
    const rack = await ctx.db.get(args.id);
    if (!rack) return { available: false, reason: "Rack not found" };
    if (rack.isReserved) return { available: false, reason: "Rack is reserved" };
    if (rack.status === "maintenance" || rack.status === "out-of-order") {
      return { available: false, reason: `Rack is ${rack.status}` };
    }

    const currentCount = rack.currentOrders?.length ?? 0;
    if (currentCount >= rack.maxOrders) {
      return { available: false, reason: "Rack is full" };
    }

    return { available: true, reason: "Rack is available" };
  },
});

// Add order to rack (updates both orders history and currentOrders)
export const internalAddOrderToRack = internalMutation({
  args: {
    id: v.id("racks"),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; reason: string; orders: number }> => {
    const rack = await ctx.db.get(args.id);
    if (!rack) return { success: false, reason: "Rack not found", orders: 0 };

    const currentOrders = rack.currentOrders ?? [];
    if (currentOrders.includes(args.orderId)) {
      return { success: false, reason: "Order already on this rack", orders: currentOrders.length };
    }
    if (currentOrders.length >= rack.maxOrders) {
      return { success: false, reason: "Rack is full", orders: currentOrders.length };
    }

    const nextCurrentOrders = [...currentOrders, args.orderId];
    const nextAllOrders = [...(rack.orders ?? []), args.orderId];
    const nextStatus = deriveRackStatus(rack.status, nextCurrentOrders.length, rack.maxOrders);

    await ctx.db.patch(args.id, {
      orders: nextAllOrders,
      currentOrders: nextCurrentOrders,
      status: nextStatus,
      updatedAt: Date.now(),
    });
    return { success: true, reason: "Order added to rack successfully", orders: nextCurrentOrders.length };
  },
});

// Update rack status
export const internalUpdateRackStatus = internalMutation({
  args: {
    id: v.id("racks"),
    status: v.union(
      v.literal("available"),
      v.literal("occupied"),
      v.literal("maintenance"),
      v.literal("out-of-order"),
      v.literal("full"),
    ),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    const rack = await ctx.db.get(args.id);
    if (!rack) return { success: false, message: `Rack ${args.id} not found` };
    if (rack.status === args.status) {
      return { success: true, message: `Rack ${rack.label} status is already ${args.status}` };
    }
    if (rack.isReserved) {
      return { success: false, message: `Rack ${rack.label} is reserved` };
    }

    await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
    return { success: true, message: `Rack ${rack.label} status updated to ${args.status}` };
  },
});

// Remove order from rack (removes from currentOrders only; history in orders stays)
export const internalRemoveOrderFromRack = internalMutation({
  args: {
    id: v.id("racks"),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    const rack = await ctx.db.get(args.id);
    if (!rack) return { success: false, message: "Rack not found" };

    const currentOrders = rack.currentOrders ?? [];
    if (!currentOrders.includes(args.orderId)) {
      return { success: false, message: "Order not found in rack" };
    }

    const nextCurrentOrders = currentOrders.filter((id) => id !== args.orderId);
    const nextStatus = deriveRackStatus(rack.status, nextCurrentOrders.length, rack.maxOrders);

    await ctx.db.patch(args.id, {
      currentOrders: nextCurrentOrders,
      status: nextStatus,
      updatedAt: Date.now(),
    });
    return { success: true, message: "Order removed from rack successfully" };
  },
});
