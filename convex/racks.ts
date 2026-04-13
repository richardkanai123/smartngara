// racks.ts : This file contains the Convex functions for managing racks.

import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import type { Doc } from "./_generated/dataModel";
import type { Order } from "./schema";


// Mutation to create a rack
export const createRack = mutation({
  args: {
    label: v.string(),
    size: v.union(v.literal("small"), v.literal("medium"), v.literal("large")),
    location: v.string(),
    maxOrders: v.number(),
  },
  handler: async (ctx, args): Promise<Doc<"racks">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const rack = await ctx.db.insert("racks", {
      label: args.label,
      size: args.size,
      status: "available",
      isReserved: false,  
      location: args.location,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      maxOrders: args.maxOrders,
    });
    return rack as unknown as Doc<"racks">;
  },
});

// Query to get all racks
export const getAllRacks = query({
    handler: async (ctx): Promise<Doc<"racks">[]> => {
        const loggedInUserId = await authComponent.getAuthUser(ctx);
        if (!loggedInUserId) throw new Error("Not authenticated");
    const racks = await ctx.db.query("racks").collect();
    if (!racks) throw new Error("No racks found");
    return racks as unknown as Doc<"racks">[];
  },
});

// Query to get a rack by id
export const getRackById = query({
  args: {
    id: v.id("racks"),
  },
  handler: async (ctx, args): Promise<Doc<"racks">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const rack = await ctx.db.query("racks").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!rack) throw new Error("Rack not found");
    return rack as unknown as Doc<"racks">;
  },
});


// update rack status
export const updateRackStatus = mutation({
  args: {
    id: v.id("racks"),
    status: v.optional(
      v.union(
        v.literal("available"),
        v.literal("occupied"),
        v.literal("maintenance"),
        v.literal("out-of-order"),
        v.literal("full"),
      ),
    ),
  },
  handler: async (ctx, args): Promise<Doc<"racks">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const rack = await ctx.db.query("racks").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!rack) throw new Error("Rack not found");
    const updatedRack = await ctx.db.patch(args.id, { status: args.status ?? rack.status, updatedAt: Date.now() });
    return updatedRack as unknown as Doc<"racks">;
  },
});

// reserve rack
export const reserveRack = mutation({
  args: {
    id: v.id("racks"),
  },
  handler: async (ctx, args): Promise<Doc<"racks">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const rack = await ctx.db.query("racks").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!rack) throw new Error("Rack not found");
    const updatedRack = await ctx.db.patch(args.id, { isReserved: true, updatedAt: Date.now() });
    return updatedRack as unknown as Doc<"racks">;
  },
});

// unreserve rack
export const unreserveRack = mutation({
  args: {
    id: v.id("racks"),
  },
  handler: async (ctx, args): Promise<Doc<"racks">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const rack = await ctx.db.query("racks").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!rack) throw new Error("Rack not found");
    if (!rack.isReserved) throw new Error("Rack is not reserved");
    const updatedRack = await ctx.db.patch(args.id, { isReserved: false, updatedAt: Date.now() });
    return updatedRack as unknown as Doc<"racks">;
  },
});

// update rack details
export const updateRackDetails = mutation({
  args: {
    id: v.id("racks"),
    isReserved: v.optional(v.boolean()),
    label: v.optional(v.string()),
    size: v.optional(v.union(v.literal("small"), v.literal("medium"), v.literal("large"))),
    location: v.optional(v.string()),
    maxOrders: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("available"),
        v.literal("occupied"),
        v.literal("maintenance"),
        v.literal("out-of-order"),
        v.literal("full"),
      ),
    ),
  },
  handler: async (ctx, args): Promise<Doc<"racks">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const rack = await ctx.db.query("racks").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!rack) throw new Error("Rack not found");
    const newRackDetails={
        label: args.label || rack.label,
        size: args.size || rack.size,
        location: args.location || rack.location,
        status: args.status || rack.status,
        isReserved: args.isReserved ?? rack.isReserved,
        maxOrders: args.maxOrders ?? rack.maxOrders,
    };
    const updatedRack = await ctx.db.patch(args.id, newRackDetails);
    return updatedRack as unknown as Doc<"racks">;
  },
});

// delete rack
export const deleteRack = mutation({
  args: {
    id: v.id("racks"),
  },
  handler: async (ctx, args): Promise<string> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const rack = await ctx.db.query("racks").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!rack) throw new Error("Rack not found");
    await ctx.db.delete(args.id);
    return "Rack deleted successfully";
  },
});

// get all available racks
export const getAllAvailableRacks = query({
  handler: async (ctx): Promise<Doc<"racks">[]> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const racks = await ctx.db.query("racks").withIndex("by_status", (q) => q.eq("status", "available")).collect();

    // filter to remove full / maintenance / out-of-order
    const availableRacks = racks.filter((rack) => rack.status !== "full" && rack.status !== "maintenance" && rack.status !== "out-of-order");
   
    return availableRacks;
  },
});

// get all reserved racks
export const getAllReservedRacks = query({
  handler: async (ctx): Promise<Doc<"racks">[]> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const racks = await ctx.db.query("racks").withIndex("by_status", (q) => q.eq("status", "occupied")).collect();
    return racks as unknown as Doc<"racks">[];
  },
});

