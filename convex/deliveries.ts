// deliveries.ts : This file contains the Convex functions for managing deliveries.
import { internalMutation, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { api } from "./_generated/api";

// create a new delivery
export const createDelivery = mutation({
  args: {
    orderId: v.id("orders"),
    type: v.union(v.literal("pickup"), v.literal("delivery")),
    pickupBy: v.optional(v.id("couriers")),
    deliveryBy: v.id("couriers"),
    pickupAddress: v.optional(v.string()),
    deliveryAddress: v.optional(v.string()),
    pickupDateTime: v.optional(v.number()),
    deliveryDateTime: v.optional(v.number()),
    deliveryFee: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{success: boolean, message: string}> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role !== "admin" && role !== "worker") {
      return {success: false, message: "You are not authorized to create a delivery"};
    }
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.status !== "ready-for-pickup") {
      return {success: false, message: "Order is not ready for pickup"};
    }
    if(!order.isDeliveryRequired) {
      return {success: false, message: "Delivery is not required for this order"};
    }
    if(order.deliveryId) {
      return {success: false, message: "Delivery already exists for this order"};
    }
    await ctx.db.insert("deliveries", {
      orderId: args.orderId,
      type: args.type,
      pickupBy: args.pickupBy,
      deliveryBy: args.deliveryBy,
      pickupAddress: args.pickupAddress,
      deliveryAddress: args.deliveryAddress,
      pickupDateTime: args.pickupDateTime,
      deliveryDateTime: args.deliveryDateTime,
      deliveryFee: args.deliveryFee,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return {success: true, message: "Delivery created successfully"};
  },
});