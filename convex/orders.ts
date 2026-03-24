// orders.ts : This file contains the Convex functions for managing orders.

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import type { Doc, Id } from "./_generated/dataModel";

// Mutation to create an order
export const createOrder = mutation({
  args: {
    clientId: v.id("clients"),
    rackId: v.optional(v.array(v.id("racks"))),
    status: v.union(
      v.literal("pending"),
      v.literal("in-transit"),
      v.literal("ready-for-pickup"),
      v.literal("on-delivery"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
    items: v.array(
      v.object({
        name: v.string(),
        quantity: v.number(),
      }),
    ),
    isDeliveryRequired: v.boolean(),
    instructions: v.string(),
    ironing: v.boolean(),
    ironingFee: v.number(),
    orderFee: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"orders">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const worker = await ctx.db
      .query("workers")
      .withIndex("by_userId", (q) => q.eq("userId", loggedInUserId._id))
      .first();
    if (!worker) throw new Error("Worker not found");
    const order = await ctx.db.insert("orders", {
      clientId: args.clientId,
      status: args.status,
      items: args.items,
      instructions: args.instructions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      handlerId: worker._id,
      isDeliveryRequired: args.isDeliveryRequired,
      ironing: args.ironing,
      ironingFee: args.ironingFee,
      orderFee: args.orderFee,
      rackId: args.rackId,
    });
    return order;
  },
});

// Query to get all orders
export const getAllOrders = query({
  args: {
    clientId: v.id("clients"),
  },
  handler: async (ctx, args): Promise<Doc<"orders">[]> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .collect();
    return orders;
  },
});

// Query to get an order by id
export const getOrderById = query({
  args: {
    id: v.id("orders"),
  },
  handler: async (ctx, args): Promise<Doc<"orders">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const order = await ctx.db
      .query("orders")
      .withIndex("by_id", (q) => q.eq("_id", args.id))
      .first();
    if (!order) throw new Error("Order not found");
    return order as unknown as Doc<"orders">;
  },
});

// Query to get all orders by client id
export const getAllOrdersByClientId = query({
  args: {
    clientId: v.id("clients"),
  },
  handler: async (ctx, args): Promise<Doc<"orders">[]> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .collect();
    return orders;
  },
});

// Query to get all orders by worker id
export const getAllOrdersByWorkerId = query({
  args: {
    workerId: v.id("workers"),
  },
  handler: async (ctx, args): Promise<Doc<"orders">[]> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const worker = await ctx.db
      .query("workers")
      .withIndex("by_userId", (q) => q.eq("userId", args.workerId))
      .first();
    if (!worker) throw new Error("Worker not found");
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_handlerId", (q) => q.eq("handlerId", worker._id))
      .collect();
    return orders;
  },
});

// update order status
export const updateOrderStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("in-transit"),
      v.literal("ready-for-pickup"),
      v.literal("on-delivery"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args): Promise<Doc<"orders">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const order = await ctx.db
      .query("orders")
      .withIndex("by_id", (q) => q.eq("_id", args.id))
      .first();
    if (!order) throw new Error("Order not found");
    const updatedOrder = await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return updatedOrder as unknown as Doc<"orders">;
  },
});

// cancel order
export const cancelOrder = mutation({
  args: {
    id: v.id("orders"),
  },
  handler: async (ctx, args): Promise<Doc<"orders">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const order = await ctx.db
      .query("orders")
      .withIndex("by_id", (q) => q.eq("_id", args.id))
      .first();
    if (!order) throw new Error("Order not found");
    const updatedOrder = (await ctx.db.patch(args.id, {
      status: "cancelled",
      updatedAt: Date.now(),
    })) as unknown as Doc<"orders">;
    return updatedOrder;
  },
});

// delete order
export const deleteOrder = mutation({
  args: {
    id: v.id("orders"),
  },
  handler: async (ctx, args): Promise<string> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const order = await ctx.db
      .query("orders")
      .withIndex("by_id", (q) => q.eq("_id", args.id))
      .first();
    if (!order) throw new Error("Order not found");
    await ctx.db.delete(args.id);
    return "Order deleted successfully";
  },
});


