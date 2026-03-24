// invoices.ts : This file contains the Convex functions for managing invoices.
import { internalMutation, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import type { Doc, Id } from "./_generated/dataModel";
import { v } from "convex/values";


// create invoice
export const createInvoice = mutation({
  args: {
    orderId: v.id("orders"),
    clientId: v.id("clients"),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("partial"), v.literal("cancelled")),
  },
  handler: async (ctx, args): Promise<Doc<"invoices">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");

    const order = await ctx.db.query("orders").withIndex("by_id", (q) => q.eq("_id", args.orderId)).first();
    if (!order) throw new Error("Order not found");

    const client = await ctx.db.query("clients").withIndex("by_id", (q) => q.eq("_id", order.clientId)).first();
    if (!client) throw new Error("Client not found");

    const worker = await ctx.db.query("workers").withIndex("by_userId", (q) => q.eq("userId", loggedInUserId._id)).first();
    if (!worker) throw new Error("Worker not found");

    const delivery =order.deliveryId ? await ctx.db.query("deliveries").withIndex("by_id", (q) => q.eq("_id", order.deliveryId as Id<"deliveries">)).first() : null;

    const totalAmountDue = (order.orderFee ?? 0) + (delivery?.deliveryFee ?? 0) + (order.ironingFee ?? 0);

    const invoiceItems = {
        orderId: order._id,
        clientId: client._id,
        status: args.status,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        initiatedBy: worker._id,
        totalAmount: totalAmountDue,
        amountDue: totalAmountDue,
    }

    const invoice = await ctx.db.insert("invoices", invoiceItems);
    return invoice as unknown as Doc<"invoices">;
  }
});

// get invoice by id
export const getInvoiceById = query({
  args: {
    id: v.id("invoices"),
  },
  handler: async (ctx, args): Promise<Doc<"invoices">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const invoice = await ctx.db.query("invoices").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!invoice) throw new Error("Invoice not found");
    return invoice as unknown as Doc<"invoices">;
  },
});

// get all invoices
export const getAllInvoices = query({
  args: {},
  handler: async (ctx): Promise<Doc<"invoices">[]> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const invoices = await ctx.db.query("invoices").collect();
    return invoices as unknown as Doc<"invoices">[];
  },
});

// get all invoices by client id
export const getAllInvoicesByClientId = query({
  args: {
    clientId: v.id("clients"),
  },
  handler: async (ctx, args): Promise<Doc<"invoices">[]> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const invoices = await ctx.db.query("invoices").withIndex("by_clientId", (q) => q.eq("clientId", args.clientId)).collect();
    return invoices as unknown as Doc<"invoices">[];
  },
});

// get all invoices by worker id
export const getAllInvoicesByWorkerId = query({
  args: {
    workerId: v.id("workers"),
  },
  handler: async (ctx, args): Promise<Doc<"invoices">[]> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const invoices = await ctx.db.query("invoices").withIndex("by_initiatedBy", (q) => q.eq("initiatedBy", args.workerId)).collect();
    return invoices as unknown as Doc<"invoices">[];
  },
});

// update invoice status
export const updateInvoiceStatus = internalMutation({
  args: {
    id: v.id("invoices"),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("partial"), v.literal("cancelled")),
  },
  handler: async (ctx, args): Promise<Doc<"invoices">> => {
    const invoice = await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
    return invoice as unknown as Doc<"invoices">;
  },
});

// delete invoice
export const deleteInvoice = mutation({
  args: {
    id: v.id("invoices"),
  },
  handler: async (ctx, args): Promise<string> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const invoice = await ctx.db.query("invoices").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!invoice) throw new Error("Invoice not found");
    await ctx.db.delete(args.id);
    return 'Invoice deleted successfully';
  },
});

// cancel invoice
export const cancelInvoice = mutation({
  args: {
    id: v.id("invoices"),
  },
  handler: async (ctx, args): Promise<string> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const invoice = await ctx.db.query("invoices").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!invoice) throw new Error("Invoice not found");
    await ctx.db.patch(args.id, { status: "cancelled", updatedAt: Date.now() });
    return 'Invoice cancelled successfully';
  },
});

// close invoice
export const closeInvoice = internalMutation({
  args: {
    id: v.id("invoices"),
  },
  handler: async (ctx, args): Promise<string> => {
    const invoice = await ctx.db.query("invoices").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!invoice) throw new Error("Invoice not found");
    const order = await ctx.db.query("orders").withIndex("by_id", (q) => q.eq("_id", invoice.orderId)).first();
    const finishedOrders = order?.status === 'delivered' || order?.status === 'cancelled';
    if (!finishedOrders) throw new Error("There are pending orders associated with this invoice");
    const delivery = await ctx.db.query("deliveries").withIndex("by_id", (q) => q.eq("_id", order.deliveryId as Id<"deliveries">)).first();
    if (!delivery) throw new Error("Delivery not found");
    const finishedDelivery = delivery?.status === 'delivered' || delivery?.status === 'cancelled';
    if (!finishedDelivery) throw new Error("There are pending deliveries associated with this invoice");
    await ctx.db.patch(args.id, { status: "paid", updatedAt: Date.now() });
    return 'Invoice closed successfully';
  },
});

