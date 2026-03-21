import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { usernameClient } from "better-auth/client/plugins";
import { nextCookies } from "better-auth/next-js";
import { adminClient } from "better-auth/client/plugins";
export const authClient = createAuthClient({
  appName: "Smart Ngara",
  // biome-ignore lint/style/noNonNullAssertion: We need to assert that the environment variables are not null
  secret: process.env.BETTER_AUTH_SECRET!,
   // biome-ignore lint/style/noNonNullAssertion: We need to assert that the environment variables are not null
  baseURL: process.env.NEXT_PUBLIC_URL!,
  plugins: [adminClient(), usernameClient(), convexClient(), nextCookies()],
});
