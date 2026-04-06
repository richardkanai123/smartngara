// couriers.ts : This file contains the Convex functions for managing couriers.

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import type { Doc, Id } from "./_generated/dataModel";

// Mutation to create a courier
export const create = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    vehicle: v.union(
      v.literal("motorcycle"),
      v.literal("car"),
      v.literal("bicycle"),
      v.literal("other"),
    ),
    vehicleReg: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"couriers">> => {
    const courier = await ctx.db.insert("couriers", {
      userId: args.userId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      vehicle: args.vehicle,
      vehicleReg: args.vehicleReg,
      status: "available",
      currentOrderId: undefined,
      currentClientId: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return courier;
  },
});

// Query to get a courier by userId
export const getCourierByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"couriers"> | null> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const courier = await ctx.db
      .query("couriers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    return courier;
  },
});

// Query to get all couriers
export const getAll = query({
  handler: async (ctx): Promise<Doc<"couriers">[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const couriers = await ctx.db.query("couriers").collect();
    return couriers;
  },
});

// get courier by id
export const getCourierById = query({
  args: {
    id: v.id("couriers"),
  },
  handler: async (ctx, args): Promise<Doc<"couriers"> | null> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const courier = await ctx.db
      .query("couriers")
      .withIndex("by_id", (q) => q.eq("_id", args.id))
      .first();
    if (!courier) throw new Error("Courier not found");
    return courier;
  },
});

// update courier status
export const updateCourierStatus = mutation({
  args: {
    id: v.id("couriers"),
    status: v.union(
      v.literal("available"),
      v.literal("in-transit"),
      v.literal("on-delivery"),
      v.literal("off-duty"),
    ),
  },
  handler: async (ctx, args): Promise<void> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const courier = await ctx.db
      .query("couriers")
      .withIndex("by_id", (q) => q.eq("_id", args.id))
      .first();
    if (!courier) throw new Error("Courier not found");
    await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
  },
});

// get courier current status
export const getCourierCurrentStatus = query({
  args: {
    id: v.id("couriers"),
  },
  handler: async (
    ctx,
    args,
  ): Promise<"available" | "in-transit" | "on-delivery" | "off-duty"> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const courier = await ctx.db
      .query("couriers")
      .withIndex("by_id", (q) => q.eq("_id", args.id))
      .first();
    if (!courier) throw new Error("Courier not found");
    return courier.status;
  },
});


// update courier current order id
export const updateCourierCurrentOrderId = mutation({
  args: {
    id: v.id("couriers"),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args): Promise<void> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const courier = await ctx.db
    .query("couriers")
    .withIndex("by_id", (q) => q.eq("_id", args.id))
    .first();
    if (!courier) throw new Error("Courier not found");
    await ctx.db.patch(args.id, { currentOrderId: args.orderId, updatedAt: Date.now() });
  },
});

