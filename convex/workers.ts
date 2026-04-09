import { query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import type { Doc } from "./_generated/dataModel";

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