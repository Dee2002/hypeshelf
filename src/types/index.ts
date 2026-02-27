/**
 * Shared TypeScript Types – HypeShelf
 *
 * These types are consumed by both frontend components and utility
 * functions.  They mirror the Convex schema but are decoupled so the
 * frontend never imports directly from `convex/` in component files
 * (clean architecture boundary).
 *
 * Convex auto-generates its own types in `convex/_generated/`; these
 * types complement those for use in React components and tests.
 */

import type { Id } from "../../convex/_generated/dataModel";

/* ------------------------------------------------------------------ */
/*  Genre                                                              */
/* ------------------------------------------------------------------ */

/**
 * Union type of all supported genres.
 * Kept in sync with `convex/recommendations.ts → GENRES`.
 */
export type Genre =
  | "horror"
  | "action"
  | "comedy"
  | "drama"
  | "sci-fi"
  | "fantasy"
  | "romance"
  | "thriller"
  | "documentary"
  | "animation"
  | "other";

/** Human-readable labels for each genre (used in dropdowns & filters). */
export const GENRE_LABELS: Record<Genre, string> = {
  horror: "Horror",
  action: "Action",
  comedy: "Comedy",
  drama: "Drama",
  "sci-fi": "Sci-Fi",
  fantasy: "Fantasy",
  romance: "Romance",
  thriller: "Thriller",
  documentary: "Documentary",
  animation: "Animation",
  other: "Other",
};

/** List for iteration in UI components. */
export const GENRE_LIST: Genre[] = [
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
];

/* ------------------------------------------------------------------ */
/*  Recommendation                                                     */
/* ------------------------------------------------------------------ */

/** A recommendation as returned by public (unauthenticated) queries. */
export interface PublicRecommendation {
  _id: Id<"recommendations">;
  title: string;
  genre: Genre;
  link: string;
  blurb: string;
  authorName: string;
  isStaffPick: boolean;
  _creationTime: number;
}

/** A recommendation as returned by authenticated queries (includes owner). */
export interface AuthenticatedRecommendation extends PublicRecommendation {
  createdBy: string;
  deletedAt?: number;
}

/* ------------------------------------------------------------------ */
/*  User                                                               */
/* ------------------------------------------------------------------ */

export type UserRole = "admin" | "user";

export interface HypeShelfUser {
  _id: Id<"users">;
  clerkId: string;
  name: string;
  email: string;
  imageUrl?: string;
  role: UserRole;
}

/* ------------------------------------------------------------------ */
/*  Paginated Response                                                 */
/* ------------------------------------------------------------------ */

export interface PaginatedResponse<T> {
  page: T[];
  continueCursor: string;
  isDone: boolean;
}

/* ------------------------------------------------------------------ */
/*  Form                                                               */
/* ------------------------------------------------------------------ */

/** Shape of the "Add Recommendation" form values. */
export interface RecommendationFormValues {
  title: string;
  genre: Genre;
  link: string;
  blurb: string;
}
