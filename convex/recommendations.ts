/**
 * Convex Recommendation Functions – HypeShelf
 *
 * All queries and mutations for the `recommendations` table.
 *
 * Security & design principles applied throughout:
 *   1. Every mutation validates authentication via `ctx.auth`.
 *   2. Every mutation validates authorization (ownership / admin role).
 *   3. Input is validated in shape AND semantics (length, format, enum).
 *   4. Soft-delete is used to preserve audit trails (HIPAA-style).
 *   5. Public queries never expose `createdBy` (Clerk user-id) directly
 *      to unauthenticated callers – only the author's display name.
 *   6. Server-side pagination is used to limit payload size.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/**
 * Allowed genre values. Enforced on both frontend (dropdown) and
 * backend (validation). Kept in sync via the shared GENRES export.
 */
export const GENRES = [
  "horror",
  "action",
  "comedy",
  "drama",
  "sci-fi",
  "fantasy",
  "romance",
  "thriller",
  "documentary",
  "animation",
  "other",
] as const;

/** Maximum lengths for user-supplied text fields. */
const MAX_TITLE_LENGTH = 200;
const MAX_BLURB_LENGTH = 500;
const MAX_LINK_LENGTH = 2048;

/** Default page size for paginated queries. */
const DEFAULT_PAGE_SIZE = 20;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Validates that a URL string is a plausible HTTP(S) URL.
 * This is a server-side sanity check – the frontend also validates.
 */
function isValidUrl(url: string): boolean {
  if (url === "") return true; // link is optional
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Retrieves the authenticated user from the `users` table.
 * Throws if not authenticated or user record doesn't exist.
 */
async function getAuthenticatedUser(ctx: { auth: any; db: any }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized: you must be signed in.");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error(
      "Unauthorized: user record not found. Please sign in again."
    );
  }

  return { identity, user };
}

/* ------------------------------------------------------------------ */
/*  Queries                                                            */
/* ------------------------------------------------------------------ */

/**
 * listPublic – returns the most recent non-deleted recommendations.
 *
 * This is the ONLY query available to unauthenticated visitors.
 * It deliberately omits the `createdBy` field to avoid leaking
 * Clerk user-ids to the public (privacy-by-design).
 *
 * Supports optional genre filtering and cursor-based pagination.
 */
