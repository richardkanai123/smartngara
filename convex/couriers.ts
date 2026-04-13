import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Create a courier (admin/worker only)
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
  handler: async (
    ctx,
    args,
  ): Promise<{
    success: boolean;
    message: string;
    courierId?: Id<"couriers">;
  }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role !== "admin" && role !== "worker") {
      return {
        success: false,
        message: "You are not authorized to create a courier",
      };
    }

    const existing = await ctx.db
      .query("couriers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (existing) {
      return {
        success: false,
        message: "A courier already exists for this user",
      };
    }

    const now = Date.now();
    const courierId = await ctx.db.insert("couriers", {
      userId: args.userId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      vehicle: args.vehicle,
      vehicleReg: args.vehicleReg,
      status: "available",
      createdAt: now,
      updatedAt: now,
    });
    return {
      success: true,
      message: "Courier created successfully",
      courierId,
    };
  },
});

// Get a courier by their auth userId
export const getCourierByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"couriers"> | null> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");

    const courier = await ctx.db
      .query("couriers")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    return courier;
  },
});

// Get all couriers (admin/worker only)
// Frontend expects a flat Doc<"couriers">[] return
export const getAll = query({
  args: {},
  handler: async (ctx): Promise<Doc<"couriers">[]> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === "client" || role === "courier") {
      return [];
    }

    return await ctx.db.query("couriers").order("desc").collect();
  },
});

// Get courier by document ID
export const getCourierById = query({
  args: {
    id: v.id("couriers"),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    success: boolean;
    message: string;
    courier: Doc<"couriers"> | null;
  }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");

    const courier = await ctx.db.get(args.id);
    if (!courier) {
      return { success: false, message: "Courier not found", courier: null };
    }
    return { success: true, message: "Courier fetched successfully", courier };
  },
});

// Update courier status
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
  handler: async (
    ctx,
    args,
  ): Promise<{ success: boolean; message: string }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === "client") {
      return {
        success: false,
        message: "You are not authorized to update a courier status",
      };
    }

    const courier = await ctx.db.get(args.id);
    if (!courier) throw new Error("Courier not found");

    if (courier.status === args.status) {
      return {
        success: true,
        message: `Courier status is already ${args.status}`,
      };
    }

    await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
    return { success: true, message: "Courier status updated successfully" };
  },
});

// Update courier profile (admin/worker, or the courier themselves)
export const updateCourierProfile = mutation({
  args: {
    id: v.id("couriers"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    vehicle: v.optional(
      v.union(
        v.literal("motorcycle"),
        v.literal("car"),
        v.literal("bicycle"),
        v.literal("other"),
      ),
    ),
    vehicleReg: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ success: boolean; message: string }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === "client") {
      return {
        success: false,
        message: "You are not authorized to update a courier profile",
      };
    }

    const courier = await ctx.db.get(args.id);
    if (!courier) throw new Error("Courier not found");

    const updates: Partial<Doc<"couriers">> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.vehicle !== undefined) updates.vehicle = args.vehicle;
    if (args.vehicleReg !== undefined) updates.vehicleReg = args.vehicleReg;

    await ctx.db.patch(args.id, updates);
    return { success: true, message: "Courier profile updated successfully" };
  },
});

// Add an order to a courier's current orders
export const addOrderToCourierCurrentOrders = mutation({
  args: {
    id: v.id("couriers"),
    orderId: v.id("orders"),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ success: boolean; message: string }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === "client") {
      return {
        success: false,
        message: "You are not authorized to add an order to a courier",
      };
    }

    const courier = await ctx.db.get(args.id);
    if (!courier) throw new Error("Courier not found");

    if (courier.currentOrders?.includes(args.orderId)) {
      return {
        success: false,
        message: "Order already in courier current orders",
      };
    }
    if (courier.currentOrders && courier.currentOrders.length >= 3) {
      return {
        success: false,
        message: "Courier has too many orders, please assign another courier",
      };
    }

    await ctx.db.patch(args.id, {
      currentOrders: [...(courier.currentOrders || []), args.orderId],
      updatedAt: Date.now(),
    });
    return {
      success: true,
      message: "Order added to courier current orders successfully",
    };
  },
});

// Remove an order from a courier's current orders
export const removeOrderFromCourierCurrentOrders = mutation({
  args: {
    id: v.id("couriers"),
    orderId: v.id("orders"),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ success: boolean; message: string }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === "client") {
      return {
        success: false,
        message: "You are not authorized to remove an order from a courier",
      };
    }

    const courier = await ctx.db.get(args.id);
    if (!courier) throw new Error("Courier not found");

    if (!courier.currentOrders?.includes(args.orderId)) {
      return { success: false, message: "Order not in courier current orders" };
    }

    await ctx.db.patch(args.id, {
      currentOrders: courier.currentOrders.filter((id) => id !== args.orderId),
      updatedAt: Date.now(),
    });
    return {
      success: true,
      message: "Order removed from courier current orders successfully",
    };
  },
});

// Assign an order to a courier (validates both sides, then adds inline)
export const assignOrderToCourier = mutation({
  args: {
    orderId: v.id("orders"),
    courierId: v.id("couriers"),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ success: boolean; message: string }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === "client" || role === "courier") {
      return {
        success: false,
        message: "You are not authorized to assign an order to a courier",
      };
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const courier = await ctx.db.get(args.courierId);
    if (!courier) throw new Error("Courier not found");

    if (courier.status === "off-duty") {
      return { success: false, message: "Courier is off duty" };
    }
    if (courier.currentOrders?.includes(args.orderId)) {
      return {
        success: false,
        message: "Order already assigned to this courier",
      };
    }
    if (courier.currentOrders && courier.currentOrders.length >= 3) {
      return {
        success: false,
        message: "Courier has too many orders, please assign another courier",
      };
    }

    await ctx.db.patch(args.courierId, {
      currentOrders: [...(courier.currentOrders || []), args.orderId],
      updatedAt: Date.now(),
    });
    return { success: true, message: "Order assigned to courier successfully" };
  },
});

// Delete a courier (admin only)
export const deleteCourier = mutation({
  args: {
    id: v.id("couriers"),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ success: boolean; message: string }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role !== "admin") {
      return { success: false, message: "Only admins can delete couriers" };
    }

    const courier = await ctx.db.get(args.id);
    if (!courier) throw new Error("Courier not found");

    if (courier.currentOrders && courier.currentOrders.length > 0) {
      return {
        success: false,
        message: "Cannot delete a courier with active orders",
      };
    }

    await ctx.db.delete(args.id);
    return { success: true, message: "Courier deleted successfully" };
  },
});

// get available couriers
export const getAvailableCouriers = query({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    success: boolean;
    message: string;
    couriers: Doc<"couriers">[];
  }> => {
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (!role) throw new Error("You are not authenticated");
    if (role === "client") {
      return {
        success: false,
        message: "You are not authorized to get available couriers",
        couriers: [],
      };
    }

    const couriers = await ctx.db
      .query("couriers")
      .withIndex("by_status", (q) => q.eq("status", "available"))
      .collect();
    if (!couriers) {
      return {
        success: true,
        message: "No available couriers found",
        couriers: [],
      };
    }

    const availableCouriers = couriers.filter(
      (courier) =>
        courier.status !== "off-duty" && courier.currentOrders?.length !== 3,
    );
    if (!availableCouriers) {
      return {
        success: true,
        message: "No available couriers found",
        couriers: [],
      };
    }

    return {
      success: true,
      message: "Available couriers fetched successfully",
      couriers: availableCouriers,
    };
  },
});
