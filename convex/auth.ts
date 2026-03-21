import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";
import type { DataModel } from "./_generated/dataModel";
import { username } from "better-auth/plugins";
import { query } from "./_generated/server";
import { v } from "convex/values";

// biome-ignore lint/style/noNonNullAssertion: We need to assert that the environment variables are not null
const siteUrl = process.env.NEXT_PUBLIC_URL!;
// biome-ignore lint/style/noNonNullAssertion: We need to assert that the environment variables are not null
const secret = process.env.BETTER_AUTH_SECRET!;
// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    appName: "Smart Ngara",
    secret,
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      username(),
      // Admin plugin removed - using custom admin implementation
      convex({ authConfig }),
    ],
  });
};

export const auth = createAuth;

type Session = ReturnType<typeof createAuth>;
type User = Awaited<ReturnType<typeof authComponent.getAuthUser>>;
export type { Session, User };

export const getCurrentUser = query({
  args: {},
  handler: async (ctx: GenericCtx<DataModel>) => {
    return await authComponent.getAuthUser(ctx);
  },
});

export const getCurrentUserWithRole = query({
  args: {},
  handler: async (ctx: GenericCtx<DataModel>) => {
    return await authComponent.getAuthUser(ctx);
  },
});

export const getUserDetailsById = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    return await authComponent.getAnyUserById(ctx, args.id);
  },
});
