import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";
import { username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
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
    rateLimit:{
      enabled: true,
      max: 100,
    },
    database: auth.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      autoSignIn: true,
    },
    plugins: [
      username(),
      convex({ authConfig }),
      nextCookies(),
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

export const getSession = query({
  args: {},
  handler: async () => {
    return auth.clientApi();
  },
});