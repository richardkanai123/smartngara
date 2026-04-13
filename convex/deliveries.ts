import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Delivery } from "./schema";

// 1. Create a new delivery
export const createDelivery = mutation({
  args: {
    orderId: v.id("orders"),
    type: v.union(v.literal("pickup"), v.literal("delivery")),
    pickupBy: v.optional(v.id("couriers")),
    deliveryBy: v.optional(v.id("couriers")),
    pickupAddress: v.optional(v.string()),
    deliveryAddress: v.optional(v.string()),
    pickupDateTime: v.optional(v.number()),
    deliveryDateTime: v.optional(v.number()),
    deliveryFee: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role !== "admin" && role !== "worker") {
      return { success: false, message: "You are not authorized to create a delivery" };
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");
    if (order.status !== "ready-for-pickup") {
      return { success: false, message: "Order is not ready for pickup" };
    }
    if (!order.isDeliveryRequired) {
      return { success: false, message: "Delivery is not required for this order" };
    }
    if (order.deliveryId) {
      return { success: false, message: "Delivery already exists for this order" };
    }

    const now = Date.now();
    const deliveryId = await ctx.db.insert("deliveries", {
      orderId: args.orderId,
      type: args.type,
      pickupBy: args.pickupBy,
      deliveryBy: args.deliveryBy as Doc<"deliveries">["deliveryBy"],
      pickupAddress: args.pickupAddress,
      deliveryAddress: args.deliveryAddress,
      pickupDateTime: args.pickupDateTime,
      deliveryDateTime: args.deliveryDateTime,
      deliveryFee: args.deliveryFee,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.orderId, { deliveryId, updatedAt: now });

    return { success: true, message: "Delivery created successfully" };
  },
});

// 2. Assign a pickup or delivery courier
export const assignCourier = mutation({
  args: {
    id: v.id("deliveries"),
    courierId: v.id("couriers"),
    taskType: v.union(v.literal("pickup"), v.literal("delivery")),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === "client" || role === "courier") {
      return { success: false, message: "You are not authorized to assign a courier to a delivery" };
    }

    const delivery = await ctx.db.get(args.id);
    if (!delivery) throw new Error("Delivery not found");

    const courier = await ctx.db.get(args.courierId);
    if (!courier) throw new Error("Courier not found");
    if (courier.status === "off-duty") {
      return { success: false, message: "Courier is off duty" };
    }
    if (courier.currentOrders && courier.currentOrders.length >= 3) {
      return { success: false, message: "Courier has too many orders, please assign another courier" };
    }

    if (args.taskType === "pickup") {
      if (delivery.pickupBy) {
        return { success: false, message: "A pickup courier is already assigned to this delivery" };
      }
      await ctx.db.patch(args.id, { pickupBy: args.courierId, updatedAt: Date.now() });
      return { success: true, message: "Courier assigned to pickup successfully" };
    }

    if (delivery.deliveryBy) {
      return { success: false, message: "A delivery courier is already assigned to this delivery" };
    }
    await ctx.db.patch(args.id, { deliveryBy: args.courierId, updatedAt: Date.now() });
    return { success: true, message: "Courier assigned to delivery successfully" };
  },
});

// 3. Update delivery status
export const updateDeliveryStatus = mutation({
  args: {
    id: v.id("deliveries"),
    status: v.union(
      v.literal("picking-up"),
      v.literal("delivering"),
      v.literal("completed"),
      v.literal("cancelled"),

    ),
    //"pending" | "delivered" | "cancelled" | "picking-up" | "delivering"
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === "client") {
      return { success: false, message: "You are not authorized to update the delivery status" };
    }

    const delivery = await ctx.db.get(args.id);
    if (!delivery) throw new Error("Delivery not found");

    if (delivery.status === args.status) {
      return { success: true, message: `Delivery status is already ${args.status}` };
    }
    if (delivery.status === "completed" || delivery.status === "cancelled") {
      return { success: false, message: `Cannot update a delivery that is already ${delivery.status}` };
    }

    await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
    return { success: true, message: `Delivery status updated to ${args.status} successfully` };
  },
});

