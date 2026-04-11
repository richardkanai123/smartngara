//workers.ts: this file contains the queries and mutations for the workers collection
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import type { Doc } from "./_generated/dataModel";
import { api } from "./_generated/api";

/** Load a worker / handler by document id (matches `orders.handlerId`). */
export const getWorkerById = query({
  args: {
    id: v.id("workers"),
  },
  handler: async (ctx, args): Promise<Doc<"workers"> | null> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const worker = await ctx.db.get(args.id);
    return worker ?? null;
  },
});

// get worker by user id
export const getWorkerByUserID = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"workers">> => {
    const worker = await ctx.db.query("workers").withIndex("by_userId", (q) => q.eq("userId", args.userId)).first();
    if (!worker) throw new Error("Worker not found");
    return worker;
  },
});


// get current logged in worker details
export const getCurrentWorkerDetails = query({
  args: {},
  handler: async (ctx): Promise<Doc<"workers"> | null> => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const worker = await ctx.db.query("workers").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
    return worker ?? null;
  },
});


// get current logged in worker orders
export const getCurrentWorkerOrders = query({
  args: {},
  handler: async (ctx): Promise<Doc<"orders">[]> => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const worker = await ctx.db.query("workers").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
    if (!worker) throw new Error("Worker not found");
    const orders = await ctx.db.query("orders").withIndex("by_handlerId", (q) => q.eq("handlerId", worker._id)).collect();
    return orders;
  },
});

// get current logged in worker working status
export const getCurrentWorkerWorkingStatus = query({
  args: {},
  handler: async (ctx): Promise<"on-duty" | "off-duty"> => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const worker = await ctx.db.query("workers").withIndex("by_userId", (q) => q.eq("userId", user._id)).first();
    if (!worker) throw new Error("Worker not found");
    return worker.status;
  },
});

/** Current logged-in worker updates their own on-duty / off-duty status. */
export const setCurrentWorkerDutyStatus = mutation({
  args: {
    status: v.union(v.literal("on-duty"), v.literal("off-duty")),
  },
  handler: async (ctx, args): Promise<{ success: true }> => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const role = await ctx.runQuery(api.userRoles.getCurrentUserRole, {});
    if (role !== "worker") {
      throw new Error("Only workers can update duty status");
    }
    const worker = await ctx.db
      .query("workers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    if (!worker) throw new Error("Worker profile not found");
    await ctx.db.patch(worker._id, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});