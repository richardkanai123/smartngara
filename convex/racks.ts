// racks.ts : This file contains the Convex functions for managing racks.

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import type { Doc } from "./_generated/dataModel";

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
    status: v.optional(v.union(v.literal("available"), v.literal("occupied"), v.literal("maintenance"), v.literal("out-of-order"))),
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
    status: v.optional(v.union(v.literal("available"), v.literal("occupied"), v.literal("maintenance"), v.literal("out-of-order"))),
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
    return racks as unknown as Doc<"racks">[];
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
    const updatedRack = await ctx.db.patch(args.id, { orders: [...(rack.orders || []), args.orderId], updatedAt: Date.now() });
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
    const updatedRack = await ctx.db.patch(args.id, { orders: (rack.orders || []).filter((order) => order !== args.orderId), updatedAt: Date.now() });
    return updatedRack as unknown as Doc<"racks">;
  },
});