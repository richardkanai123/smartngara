import { v, type GenericId } from "convex/values";
import { mutation, query, action, internalMutation, internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { authComponent } from "./auth";
import type { Id } from "./_generated/dataModel";
import type { DataModel } from "./_generated/dataModel";
import type { GenericQueryCtx, GenericMutationCtx } from "convex/server";

// Better Auth provides the "user" table via component
// Use GenericId for component tables, Id for schema tables
type UserId = GenericId<"user">;

/**
 * Helper: Require admin authentication
 * Returns authenticated admin user or throws error
 */
async function requireAdmin(ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>): Promise<{ _id: UserId }> {
  const user = await authComponent.getAuthUser(ctx);
  if (!user) throw new Error("Not authenticated");

  const role = await ctx.db
    .query("userRoles")
    .withIndex("by_userId", (q) => q.eq("userId", user._id as UserId))
    .first();

  if (role?.role !== "admin") {
    throw new Error("Only admins can perform this action");
  }

  return user as { _id: UserId };
}

/**
 * Get current user's role
 */
export const getMyRole = query({
  args: {},
  handler: async (ctx) => {
    try {
      const user = await authComponent.getAuthUser(ctx);
      if (!user) return null;

      const role = await ctx.db
        .query("userRoles")
        .filter((q) => q.eq(q.field("userId"), user._id))
        .first();

      return role?.role || null;
    } catch {
      return null;
    }
  },
});

/**
 * Check if current user is admin
 */
export const amIAdmin = query({
  args: {},
  handler: async (ctx) => {
    try {
      await requireAdmin(ctx);
      return true;
    } catch {
      return false;
    }
  },
});

/**
 * Get user role by userId
 */
export const getUserRole = query({
  args: { userId: v.id("user") },
  handler: async (ctx, args) => {
    const role = await ctx.db
      .query("userRoles")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    return role?.role || null;
  },
});

/**
 * Internal: Assign role to user (used for first admin setup)
 */
export const assignRole = internalMutation({
  args: {
    userId: v.id("user"),
    role: v.union(v.literal("admin"), v.literal("client"), v.literal("courier")),
    createdBy: v.optional(v.id("user")),
  },
  handler: async (ctx, args) => {
    // Check if role already exists
    const existing = await ctx.db
      .query("userRoles")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      // Update existing role
      await ctx.db.patch(existing._id, {
        role: args.role,
      });
      return existing._id;
    }

    // Create new role
    return await ctx.db.insert("userRoles", {
      userId: args.userId,
      role: args.role,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });
  },
});


/**
 * Internal Action: Send invitation email
 * Links to /register?token= instead of /invite/setup
 */
export const sendInviteEmail = internalAction({
  args: {
    email: v.string(),
    token: v.string(),
    role: v.string(),
  },
  handler: async (_ctx, args) => {
    const siteUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const registerUrl = `${siteUrl}/register?token=${args.token}`;

    console.log("=".repeat(60));
    console.log("📧 INVITATION EMAIL");
    console.log("=".repeat(60));
    console.log(`To: ${args.email}`);
    console.log(`Subject: You've been invited to SmartNgara`);
    console.log("-".repeat(60));
    console.log(`Hello,`);
    console.log();
    console.log(`You've been invited to join SmartNgara as a ${args.role}.`);
    console.log();
    console.log(`Click the link below to complete your registration:`);
    console.log(`  🌐 ${registerUrl}`);
    console.log();
    console.log("You'll be asked to create your username and password.");
    console.log("This invitation expires in 7 days.");
    console.log();
    console.log("Best regards,");
    console.log("SmartNgara Team");
    console.log("=".repeat(60));
  },
});


/**
 * Admin: Create new user invitation
 * SIMPLIFIED: Just creates invite, user registers themselves via /register?token=
 */
