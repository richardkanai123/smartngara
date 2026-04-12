// deliveries.ts : This file contains the Convex functions for managing deliveries.
import { internalMutation, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Delivery } from "./schema";

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

// update delivery status
export const updateDeliveryStatus = mutation({
  args: {
    id: v.id("deliveries"),
    status: v.union(v.literal("picking-up"), v.literal("delivering"), v.literal("delivered"), v.literal("cancelled")),
  },
  handler: async (ctx, args): Promise<{success: boolean, message: string}> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === 'client') {
      return {success: false, message: "You are not authorized to update the delivery status"};
    }
    const delivery = await ctx.db.get(args.id);
    if (!delivery) throw new Error("Delivery not found");
    if (delivery.status === args.status) {
      return {success: true, message: `Delivery status is already ${args.status}`};
    }
    if(args.status === "delivered") {
      await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
      return {success: true, message: "Delivery status updated to delivered successfully"};
    }

    await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
    return {success: true, message: `Delivery status updated to ${args.status} successfully`};
  },
});

// assign pickup by a courier
export const assignCourier = mutation({
  args: {
    id: v.id("deliveries"),
    courierId: v.id("couriers"),
    taskType: v.union(v.literal("pickup"), v.literal("delivery")),
  },
  handler: async (ctx, args): Promise<{success: boolean, message: string}> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === 'client') {
      return {success: false, message: "You are not authorized to assign a courier to a delivery"};
    }
    const delivery = await ctx.db.get(args.id);
    if (!delivery) throw new Error("Delivery not found");
    if(delivery.type !== args.taskType) {
      return {success: false, message: `Delivery is not a ${args.taskType} delivery`};
    }
    const courier = await ctx.db.get(args.courierId);
    if (!courier) throw new Error("Courier not found");
    if(courier.status ==='off-duty') {
      return {success: false, message: "Courier is off duty"};
    }
    if(courier.currentOrders && courier.currentOrders.length >= 3) {
      return {success: false, message: "Courier has too many orders, please assign another courier"};
    }
    await ctx.db.patch(args.id, { pickupBy: args.courierId, updatedAt: Date.now() });
    return {success: true, message: "Courier assigned to delivery successfully"};
  },
});

// update delivery pickup by
export const updateDeliveryPickupBy = mutation({
  args: {
    id: v.id("deliveries"),
    courierId: v.id("couriers"),
  },
  handler: async (ctx, args): Promise<{success: boolean, message: string}> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === 'client') {
      return {success: false, message: "You are not authorized to update the delivery pickup by"};
    }
    const delivery = await ctx.db.get(args.id);
    if (!delivery) throw new Error("Delivery not found");
    if(delivery.type !== "pickup") {
      return {success: false, message: "Delivery is not a pickup delivery"};
    }
    const courier = await ctx.db.get(args.courierId);
    if (!courier) throw new Error("Courier not found");
    if(courier.status ==='off-duty') {
      return {success: false, message: "Courier is off duty"};
    }
    if(delivery.pickupBy) {
      return {success: false, message: "A courier is already assigned to this delivery"};
    }
    await ctx.db.patch(args.id, { pickupBy: args.courierId, updatedAt: Date.now() });
    return {success: true, message: "Courier assigned to delivery pickup by successfully"};
  },
});

// get all deliveries
export const getAllDeliveries = query({
  args: {},
  handler: async (ctx): Promise<{success: boolean, message: string, deliveries: Delivery[]}> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === 'client') {
      return {success: false, message: "You are not authorized to get all deliveries", deliveries: []};
    }
    const deliveries = await ctx.db.query("deliveries").collect();
    return {success: true, message: "Deliveries fetched successfully", deliveries: deliveries as unknown as Delivery[]};
  },
});

// get a delivery by id
export const getDeliveryById = query({
  args: {
    id: v.id("deliveries"),
  },
  handler: async (ctx, args): Promise<{success: boolean, message: string, delivery: Delivery | null}> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === 'client') {
      return {success: false, message: "You are not authorized to get a delivery by id", delivery: null};
    }
    const delivery = await ctx.db.get(args.id);
    if (!delivery) throw new Error("Delivery not found");
    return {success: true, message: "Delivery fetched successfully", delivery: delivery};
  },
});

// get delivery status
export const getDeliveryStatus = query({
  args: {
    id: v.id("deliveries"),
  },
  handler: async (ctx, args): Promise<{success: boolean, message: string, status: Delivery["status"]}> => {
    const delivery = await ctx.db.get(args.id);
    if (!delivery) throw new Error("Delivery not found");
    return {success: true, message: "Delivery status fetched successfully", status: delivery.status};
  },
});

// cancel delivery
export const cancelDelivery = mutation({
  args: {
    id: v.id("deliveries"),
  },
  handler: async (ctx, args): Promise<{success: boolean, message: string}> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === 'client') {
      return {success: false, message: "You are not authorized to cancel a delivery"};
    }
    const delivery = await ctx.db.get(args.id);
    if (!delivery) throw new Error("Delivery not found");
    if(delivery.status !== "pending") {
      return {success: false, message: "Delivery is not pending"};
    }
    if(delivery.pickupBy) {
      return {success: false, message: "A courier is already assigned to this delivery"};
    }
    if(delivery.deliveryBy) {
      return {success: false, message: "A courier is already assigned to this delivery"};
    }
    await ctx.db.patch(args.id, { status: "cancelled", updatedAt: Date.now() });
    return {success: true, message: "Delivery cancelled successfully"};
  },
});

// unassign courier from delivery
export const unassignCourier = mutation({
  args: {
    id: v.id("deliveries"),
    taskType: v.union(v.literal("pickup"), v.literal("delivery")),
  },
  handler: async (ctx, args): Promise<{success: boolean, message: string}> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === 'client' || role==='courier') {
      return {success: false, message: "You are not authorized to unassign a courier from a delivery"};
    }
    const delivery = await ctx.db.get(args.id);
    if (!delivery) throw new Error("Delivery not found");
    if(delivery.type !== args.taskType) {
      return {success: false, message: `Delivery is not a ${args.taskType} delivery`};
    }
    if(args.taskType === "pickup") {
      await ctx.db.patch(args.id, { pickupBy: undefined, updatedAt: Date.now() });
      return {success: true, message: "Courier unassigned from delivery pickup by successfully"};
    }
    if(args.taskType === "delivery") {
      await ctx.db.patch(args.id, { deliveryBy: undefined, updatedAt: Date.now() });
      return {success: true, message: "Courier unassigned from delivery delivery by successfully"};
    }
    return {success: false, message: `Courier is not assigned to this delivery ${args.taskType}`};
  },
});