// lib/auth-server.ts
/** biome-ignore-all lint/style/noNonNullAssertion: We need to assert that the environment variables are not null */
import { cache } from "react";
import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

const convexBetterAuth = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});

export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken: getTokenUncached,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuth;

export const getToken = cache(getTokenUncached);