export const listPublic = query({
  args: {
    genre: v.optional(v.string()),
    paginationOpts: v.optional(
      v.object({
        cursor: v.optional(v.string()),
        numItems: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, { genre, paginationOpts }) => {
    const numItems = Math.min(
      paginationOpts?.numItems ?? DEFAULT_PAGE_SIZE,
      100 // Hard cap to prevent abuse
    );

    let baseQuery;

    if (genre && GENRES.includes(genre as (typeof GENRES)[number])) {
      baseQuery = ctx.db
        .query("recommendations")
        .withIndex("by_genre", (q: any) => q.eq("genre", genre));
    } else {
      // No index needed — Convex table scan is ordered by _creationTime.
      baseQuery = ctx.db.query("recommendations");
    }

    const results = await baseQuery
      .order("desc")
      .paginate({
        cursor: paginationOpts?.cursor ?? null,
        numItems,
      });

    // Filter out soft-deleted and strip `createdBy` for public consumption.
    const sanitized = results.page
      .filter((r: any) => !r.deletedAt)
      .map((r: any) => ({
        _id: r._id,
        title: r.title,
        genre: r.genre,
        link: r.link,
        blurb: r.blurb,
        authorName: r.authorName,
        isStaffPick: r.isStaffPick,
        _creationTime: r._creationTime,
      }));

    return {
      page: sanitized,
      continueCursor: results.continueCursor,
      isDone: results.isDone,
    };
  },
});

/**
 * listAuthenticated – full listing for signed-in users.
 *
 * Returns `createdBy` so the frontend can determine ownership and
 * render edit/delete controls.
 */
export const listAuthenticated = query({
  args: {
    genre: v.optional(v.string()),
    paginationOpts: v.optional(
      v.object({
        cursor: v.optional(v.string()),
        numItems: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, { genre, paginationOpts }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be signed in.");
    }

    const numItems = Math.min(
      paginationOpts?.numItems ?? DEFAULT_PAGE_SIZE,
      100
    );

    let baseQuery;

    if (genre && GENRES.includes(genre as (typeof GENRES)[number])) {
      baseQuery = ctx.db
        .query("recommendations")
        .withIndex("by_genre", (q: any) => q.eq("genre", genre));
    } else {
      // No index needed — Convex table scan is ordered by _creationTime.
      baseQuery = ctx.db.query("recommendations");
    }

    const results = await baseQuery
      .order("desc")
      .paginate({
        cursor: paginationOpts?.cursor ?? null,
        numItems,
      });

    const page = results.page.filter((r: any) => !r.deletedAt);

    return {
      page,
      continueCursor: results.continueCursor,
      isDone: results.isDone,
    };
  },
});

/**
 * listMyRecommendations – returns only the current user's recommendations.
 *
 * Used on the dashboard "My Recommendations" tab so users can manage
 * their own content. Includes soft-deleted items count for stats.
 */
export const listMyRecommendations = query({
  args: {
    genre: v.optional(v.string()),
    paginationOpts: v.optional(
      v.object({
        cursor: v.optional(v.string()),
        numItems: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, { genre, paginationOpts }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be signed in.");
    }

    const numItems = Math.min(
      paginationOpts?.numItems ?? DEFAULT_PAGE_SIZE,
      100
    );

    // Use the by_creator index to fetch only this user's recommendations.
    const results = await ctx.db
      .query("recommendations")
      .withIndex("by_creator", (q: any) => q.eq("createdBy", identity.subject))
      .order("desc")
      .paginate({
        cursor: paginationOpts?.cursor ?? null,
        numItems,
      });

    // Filter by genre client-side (secondary filter after index).
    let page = results.page.filter((r: any) => !r.deletedAt);
    if (genre && GENRES.includes(genre as (typeof GENRES)[number])) {
      page = page.filter((r: any) => r.genre === genre);
    }

    return {
      page,
      continueCursor: results.continueCursor,
      isDone: results.isDone,
    };
  },
});

/**
 * getMyStats – returns aggregate stats for the current user's recommendations.
 */
export const getMyStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: must be signed in.");
    }

    const allMine = await ctx.db
      .query("recommendations")
      .withIndex("by_creator", (q: any) => q.eq("createdBy", identity.subject))
      .collect();

    const active = allMine.filter((r: any) => !r.deletedAt);
    const staffPicks = active.filter((r: any) => r.isStaffPick);

    // Count genres for breakdown.
    const genreCounts: Record<string, number> = {};
    for (const rec of active) {
      genreCounts[rec.genre] = (genreCounts[rec.genre] || 0) + 1;
    }

    return {
      totalActive: active.length,
      totalDeleted: allMine.length - active.length,
      staffPickCount: staffPicks.length,
      genreCounts,
    };
  },
});

/* ------------------------------------------------------------------ */
/*  Mutations                                                          */
/* ------------------------------------------------------------------ */

/**
 * add – creates a new recommendation.
 *
 * Validation:
 *   • title: required, 1–200 chars
 *   • genre: must be a member of GENRES
 *   • link: optional; if provided, must be a valid HTTP(S) URL
 *   • blurb: required, 1–500 chars
 *
 * The `createdBy` and `authorName` fields come from the verified
 * Clerk identity, NOT from user input, preventing impersonation.
 */
export const add = mutation({
  args: {
    title: v.string(),
    genre: v.string(),
    link: v.string(),
    blurb: v.string(),
  },
  handler: async (ctx, { title, genre, link, blurb }) => {
    const { identity, user } = await getAuthenticatedUser(ctx);

    // --- Input validation ---
    const trimmedTitle = title.trim();
    const trimmedBlurb = blurb.trim();
    const trimmedLink = link.trim();

    if (trimmedTitle.length === 0 || trimmedTitle.length > MAX_TITLE_LENGTH) {
      throw new Error(
        `Validation error: title must be 1–${MAX_TITLE_LENGTH} characters.`
      );
    }

    if (!GENRES.includes(genre as (typeof GENRES)[number])) {
      throw new Error(
        `Validation error: genre must be one of: ${GENRES.join(", ")}.`
      );
    }

    if (trimmedLink.length > MAX_LINK_LENGTH) {
      throw new Error(
        `Validation error: link must not exceed ${MAX_LINK_LENGTH} characters.`
      );
    }

    if (trimmedLink && !isValidUrl(trimmedLink)) {
      throw new Error("Validation error: link must be a valid HTTP(S) URL.");
    }

    if (trimmedBlurb.length === 0 || trimmedBlurb.length > MAX_BLURB_LENGTH) {
      throw new Error(
        `Validation error: blurb must be 1–${MAX_BLURB_LENGTH} characters.`
      );
    }

    // --- Insert ---
    const id = await ctx.db.insert("recommendations", {
      title: trimmedTitle,
      genre,
      link: trimmedLink,
      blurb: trimmedBlurb,
      createdBy: identity.subject,
      authorName: user.name,
      isStaffPick: false,
      deletedAt: undefined,
    });

    return id;
  },
});

/**
 * remove – soft-deletes a recommendation.
 *
 * Authorization:
 *   • The owner can delete their own recommendation.
 *   • An admin can delete any recommendation.
 *   • All other callers are rejected.
 *
 * Soft-delete sets `deletedAt` to the current server timestamp,
 * preserving the record for audit/compliance (HIPAA-style).
 */
export const remove = mutation({
  args: {
    recommendationId: v.id("recommendations"),
  },
  handler: async (ctx, { recommendationId }) => {
    const { identity, user } = await getAuthenticatedUser(ctx);

    const rec = await ctx.db.get(recommendationId);

    if (!rec) {
      throw new Error("Not found: recommendation does not exist.");
    }

    if (rec.deletedAt) {
      throw new Error("Conflict: recommendation has already been deleted.");
    }

    // --- Authorization: owner or admin ---
    const isOwner = rec.createdBy === identity.subject;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error(
        "Forbidden: you can only delete your own recommendations."
      );
    }

    // Soft-delete
    await ctx.db.patch(recommendationId, {
      deletedAt: Date.now(),
    });
  },
});

/**
 * toggleStaffPick – admin-only mutation to mark/unmark a
 * recommendation as a "Staff Pick".
 *
 * Security: strictly admin-only.
 */
export const toggleStaffPick = mutation({
  args: {
    recommendationId: v.id("recommendations"),
  },
  handler: async (ctx, { recommendationId }) => {
    const { user } = await getAuthenticatedUser(ctx);

    if (user.role !== "admin") {
      throw new Error("Forbidden: only admins can set Staff Picks.");
    }

    const rec = await ctx.db.get(recommendationId);

    if (!rec) {
      throw new Error("Not found: recommendation does not exist.");
    }

    if (rec.deletedAt) {
      throw new Error("Conflict: cannot modify a deleted recommendation.");
    }

    await ctx.db.patch(recommendationId, {
      isStaffPick: !rec.isStaffPick,
    });
  },
});
