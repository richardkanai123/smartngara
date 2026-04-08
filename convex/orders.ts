// orders.ts : This file contains the Convex functions for managing orders.

import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import type { Doc, Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";

// Mutation to create an order
export const createOrder = mutation({
  args: {
    clientId: v.id("clients"),
    rackId: v.optional(v.id("racks")),
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
  handler: async (ctx, args): Promise<{order: Id<"orders">, success: boolean}> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");

    // check if logged in user can add order
    const userRoleData = await ctx.runQuery(api.userRoles.getUserRoleByUserId, { id: loggedInUserId._id });

    const role = userRoleData?.role;
    const canAddOrder = role ==='admin' || role ==='worker'

    if(!canAddOrder) throw new Error("You are not authorized to add an order");

    const client = await ctx.db.get(args.clientId);
    if (!client) throw new Error("Client not found");

    // check rack availability
    if (args.rackId) {
      const availability = await ctx.runQuery(internal.racks.internalRackAvailabilityCheck, {
        id: args.rackId,
      });
      if (!availability.available) throw new Error(availability.reason);
    }

    const order = await ctx.db.insert("orders", {
      clientId: args.clientId,
      status: args.status,
      items: args.items,
      instructions: args.instructions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      handlerId: loggedInUserId._id as unknown as Id<"workers">,
      completedAt: undefined,
      isDeliveryRequired: args.isDeliveryRequired,
      ironing: args.ironing,
      ironingFee: args.ironingFee,
      orderFee: args.orderFee,
      rackId: args.rackId,
    });

    // add order to rack
    if (args.rackId) {
      const result = await ctx.runMutation(internal.racks.internalAddOrderToRack, {
        id: args.rackId,
        orderId: order,
      });
      if (!result.success) throw new Error(result.reason);
      // Rack status (occupied / full) is set in internalAddOrderToRack
    }

    return {order, success: true};
  },
});

/** Admin / worker: all orders with client docs, newest first */
export const listOrdersWithClients = query({
  args: {},
  handler: async (
    ctx,
  ): Promise<{ order: Doc<"orders">; client: Doc<"clients"> | null }[]> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");

    const roleDoc = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", loggedInUserId._id))
      .first();
    const role = roleDoc?.role;
    if (role !== "admin" && role !== "worker") {
      throw new Error("Not authorized");
    }

    const orders = await ctx.db.query("orders").collect();
    orders.sort((a, b) => b.createdAt - a.createdAt);

    const out: { order: Doc<"orders">; client: Doc<"clients"> | null }[] = [];
    for (const order of orders) {
      const client = await ctx.db.get(order.clientId);
      out.push({ order, client });
    }
    return out;
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


