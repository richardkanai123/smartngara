// notifications.ts : This file contains the schema for the notifications table.
import { defineTable } from "convex/server";
import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const notifications = defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
    type: v.union(v.literal("info"), v.literal("warning"), v.literal("error"), v.literal("success")),
    url: v.optional(v.string()),

})

// Mutation to create a notification (used internally and by the action)
export const create = mutation({
    args: {
        userId: v.id("users"),
        title: v.string(),
        message: v.string(),
        type: v.union(v.literal("info"), v.literal("warning"), v.literal("error"), v.literal("success")),
        url: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<string> => {
        const notificationId = await ctx.db.insert("notifications", {
            userId: args.userId,
            title: args.title,
            message: args.message,
            type: args.type,
            url: args.url,
            createdAt: Date.now(),
        });
        return notificationId;
    },
});

// Action wrapper that can be called from frontend (allows for side effects in the future)
export const createNotification = action({
    args: {
        userId: v.id("users"),
        title: v.string(),
        message: v.string(),
        type: v.union(v.literal("info"), v.literal("warning"), v.literal("error"), v.literal("success")),
        url: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<string> => {
        return await ctx.runMutation(api.notifications.create, {
            userId: args.userId,
            title: args.title,
            message: args.message,
            type: args.type,
            url: args.url,
        });
    },
});

export const getNotifications = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args): Promise<Notification[]> => {
        return await ctx.db.query("notifications").filter(q => q.eq(q.field("userId"), args.userId)).collect();
    },
});

export const markAsRead = mutation({
    args: {
        notificationId: v.id("notifications"),
    },
    handler: async (ctx, args): Promise<void> => {
        await ctx.db.patch(args.notificationId, {
            readAt: Date.now(),
        });
    },
});

export const deleteNotification = mutation({
    args: {
        notificationId: v.id("notifications"),
    },
    handler: async (ctx, args): Promise<void> => {
        await ctx.db.delete(args.notificationId);
    },
});
