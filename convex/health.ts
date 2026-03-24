import { query } from "./_generated/server";
import { v } from "convex/values";

export const ping = query({
  args: {},
  returns: v.null(),
  handler: async () => {
    return null;
  },
});
