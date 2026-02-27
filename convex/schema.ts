/**
 * Convex Database Schema – HypeShelf
 *
 * Privacy note (HIPAA-style):
 *   • Every document carries `createdBy` (Clerk user-id) so ownership
 *     can be verified on every mutation without exposing the internal
 *     Convex `_id` of the user document.
 *   • `deletedAt` enables soft-delete so audit trails are preserved.
 *   • Indexes are defined for every query path to avoid full-table scans
 *     and to limit the data surface returned to clients.
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  /**
   * recommendations – the core entity.
   *
   * Fields:
   *   title     – display title (required, 1-200 chars enforced in mutations)
   *   genre     – controlled vocabulary; validated in mutations
   *   link      – optional URL (validated format)
   *   blurb     – short user-written description (max 500 chars)
   *   createdBy – Clerk `userId` of the author (NOT the Convex _id)
   *   authorName – denormalized display name for fast reads
   *   isStaffPick – admin-only flag
   *   deletedAt – soft-delete timestamp (null while active)
   */
  recommendations: defineTable({
    title: v.string(),
    genre: v.string(),
    link: v.string(),
    blurb: v.string(),
    createdBy: v.string(),
    authorName: v.string(),
    isStaffPick: v.boolean(),
    deletedAt: v.optional(v.number()),
  })
    // Filter by genre (Convex auto-appends _creationTime for ordering).
    // For "all recommendations" queries we scan the table directly
    // (no index needed — Convex supports .order("desc") on the table).
    .index("by_genre", ["genre"])
    // Filter by owner (for "my recommendations")
    .index("by_creator", ["createdBy"])
    // Soft-delete filter
    .index("by_deletedAt", ["deletedAt"]),

  /**
   * users – synced from Clerk via webhook or on first sign-in.
   *
   * `clerkId` is the stable external identifier; `role` controls RBAC.
   * Storing minimal PII – only what's needed for display/auth.
   */
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("user")),
  }).index("by_clerkId", ["clerkId"]),
});
