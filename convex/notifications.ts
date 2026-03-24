// notifications.ts : This file contains the Convex functions for managing notifications.
import { internalMutation, mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

const notificationFields = {
  userId: v.string(),
  title: v.string(),
  message: v.string(),
  type: v.union(
    v.literal("info"),
    v.literal("warning"),
    v.literal("error"),
    v.literal("success"),
  ),
  url: v.optional(v.string()),
} as const;

/**
 * Create a notification — only callable from other Convex functions (mutations/actions).
 */
export const createInternal = internalMutation({
  args: notificationFields,
  returns: v.id("notifications"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      title: args.title,
      message: args.message,
      type: args.type,
      url: args.url,
      createdAt: Date.now(),
    });
  },
});

const notificationDocValidator = v.object({
  _id: v.id("notifications"),
  _creationTime: v.number(),
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
});

export const getNotifications = query({
  args: {},
  returns: v.array(notificationDocValidator),
  handler: async (ctx): Promise<Doc<"notifications">[]> => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");
    return await ctx.db
      .query("notifications")
      .withIndex("by_user_created", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found");
    if (notification.userId !== user._id) {
      throw new Error("Forbidden");
    }

    await ctx.db.patch(args.notificationId, {
      readAt: Date.now(),
    });
    return null;
  },
});

export const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found");
    if (notification.userId !== user._id) {
      throw new Error("Forbidden");
    }

    await ctx.db.delete(args.notificationId);
    return null;
  },
});
