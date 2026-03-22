// notifications.ts : This file contains the Convex functions for managing notifications.
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { authComponent } from "./auth";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";

// Mutation to create a notification (used internally and by the action)
export const create = mutation({
    args: {
        userId: v.id("user"),
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
        userId: v.id("user"),
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
    args: {},
    handler: async (ctx): Promise<Doc<"notifications">[]> => {
        const user = await authComponent.getAuthUser(ctx);
        if (!user) throw new Error("Unauthorized");
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();
        return notifications;
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
