// deliveries.ts : This file contains the Convex functions for managing deliveries.
import { internalMutation, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

const deliveryFields = {
  orderId: v.id("orders"),
  pickupBy: v.id("couriers"),
  deliveryBy: v.id("couriers"),
  pickupAddress: v.optional(v.string()),
  deliveryAddress: v.string(),
  pickupDateTime: v.optional(v.number()),
  deliveryDateTime: v.optional(v.number()),
  deliveryFee: v.optional(v.number()),
  status: v.union(v.literal("pending"), v.literal("in-transit"), v.literal("on-delivery"), v.literal("delivered"), v.literal("cancelled")),
} as const;

const deliveryDocValidator = v.object({
  _id: v.id("deliveries"),
  _creationTime: v.number(),
  orderId: v.id("orders"),
  pickupBy: v.id("couriers"),
  deliveryBy: v.id("couriers"),
  pickupAddress: v.optional(v.string()),
  deliveryAddress: v.optional(v.string()),
  pickupDateTime: v.optional(v.number()),
  deliveryDateTime: v.optional(v.number()),
  deliveryFee: v.optional(v.number()),
  status: v.union(v.literal("pending"), v.literal("in-transit"), v.literal("on-delivery"), v.literal("delivered"), v.literal("cancelled")),
});

// Create a delivery
export const createDelivery = mutation({
  args: deliveryFields,
  returns: deliveryDocValidator,
  handler: async (ctx, args): Promise<Doc<"deliveries">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const delivery = await ctx.db.insert("deliveries", {
      orderId: args.orderId,
      pickupBy: args.pickupBy,
      deliveryBy: args.deliveryBy,
      pickupAddress: args.pickupAddress,
      deliveryAddress: args.deliveryAddress,
      pickupDateTime: args.pickupDateTime,
      deliveryDateTime: args.deliveryDateTime,
      deliveryFee: args.deliveryFee,
      status: args.status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return delivery as unknown as Doc<"deliveries">;
  },
});

// Get a delivery by id
export const getDeliveryById = query({
  args: {
    id: v.id("deliveries"),
  },
  returns: deliveryDocValidator,
  handler: async (ctx, args): Promise<Doc<"deliveries">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const delivery = await ctx.db.query("deliveries").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!delivery) throw new Error("Delivery not found");
    return delivery as unknown as Doc<"deliveries">;
  },
});


// update delivery time and status internally
export const updateDeliveryTimeAndStatusInternally = internalMutation({
  args: {
    id: v.id("deliveries"),
    deliveryDateTime: v.optional(v.number()),
    status: v.union(v.literal("pending"), v.literal("in-transit"), v.literal("on-delivery"), v.literal("delivered"), v.literal("cancelled")),
  },
  handler: async (ctx, args): Promise<Doc<"deliveries">> => {
    const delivery = await ctx.db.query("deliveries").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!delivery) throw new Error("Delivery not found");
    const updatedDelivery = await ctx.db.patch(args.id, {
      deliveryDateTime: args.deliveryDateTime ?? delivery.deliveryDateTime,
      status: args.status ?? delivery.status,
      updatedAt: Date.now(),
    });
    return updatedDelivery as unknown as Doc<"deliveries">;
  },
});