// add order to rack
export const addOrderToRack = mutation({
  args: {
    id: v.id("racks"),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args): Promise<Doc<"racks">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const rack = await ctx.db.query("racks").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!rack) throw new Error("Rack not found");
    if ((rack.orders?.length || 0) >= rack.maxOrders) throw new Error("Rack is full");
    const nextOrders = [...(rack.orders || []), args.orderId];
    const isFull = nextOrders.length >= rack.maxOrders;
    const nextStatus =
      rack.status === "maintenance" || rack.status === "out-of-order"
        ? rack.status
        : isFull
          ? ("full" as const)
          : nextOrders.length > 0
            ? ("occupied" as const)
            : rack.status;
    const updatedRack = await ctx.db.patch(args.id, {
      orders: nextOrders,
      status: nextStatus,
      updatedAt: Date.now(),
    });
    return updatedRack as unknown as Doc<"racks">;
  },
});

// remove order from rack
export const removeOrderFromRack = mutation({
  args: {
    id: v.id("racks"),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args): Promise<Doc<"racks">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const rack = await ctx.db.query("racks").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!rack) throw new Error("Rack not found");
    if (!rack.orders?.includes(args.orderId)) throw new Error("Order not found in rack");
    const nextOrders = (rack.orders || []).filter((order) => order !== args.orderId);
    let nextStatus = rack.status;
    if (rack.status === "maintenance" || rack.status === "out-of-order") {
      nextStatus = rack.status;
    } else if (nextOrders.length >= rack.maxOrders) {
      nextStatus = "full";
    } else if (nextOrders.length > 0) {
      nextStatus = "occupied";
    } else {
      nextStatus = "available";
    }
    const updatedRack = await ctx.db.patch(args.id, {
      orders: nextOrders,
      status: nextStatus,
      updatedAt: Date.now(),
    });
    return updatedRack as unknown as Doc<"racks">;
  },
});

// get all orders for a rack
export const getAllOrdersForRack = query({
  args: {
    id: v.id("racks"),
  },
  handler: async (ctx, args): Promise<Order[]> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const rack = await ctx.db.query("racks").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!rack) throw new Error("Rack not found");
    const orders: Order[] = [];
    for (const orderId of rack.currentOrders || []) {
      const order = await ctx.db.query("orders").withIndex("by_id", (q) => q.eq("_id", orderId)).first();
      if (order) orders.push(order as unknown as Order);
    }
    return orders;
  },
});

// internal function to check rack availability
export const internalRackAvailabilityCheck = internalQuery({
  args: {
    id: v.id("racks"),
  },
  handler: async (ctx, args): Promise<{ available: boolean, reason: string }> => {
    const rack = await ctx.db.get(args.id);
    if (!rack) return { available: false, reason: "Rack not found" };

    if (rack.isReserved) return { available: false, reason: "Rack is reserved" };

    if (rack.status === "full") return { available: false, reason: "Rack is full" };

    const used = rack.orders?.length ?? 0;
    // check if rack is available
    const rackAvailability =((rack.status !== "out-of-order" && rack.status !=="maintenance" ) && rack.maxOrders >= (rack.currentOrders?.length ?? 0));

    if (!rackAvailability) return { available: false, reason: "Rack is not available" };

    return { available: true, reason: "Rack is available" };
  },
})

// internal function to add order to rack
export const internalAddOrderToRack = internalMutation({
  args: {
    id: v.id("racks"),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args): Promise<{ success: boolean, reason: string, orders: number }> => {
    const rack = await ctx.db.get(args.id);
    if (!rack) return { success: false, reason: "Rack not found", orders: 0 };
    const count = rack.orders?.length ?? 0;
    // Re-check capacity in the same transaction (avoids races with concurrent createOrder)
    if (count >= rack.maxOrders) {
      return { success: false, reason: "Rack is full", orders: count };
    }
    const nextOrders = [...(rack.orders ?? []), args.orderId];
    const isFull = nextOrders.length >= rack.maxOrders;
    const nextStatus =
      rack.status === "maintenance" || rack.status === "out-of-order"
        ? rack.status
        : isFull
          ? ("full" as const)
          : nextOrders.length > 0
            ? ("occupied" as const)
            : rack.status;
    await ctx.db.patch(args.id, {
      orders: nextOrders,
      status: nextStatus,
      updatedAt: Date.now(),
    });
    return { success: true, reason: "Order added to rack successfully", orders: nextOrders.length };
  },
});


//update rack status
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
  handler: async (ctx, args): Promise<{success: boolean, message: string}> => {
    const rack = await ctx.db.query("racks").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!rack) return {success: false, message: `Rack ${args.id} not found`};
  // check current status vs new status
  if(rack.status === args.status) return {success: true, message: `Rack ${rack.label} status is already ${args.status}`};
  if( rack.isReserved) return {success: false, message: `Rack ${rack.label} is reserved`};

    await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
    return {success: true, message: `Rack ${rack.label} status updated to ${args.status}`};
  }
});

// internal remove order from rack
export const internalRemoveOrderFromRack = internalMutation({
  args: {
    id: v.id("racks"),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args): Promise<{success: boolean, message: string}> => {
    const rack = await ctx.db.query("racks").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!rack) return {success: false, message: `Rack not found`};
    if (!rack.orders?.includes(args.orderId)) return {success: false, message: `Order not found in rack`};
    const nextOrders = (rack.orders || []).filter((order) => order !== args.orderId);
    let nextStatus = rack.status;
    if (rack.status === "maintenance" || rack.status === "out-of-order") {
      nextStatus = rack.status;
    } else if (nextOrders.length >= rack.maxOrders) {
      nextStatus = "full";
    } else if (nextOrders.length > 0) {
      nextStatus = "occupied";
    } else {
      nextStatus = "available";
    }
    await ctx.db.patch(args.id, { orders: nextOrders, status: nextStatus, updatedAt: Date.now() });
    return {success: true, message: `Order removed from rack successfully`};
  },
});