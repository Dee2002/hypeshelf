/**
 * Convex User Functions – HypeShelf
 *
 * Handles user creation/sync from Clerk and role management.
 *
 * Privacy note: user email is stored for admin contact purposes only
 * and is NEVER returned to other users in public queries.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* ------------------------------------------------------------------ */
/*  Queries                                                            */
/* ------------------------------------------------------------------ */

/**
 * getCurrentUser – returns the user document for the currently
 * authenticated Clerk identity.  Returns `null` when:
 *   • the caller is not authenticated, OR
 *   • the Clerk user hasn't been synced to the `users` table yet.
 *
 * This is the primary entry-point the frontend uses to decide
 * what UI to render (role badges, admin controls, etc.).
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    return user;
  },
});

/* ------------------------------------------------------------------ */
/*  Mutations                                                          */
/* ------------------------------------------------------------------ */

/**
 * syncUser – called on every sign-in to upsert the user record.
 *
 * If the Clerk user already exists we update their name/email/image
 * (they may have changed in Clerk).  If they don't exist we create
 * them with role = "user".
 *
 * Security: only the authenticated user's own identity is used; the
 * `clerkId` comes from the verified JWT, not from user input.
 */
export const syncUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be signed in to sync user.");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) {
      // Update mutable profile fields; role is NEVER changed here.
      await ctx.db.patch(existing._id, {
        name: identity.name ?? "Anonymous",
        email: identity.email ?? "",
        imageUrl: identity.pictureUrl,
      });
      return existing._id;
    }

    // First-time user – default role is "user".
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      name: identity.name ?? "Anonymous",
      email: identity.email ?? "",
      imageUrl: identity.pictureUrl,
      role: "user",
    });

    return userId;
  },
});

/**
 * setUserRole – admin-only mutation to change a user's role.
 *
 * Security:
 *   • Caller must be authenticated.
 *   • Caller must have role "admin".
 *   • Target user must exist.
 *   • Prevents admins from demoting themselves (guard-rail).
 */
export const setUserRole = mutation({
  args: {
    targetClerkId: v.string(),
    newRole: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, { targetClerkId, newRole }) => {
    // --- Authentication check ---
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be signed in.");
    }

    // --- Authorization check ---
    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!caller || caller.role !== "admin") {
      throw new Error("Forbidden: only admins can change roles.");
    }

    // --- Prevent self-demotion ---
    if (targetClerkId === identity.subject && newRole !== "admin") {
      throw new Error("Forbidden: admins cannot demote themselves.");
    }

    // --- Target must exist ---
    const target = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", targetClerkId))
      .unique();

    if (!target) {
      throw new Error("Not found: target user does not exist.");
    }

    await ctx.db.patch(target._id, { role: newRole });
  },
});
