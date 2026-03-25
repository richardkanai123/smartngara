// transactions.ts : This file contains the Convex functions for managing transactions.
// TODO!! check the logic in this before using it
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import type { Doc } from "./_generated/dataModel";

// Mutation to create a transaction
export const createTransaction = mutation({
  args: {
    invoiceId: v.id("invoices"),
    referenceId: v.string(),
    paymentMethod: v.union(v.literal("cash"), v.literal("mpesa")),
    amount: v.number(),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("rejected"), v.literal("failed")),
  },
  handler: async (ctx, args): Promise<Doc<"transactions">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const invoice = await ctx.db.query("invoices").withIndex("by_id", (q) => q.eq("_id", args.invoiceId)).first();
    if (!invoice) throw new Error("Invoice not found");
    const isValidAmount = args.amount <= invoice.amountDue;
    if (!isValidAmount) throw new Error("Amount is greater than the amount due");

    const transaction = await ctx.db.insert("transactions", {
      invoiceId: args.invoiceId,
      referenceId: args.referenceId,
      paymentMethod: args.paymentMethod,
      amount: args.amount,
      status: args.status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      date: Date.now(),
    });

    const newDueAmount = invoice.amountDue - args.amount;
    if (newDueAmount === 0) {
      await ctx.db.patch(args.invoiceId, {
        status: "paid",
        updatedAt: Date.now(),
        amountDue: 0,
      });
    } else {
      await ctx.db.patch(args.invoiceId, {
        amountDue: newDueAmount,
        updatedAt: Date.now(),
      });
    }
    return transaction as unknown as Doc<"transactions">;
  },
});

// Get transaction by id\
export const getTransactionById = query({
  args: {
    id: v.id("transactions"),
  },
  handler: async (ctx, args): Promise<Doc<"transactions">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const transaction = await ctx.db.query("transactions").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!transaction) throw new Error("Transaction not found");
    return transaction as unknown as Doc<"transactions">;
  },
});

// Get all transactions
export const getAllTransactionsByInvoiceId = query({
  args: {
    invoiceId: v.id("invoices"),
  },
  handler: async (ctx, args): Promise<Doc<"transactions">[]> => {
    const transactions = await ctx.db.query("transactions").withIndex("by_invoiceId", (q) => q.eq("invoiceId", args.invoiceId)).collect();
    return transactions as unknown as Doc<"transactions">[];
  },
});

// Get all transactions
export const getAllTransactions = query({
  handler: async (ctx): Promise<Doc<"transactions">[]> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const transactions = await ctx.db.query("transactions").collect();
    return transactions as unknown as Doc<"transactions">[];
  },
});

// Update transaction status
export const updateTransactionStatus = mutation({
  args: {
    id: v.id("transactions"),
    status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("rejected"), v.literal("failed")),
  },
  handler: async (ctx, args): Promise<Doc<"transactions">> => {
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const transaction = await ctx.db.query("transactions").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!transaction) throw new Error("Transaction not found");
    await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
    return transaction as unknown as Doc<"transactions">;
  },
});

// Delete transaction
export const deleteTransaction = mutation({
  args: {
    id: v.id("transactions"),
  },
  handler: async (ctx, args): Promise<string> => { 
    const loggedInUserId = await authComponent.getAuthUser(ctx);
    if (!loggedInUserId) throw new Error("Not authenticated");
    const transaction = await ctx.db.query("transactions").withIndex("by_id", (q) => q.eq("_id", args.id)).first();
    if (!transaction) throw new Error("Transaction not found");
    await ctx.db.delete(args.id);
    return 'Transaction deleted successfully';
  },
});

