import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
/**
 * Notifications Table
 * Stores user notifications with read status
 */
export const notifications = defineTable({
  userId: v.string(),
  title: v.string(),
  message: v.string(),
  createdAt: v.number(),
  readAt: v.optional(v.number()),
  type: v.union(
    v.literal("info"),
    v.literal("warning"),
    v.literal("error"),
    v.literal("success"),
  ),
  url: v.optional(v.string()),
})
  .index("by_user", ["userId"])
  .index("by_user_read", ["userId", "readAt"]);


export const userRoles = defineTable({
  userId: v.string(),
  role: v.union(v.literal("admin"), v.literal("client"), v.literal("courier"), v.literal("worker")),
  createdBy: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_role", ["role"]);

/**
 * Invites Table
 * Tracks pending user invitations
 */
export const invites = defineTable({
  email: v.string(),
  role: v.union(v.literal("client"), v.literal("courier"), v.literal("worker")),
  invitedBy: v.string(),
  token: v.string(),
  expiresAt: v.number(),
  createdAt: v.number(),
  status: v.union(
    v.literal("pending"),
    v.literal("accepted"),
    v.literal("expired"),
    v.literal("revoked"),
  ),
  acceptedAt: v.optional(v.number()),
  userId: v.optional(v.string()),
})
  .index("by_token", ["token"])
  .index("by_email", ["email"])
  .index("by_status", ["status"])
  .index("by_email_status", ["email", "status"]);

export const clients = defineTable({
  userId: v.string(),
  name: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
  address: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_email", ["email"]);

export const couriers = defineTable({
  userId: v.string(),
  name: v.string(),
  email: v.string(),
  phone: v.string(),
  vehicle: v.union(v.literal("motorcycle"), v.literal("car"), v.literal("bicycle"), v.literal("other")),
  vehicleReg: v.optional(v.string()),
  status: v.union(v.literal("available"), v.literal("in-transit"), v.literal("on-delivery"),v.literal("off-duty")),
  currentOrderId: v.optional(v.id("orders")),
  currentClientId: v.optional(v.id("clients")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_status", ["status"]);

export const workers = defineTable({
  userId: v.string(),
  name: v.string(),
  email: v.string(),
  phone: v.string(),
  status: v.union(v.literal("on-duty"), v.literal("off-duty")),
  currentOrderId: v.optional(v.id("orders")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_userId", ["userId"])
  .index("by_status", ["status"]);

export const racks = defineTable({
  label: v.string(),
  size: v.union(v.literal("small"), v.literal("medium"), v.literal("large")),
  status: v.union(v.literal("available"), v.literal("unavailable"), v.literal("maintenance"), v.literal("out-of-order")),
  isReserved: v.boolean(),
  location: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_label", ["label"])
  .index("by_status", ["status"]);

export const orders = defineTable({
  clientId: v.id("clients"),
  handlerId: v.id("workers"),
  rackId: v.optional(v.array(v.id("racks"))),
  status: v.union(v.literal("pending"), v.literal("in-transit"), v.literal("processing"), v.literal("ready-for-pickup"), v.literal("on-delivery"), v.literal("delivered"), v.literal("cancelled")),
  items: v.array(v.object({
    name: v.string(),
    quantity: v.number(),
  })),
  isDeliveryRequired: v.boolean(),
  deliveryId: v.optional(v.id("deliveries")),
  instructions: v.optional(v.string()),
  ironing: v.boolean(),
  ironingFee: v.optional(v.number()),
  orderFee: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_clientId", ["clientId"])
  .index("by_handlerId", ["handlerId"])
  .index("by_status", ["status"])
  .index("by_clientId_status", ["clientId", "status"]);

export const deliveries = defineTable({
  orderId: v.id("orders"),
  pickupBy: v.id("couriers"),
  deliveryBy: v.id("couriers"),
  pickupAddress: v.optional(v.string()),
  deliveryAddress: v.optional(v.string()),
  pickupDateTime: v.optional(v.number()),
  deliveryDateTime: v.optional(v.number()),
  deliveryFee: v.optional(v.number()),
  status: v.union(v.literal("pending"), v.literal("in-transit"), v.literal("on-delivery"), v.literal("delivered"), v.literal("cancelled")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_orderId", ["orderId"])
  .index("by_pickupBy", ["pickupBy"])
  .index("by_deliveryBy", ["deliveryBy"])
  .index("by_status", ["status"]);


export const invoices = defineTable({
  orderId: v.id("orders"),
  deliveryId: v.optional(v.id("deliveries")),
  initiatedBy: v.id("workers"),
  clientId: v.id("clients"),
  totalAmount: v.number(),
  amountDue: v.number(),
  status: v.union(v.literal("pending"), v.literal("paid"), v.literal("partial")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_orderId", ["orderId"])
  .index("by_deliveryId", ["deliveryId"])
  .index("by_initiatedBy", ["initiatedBy"])
  .index("by_clientId", ["clientId"])
  .index("by_status", ["status"]);


export const transactions = defineTable({
  invoiceId: v.id("invoices"),
  referenceId: v.string(),
  paymentMethod: v.union(v.literal("cash"), v.literal("mpesa")),
  date: v.number(),
  amount: v.number(),
  status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("rejected"), v.literal("failed")),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_invoiceId", ["invoiceId"])
  .index("by_referenceId", ["referenceId"])
  .index("by_status", ["status"]);

export default defineSchema({
  notifications,
  userRoles,
  invites,
  clients,
  orders,
  deliveries,
  invoices,
  transactions,
  racks,
  couriers,
  workers,
});
