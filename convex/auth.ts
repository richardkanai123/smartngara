import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

const siteUrl = process.env.BETTER_AUTH_URL!;
const secret = process.env.BETTER_AUTH_SECRET!;
// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const auth = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    appName: "Smart NGARA",
    baseURL: siteUrl,
    secret: secret,
    database: auth.adapter(ctx),
    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      // The Convex plugin is required for Convex compatibility
      convex({ authConfig }),
    ],
  })
}

export const options = createAuth({} as GenericCtx<DataModel>);

// Example function for getting the current user
// Feel free to edit, omit, etc.

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity;
  },
});

export const getCurrentUserData = query({
  args: {},
  handler: async (ctx) => {
    return auth.getAuthUser(ctx);
  },
});