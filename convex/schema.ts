import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Notifications Table
 * Stores user notifications with read status
 */
export const notifications = defineTable({
    userId: v.id("user"),
    title: v.string(),
    message: v.string(),
    createdAt: v.number(),
    readAt: v.optional(v.number()),
    type: v.union(v.literal("info"), v.literal("warning"), v.literal("error"), v.literal("success")),
    url: v.optional(v.string()),
})
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "readAt"]);

/**
 * User Roles Table
 * Stores roles separately from Better Auth user table
 */
export const userRoles = defineTable({
    userId: v.id("user"),
    role: v.union(v.literal("admin"), v.literal("client"), v.literal("courier")),
    createdBy: v.optional(v.id("user")),
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
    role: v.union(v.literal("client"), v.literal("courier")),
    invitedBy: v.id("user"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired"), v.literal("revoked")),
    acceptedAt: v.optional(v.number()),
    userId: v.optional(v.id("user")),
})
    .index("by_token", ["token"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]);

/**
 * Main Schema
 * Combines all tables - user table comes from betterAuth component
 */
export default defineSchema({
    notifications,
    userRoles,
    invites,
});
