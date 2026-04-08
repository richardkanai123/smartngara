// clients.ts : This file contains the Convex functions for managing clients.
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import type { Doc } from "./_generated/dataModel";


// Query to get a client by id
export const getClientById = query({
  args: {
    id: v.id("clients"),
  },
  handler: async (ctx, args): Promise<Doc<"clients">> => {
    const client = await ctx.db.query("clients").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!client) throw new Error("Client not found");
    return client;
  },
});

// Query to get all clients
export const getAllClients = query({
  handler: async (ctx): Promise<Doc<"clients">[]> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const clients = await ctx.db.query("clients").collect();
    return clients;
  },
});

// Query to get all clients by user id 
export const getAllClientsByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"clients">[]> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const clients = await ctx.db.query("clients").withIndex("by_userId", (q) => q.eq("userId", args.userId)).collect();
    return clients;
  },
});

// delete client
export const deleteClient = mutation({
  args: {
    id: v.id("clients"),
  },
  handler: async (ctx, args): Promise<{ success: boolean, message: string }> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    // check if admin is deleting the client
    const admin = await ctx.db.query("userRoles").filter((q) => q.eq("userId", loggedInUserId.userId )).first();
    if (!admin || admin.role !== "admin") throw new Error("Not authorized");
    const client = await ctx.db.query("clients").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!client) throw new Error("Client not found");
    await ctx.db.delete(args.id);
    return { success: true, message: "Client deleted successfully" };
  },
});

// update client
export const updateClient = mutation({
  args: {
    id: v.id("clients"),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean, message: string }> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const client = await ctx.db.query("clients").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!client) throw new Error("Client not found");
    const newClientDetails = {
      name: args.name || client.name,
      email: args.email || client.email,
      phone: args.phone || client.phone,
      address: args.address || client.address,
      updatedAt: Date.now(),
    };
     await ctx.db.patch(args.id, newClientDetails);
    
    return { success: true, message: `Client ${args.name} updated successfully` };
  },
});


// add walk in client
export const addWalkInClient = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean, message: string }> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const newClient = {
      name: args.name,
      email: args.email,
      phone: args.phone,
      address: args.address,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isWalkIn: true,
    };
    await ctx.db.insert("clients", newClient);
    return { success: true, message: `Walk in client ${args.name} added successfully` };
  },
});