export const adminCreateUser = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("client"), v.literal("courier")),
  },
  handler: async (ctx, args) => {
    // 1. Verify caller is admin
    const admin = await requireAdmin(ctx);
    // 2. Check if email already has pending invite
    const existingInvite = await ctx.db
      .query("invites")
      .filter((q) => q.eq(q.field("email"), args.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingInvite) {
      throw new Error("An active invitation already exists for this email");
    }

    // 3. Check if user already exists with this email
    // Note: "user" table comes from Better Auth component
    const existingUser = await (ctx.db.query as any)("user")
      .filter((q: any) => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    // 4. Generate invite token
    const token = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    // 5. Create invite record (no tempPassword needed!)
    const inviteId = await ctx.db.insert("invites", {
      email: args.email,
      role: args.role,
      invitedBy: admin._id,
      token,
      expiresAt,
      createdAt: Date.now(),
      status: "pending",
    });

    // 6. Log invitation email (replace with Resend when ready)
    const siteUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const registerUrl = `${siteUrl}/register?token=${token}`;

    console.log("=".repeat(60));
    console.log("📧 INVITATION EMAIL");
    console.log("=".repeat(60));
    console.log(`To: ${args.email}`);
    console.log(`Subject: You've been invited to SmartNgara`);
    console.log("-".repeat(60));
    console.log(`Hello,`);
    console.log();
    console.log(`You've been invited to join SmartNgara as a ${args.role}.`);
    console.log();
    console.log(`Click the link below to complete your registration:`);
    console.log(`  🌐 ${registerUrl}`);
    console.log();
    console.log("You'll be asked to create your username and password.");
    console.log("This invitation expires in 7 days.");
    console.log();
    console.log("Best regards,");
    console.log("SmartNgara Team");
    console.log("=".repeat(60));

    return {
      inviteId,
      email: args.email,
      role: args.role,
    };
  },
});


/**
 * Query: Validate invite token for registration page
 * Returns invite details if valid, null if invalid/expired
 */
export const validateInviteToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("invites")
      .filter((q) => q.eq(q.field("token"), args.token))
      .first();

    if (!invite) return null;
    if (invite.status !== "pending") return null;
    if (Date.now() > invite.expiresAt) return null;

    return {
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
    };
  },
});

/**
 * Internal: Check if a user exists by email
 */
export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Note: "user" table comes from Better Auth component
    return await (ctx.db.query as any)("user")
      .filter((q: any) => q.eq(q.field("email"), args.email))
      .first();
  },
});

/**
 * Action: Complete registration with user-provided details
 * Called from /register page after user fills in their info
 * Uses action because we need to call Better Auth API
 */
export const completeRegistration = action({
  args: {
    token: v.string(),
    username: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: true; email: string; role: string; userId: UserId }> => {
    // 1. Validate invite
    const invite = await ctx.runQuery(internal.userRoles.getInviteByTokenInternal, {
      token: args.token,
    });

    if (!invite) throw new Error("Invalid or expired invitation token");

    // 2. Check if user already exists
    const existingUser = await ctx.runQuery(internal.userRoles.getUserByEmail, {
      email: invite.email,
    });

    if (existingUser) {
      throw new Error("An account with this email already exists");
    }

    const user = await ctx.runQuery(internal.userRoles.getUserByEmail, {
      email: invite.email,
    });

    if (!user) {
      throw new Error("Account created but user not found");
    }

    await ctx.runMutation(internal.userRoles.assignRoleInternal, {
      userId: user._id as unknown as UserId,
      role: invite.role,
      invitedBy: invite.invitedBy as unknown as UserId,
    });

    await ctx.runMutation(internal.userRoles.acceptInviteInternal, {
      inviteId: invite._id as Id<"invites">,
      userId: user._id as unknown as UserId,
    });

    return { 
      success: true, 
      email: invite.email, 
      role: invite.role,
      userId: user._id as unknown as UserId,
    };
  },
});


export const finalizeInviteRegistration = mutation({
  args: {
    token: v.string(),
    email: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("invites")
      .filter((q) => q.eq(q.field("token"), args.token))
      .first();

    if (!invite) throw new Error("Invalid invitation token");
    if (invite.status !== "pending") throw new Error("Invitation already used");
    if (Date.now() > invite.expiresAt) throw new Error("Invitation expired");
    if (invite.email !== args.email) throw new Error("Email mismatch");

    const user = await authComponent.getAnyUserById(ctx, args.userId);
    if (!user) throw new Error("User account not found — sign-up may not have completed");
    if (user.email !== args.email) throw new Error("User email does not match invitation");

    const typedUserId = user._id as UserId;

    const existingRole = await ctx.db
      .query("userRoles")
      .filter((q) => q.eq(q.field("userId"), typedUserId))
      .first();

    if (!existingRole) {
      await ctx.db.insert("userRoles", {
        userId: typedUserId,
        role: invite.role,
        createdBy: invite.invitedBy,
        createdAt: Date.now(),
      });
    }

    // update invite status to accepted
    await ctx.db.patch(invite._id, {
      status: "accepted",
      acceptedAt: Date.now(),
      userId: typedUserId,
    });

    // add client to clients table
    await ctx.db.insert("clients", {
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: "",
      address: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, email: invite.email, role: invite.role };
  },
});

/**
 * Internal query: Get invite by token (for action use)
 */
export const getInviteByTokenInternal = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("invites")
      .filter((q) => q.eq(q.field("token"), args.token))
      .first();

    if (!invite) return null;
    if (invite.status !== "pending") return null;
    if (Date.now() > invite.expiresAt) return null;

    return {
      _id: invite._id,
      email: invite.email,
      role: invite.role,
      invitedBy: invite.invitedBy,
    };
  },
});

