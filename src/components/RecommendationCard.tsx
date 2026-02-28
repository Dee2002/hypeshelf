/**
 * RecommendationCard – displays a single recommendation in a grid.
 *
 * Clicking the card opens a detail modal (via `onSelect` callback).
 * Action buttons (delete, staff pick) stop propagation so they
 * don't trigger the card click.
 */
"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { Genre, PublicRecommendation, UserRole } from "@/types";
import { genreColor, timeAgo } from "@/lib/utils";
import { GENRE_LABELS } from "@/types";
import { useState } from "react";

interface RecommendationCardProps {
  recommendation: PublicRecommendation & {
    createdBy?: string;
  };
  currentUserId: string | null;
  currentUserRole: UserRole | null;
  /** Called when the card is clicked — parent opens the detail modal. */
  onSelect?: (rec: PublicRecommendation & { createdBy?: string }) => void;
}

export default function RecommendationCard({
  recommendation,
  currentUserId,
  currentUserRole,
  onSelect,
}: RecommendationCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingPick, setIsTogglingPick] = useState(false);

  const removeRec = useMutation(api.recommendations.remove);
  const togglePick = useMutation(api.recommendations.toggleStaffPick);

  const isOwner =
    currentUserId !== null &&
    recommendation.createdBy === currentUserId;
  const isAdmin = currentUserRole === "admin";
  const canDelete = isOwner || isAdmin;
  const canTogglePick = isAdmin;

  function handleCardClick() {
    onSelect?.(recommendation);
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (isDeleting) return;

    const confirmed = window.confirm(
      `Delete "${recommendation.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await removeRec({
        recommendationId: recommendation._id as Id<"recommendations">,
      });
    } catch (err: any) {
      console.error("[RecommendationCard] Delete failed:", err.message);
      alert("Failed to delete. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleTogglePick(e: React.MouseEvent) {
    e.stopPropagation();
    if (isTogglingPick) return;
    setIsTogglingPick(true);
    try {
      await togglePick({
        recommendationId: recommendation._id as Id<"recommendations">,
      });
    } catch (err: any) {
      console.error("[RecommendationCard] Toggle pick failed:", err.message);
      alert("Failed to update Staff Pick. Please try again.");
    } finally {
      setIsTogglingPick(false);
    }
  }

  return (
    <article
      onClick={handleCardClick}
      className="group relative cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
      aria-label={`Recommendation: ${recommendation.title}`}
    >
      {/* ---- Staff Pick badge ---- */}
      {recommendation.isStaffPick && (
        <span className="absolute -top-2 -right-2 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-amber-900 shadow-sm">
          Staff Pick
        </span>
      )}

      {/* ---- Genre badge ---- */}
      <span
        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${genreColor(recommendation.genre as Genre)}`}
      >
        {GENRE_LABELS[recommendation.genre as Genre] ?? recommendation.genre}
      </span>

      {/* ---- Title ---- */}
      <h3 className="mt-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
        {recommendation.title}
      </h3>

      {/* ---- Blurb (truncated) ---- */}
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-600">
        {recommendation.blurb}
      </p>

      {/* ---- Footer: author + timestamp ---- */}
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
        <span>by {recommendation.authorName}</span>
        <time dateTime={new Date(recommendation._creationTime).toISOString()}>
          {timeAgo(recommendation._creationTime)}
        </time>
      </div>

      {/* ---- Action buttons (authenticated only) ---- */}
      {(canDelete || canTogglePick) && (
        <div className="mt-3 flex items-center gap-2">
          {canTogglePick && (
            <button
              type="button"
              onClick={handleTogglePick}
              disabled={isTogglingPick}
              aria-label={
                recommendation.isStaffPick
                  ? `Remove Staff Pick from ${recommendation.title}`
                  : `Mark ${recommendation.title} as Staff Pick`
              }
              className="rounded-lg border border-amber-300 px-3 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-50"
            >
              {isTogglingPick
                ? "Updating..."
                : recommendation.isStaffPick
                  ? "Remove Pick"
                  : "Staff Pick"}
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label={`Delete recommendation: ${recommendation.title}`}
              className="rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
