/**
 * Utility helpers – HypeShelf
 *
 * Pure functions used across the application.  No side-effects,
 * no external dependencies – easy to test.
 */

import type { Genre } from "@/types";

/**
 * Formats a Unix timestamp (ms) into a human-readable relative string.
 * Examples: "just now", "3 minutes ago", "2 days ago".
 */
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  const d = Math.floor(seconds / 86400);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

/**
 * Returns a Tailwind color class for a given genre.
 * Used to visually distinguish genres in the UI.
 */
export function genreColor(genre: Genre): string {
  const colors: Record<Genre, string> = {
    horror: "bg-red-100 text-red-800",
    action: "bg-orange-100 text-orange-800",
    comedy: "bg-yellow-100 text-yellow-800",
    drama: "bg-purple-100 text-purple-800",
    "sci-fi": "bg-cyan-100 text-cyan-800",
    fantasy: "bg-indigo-100 text-indigo-800",
    romance: "bg-pink-100 text-pink-800",
    thriller: "bg-gray-100 text-gray-800",
    documentary: "bg-green-100 text-green-800",
    animation: "bg-blue-100 text-blue-800",
    other: "bg-slate-100 text-slate-800",
  };

  return colors[genre] ?? "bg-slate-100 text-slate-800";
}

/**
 * Basic URL validation for the frontend form.
 * Mirrors the server-side check in `convex/recommendations.ts`.
 */
export function isValidUrl(url: string): boolean {
  if (url === "") return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