// 4. Get all deliveries
export const getAllDeliveries = query({
  args: {},
  handler: async (ctx): Promise<{ success: boolean; message: string; deliveries: Delivery[] }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === "client") {
      return { success: false, message: "You are not authorized to get all deliveries", deliveries: [] };
    }

    const deliveries = await ctx.db.query("deliveries").order("desc").collect();
    return { success: true, message: "Deliveries fetched successfully", deliveries };
  },
});

// 5. Get delivery by ID
export const getDeliveryById = query({
  args: {
    id: v.id("deliveries"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string; delivery: Delivery | null }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === "client") {
      return { success: false, message: "You are not authorized to get a delivery by id", delivery: null };
    }

    const delivery = await ctx.db.get(args.id);
    if (!delivery) {
      return { success: false, message: "Delivery not found", delivery: null };
    }
    return { success: true, message: "Delivery fetched successfully", delivery };
  },
});

// 6. Get deliveries by courier ID (pickupBy or deliveryBy)
export const getDeliveriesByCourierId = query({
  args: {
    courierId: v.id("couriers"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string; deliveries: Delivery[] }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === "client") {
      return { success: false, message: "You are not authorized to view deliveries by courier", deliveries: [] };
    }

    const pickupDeliveries = await ctx.db
      .query("deliveries")
      .withIndex("by_pickupBy", (q) => q.eq("pickupBy", args.courierId))
      .collect();

    const deliveryDeliveries = await ctx.db
      .query("deliveries")
      .withIndex("by_deliveryBy", (q) => q.eq("deliveryBy", args.courierId))
      .collect();

    const seen = new Set<string>();
    const combined: Delivery[] = [];
    for (const d of [...pickupDeliveries, ...deliveryDeliveries]) {
      if (!seen.has(d._id)) {
        seen.add(d._id);
        combined.push(d);
      }
    }

    return { success: true, message: "Deliveries fetched successfully", deliveries: combined };
  },
});

// 7. Unassign a pickup or delivery courier
export const unassignCourier = mutation({
  args: {
    id: v.id("deliveries"),
    taskType: v.union(v.literal("pickup"), v.literal("delivery")),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === "client" || role === "courier") {
      return { success: false, message: "You are not authorized to unassign a courier from a delivery" };
    }

    const delivery = await ctx.db.get(args.id);
    if (!delivery) throw new Error("Delivery not found");

    if (args.taskType === "pickup") {
      if (!delivery.pickupBy) {
        return { success: false, message: "No pickup courier is assigned to this delivery" };
      }
      await ctx.db.patch(args.id, { pickupBy: undefined, updatedAt: Date.now() });
      return { success: true, message: "Pickup courier unassigned successfully" };
    }

    if (!delivery.deliveryBy) {
      return { success: false, message: "No delivery courier is assigned to this delivery" };
    }
    await ctx.db.patch(args.id, { deliveryBy: undefined, updatedAt: Date.now() });
    return { success: true, message: "Delivery courier unassigned successfully" };
  },
});

// 8. Delete a delivery (admin only)
export const deleteDelivery = mutation({
  args: {
    id: v.id("deliveries"),
  },
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role !== "admin") {
      return { success: false, message: "Only admins can delete deliveries" };
    }

    const delivery = await ctx.db.get(args.id);
    if (!delivery) throw new Error("Delivery not found");

    if (delivery.status !== "pending" && delivery.status !== "cancelled") {
      return { success: false, message: "Can only delete deliveries that are pending or cancelled" };
    }

    const order = await ctx.db.get(delivery.orderId);
    if (order?.deliveryId === args.id) {
      await ctx.db.patch(delivery.orderId, { deliveryId: undefined, updatedAt: Date.now() });
    }

    await ctx.db.delete(args.id);
    return { success: true, message: "Delivery deleted successfully" };
  },
});