/**
 * Internal mutation: Assign role
 */
export const assignRoleInternal = internalMutation({
  args: {
    userId: v.id("user"),
    role: v.union(v.literal("client"), v.literal("courier")),
    invitedBy: v.id("user"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("userRoles", {
      userId: args.userId,
      role: args.role,
      createdBy: args.invitedBy,
      createdAt: Date.now(),
    });
  },
});

/**
 * Internal mutation: Accept invite
 */
export const acceptInviteInternal = internalMutation({
  args: {
    inviteId: v.id("invites"),
    userId: v.id("user"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.inviteId, {
      status: "accepted",
      acceptedAt: Date.now(),
      userId: args.userId,
    });
  },
});

/**
 * Internal Action: Create user in Better Auth (server-side API call)
 * Called from completeRegistration mutation
 */
export const createAuthUser = internalAction({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    username: v.string(),
  },
  handler: async (_ctx, args) => {
    const siteUrl = process.env.NEXT_PUBLIC_URL;

    if (!siteUrl) {
      throw new Error("NEXT_PUBLIC_URL not configured");
    }

    const response = await fetch(`${siteUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: args.email,
        password: args.password,
        name: args.name,
        username: args.username,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create auth user: ${error}`);
    }

    const data = await response.json();
    return { userId: data.user?.id, email: data.user?.email };
  },
});

/**
 * Admin: Revoke pending invitation
 */
export const revokeInvite = mutation({
  args: {
    inviteId: v.id("invites"),
  },
  handler: async (ctx, args) => {
    // 1. Verify caller is admin
    await requireAdmin(ctx);

    // 2. Get the invite
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) throw new Error("Invite not found");
    if (invite.status !== "pending") throw new Error("Can only revoke pending invites");

    // 3. Mark as revoked
    await ctx.db.patch(args.inviteId, {
      status: "revoked",
    });

    return { success: true };
  },
});

/**
 * Admin: Update user role
 */
export const updateUserRole = mutation({
  args: {
    userId: v.id("user"),
    newRole: v.union(v.literal("admin"), v.literal("client"), v.literal("courier")),
  },
  handler: async (ctx, args) => {
    // 1. Verify caller is admin
    const admin = await requireAdmin(ctx);

    // 2. Prevent self-demotion from admin
    if (admin._id === args.userId && args.newRole !== "admin") {
      throw new Error("Cannot remove your own admin role");
    }

    // 3. Find existing role
    const existing = await ctx.db
      .query("userRoles")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      // Update existing role
      await ctx.db.patch(existing._id, {
        role: args.newRole,
      });
      return { updated: true, role: args.newRole };
    }

    // Create new role if none exists
    await ctx.db.insert("userRoles", {
      userId: args.userId,
      role: args.newRole,
      createdBy: admin._id,
      createdAt: Date.now(),
    });

    return { updated: true, role: args.newRole };
  },
});

/**
 * Query: List all invites (for admin dashboard)
 */
export const listInvites = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired"), v.literal("revoked"))),
  },
  handler: async (ctx, args) => {
    // Verify admin
    await requireAdmin(ctx);

    let invitesList: Array<{ _id: Id<"invites">; email: string; role: "client" | "courier"; status: string; createdAt: number; expiresAt: number; acceptedAt?: number }>;
    if (args.status) {
      invitesList = await ctx.db
        .query("invites")
        .filter((q) => q.eq(q.field("status"), args.status))
        .take(100);
    } else {
      invitesList = await ctx.db.query("invites").order("desc").take(100);
    }

    return invitesList.map((invite) => ({
      _id: invite._id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      createdAt: invite.createdAt,
      expiresAt: invite.expiresAt,
      acceptedAt: invite.acceptedAt,
    }));
  },
});

/**
 * Query: List users with roles (for admin dashboard)
 */
export const listUsersWithRoles = query({
  args: {},
  handler: async (ctx) => {
    // Verify admin
    await requireAdmin(ctx);

    // Get all user roles
    const roles = await ctx.db.query("userRoles").take(100);

    return roles.map((role) => ({
      userId: role.userId,
      role: role.role,
      createdAt: role.createdAt,
    }));
  },
});

/**
 * Helper: Generate secure token
 */
function generateToken(): string {
  // Generate a random UUID-like string
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


export const getUserRoleByUserId = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {

    const role = await ctx.db.query('userRoles').filter(q => q.eq(q.field('userId'), args.id)).first();
    if (!role) {
      throw new Error("Role not found");
    }
    return role;
  },
});