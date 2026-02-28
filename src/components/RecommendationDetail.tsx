/**
 * RecommendationDetail – modal that shows the full details of a
 * recommendation when a card is clicked.
 *
 * Displays: title, genre badge, full blurb, author, date, staff pick
 * status, and a button to visit the external link (if any).
 * Also shows delete / staff-pick controls for owners and admins.
 */
"use client";

import { useRef, useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { Genre, PublicRecommendation, UserRole } from "@/types";
import { genreColor, timeAgo } from "@/lib/utils";
import { GENRE_LABELS } from "@/types";

interface RecommendationDetailProps {
  recommendation:
    | (PublicRecommendation & { createdBy?: string })
    | null;
  onClose: () => void;
  currentUserId: string | null;
  currentUserRole: UserRole | null;
}

export default function RecommendationDetail({
  recommendation,
  onClose,
  currentUserId,
  currentUserRole,
}: RecommendationDetailProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingPick, setIsTogglingPick] = useState(false);

  const removeRec = useMutation(api.recommendations.remove);
  const togglePick = useMutation(api.recommendations.toggleStaffPick);

  const isOpen = recommendation !== null;

  // Sync dialog with prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Close on escape / backdrop click.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleClose() {
      onClose();
    }
    function handleClick(e: MouseEvent) {
      if (e.target === dialog) onClose();
    }

    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("click", handleClick);
    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleClick);
    };
  }, [onClose]);

  if (!isOpen) return null;

  const rec = recommendation;
  const isOwner =
    currentUserId !== null && rec.createdBy === currentUserId;
  const isAdmin = currentUserRole === "admin";
  const canDelete = isOwner || isAdmin;
  const canTogglePick = isAdmin;
  const hasLink = Boolean(rec.link);

  async function handleDelete() {
    if (isDeleting) return;
    const confirmed = window.confirm(
      `Delete "${rec.title}"? This cannot be undone.`
    );
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      await removeRec({
        recommendationId: rec._id as Id<"recommendations">,
      });
      onClose();
    } catch (err: any) {
      alert("Failed to delete. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleTogglePick() {
    if (isTogglingPick) return;
    setIsTogglingPick(true);
    try {
      await togglePick({
        recommendationId: rec._id as Id<"recommendations">,
      });
    } catch (err: any) {
      alert("Failed to update Staff Pick. Please try again.");
    } finally {
      setIsTogglingPick(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto h-fit w-full max-w-lg rounded-2xl border-0 p-0 shadow-xl backdrop:bg-black/50"
      aria-label={`Details for ${rec.title}`}
    >
      <div className="p-6">
        {/* ---- Header row ---- */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex-1">
            {/* Genre badge */}
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${genreColor(rec.genre as Genre)}`}
            >
              {GENRE_LABELS[rec.genre as Genre] ?? rec.genre}
            </span>

            {/* Staff pick badge */}
            {rec.isStaffPick && (
              <span className="ml-2 inline-block rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                Staff Pick
              </span>
            )}

            {/* Title */}
            <h2 className="mt-2 text-xl font-bold text-gray-900">
              {rec.title}
            </h2>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close details"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ---- Blurb ---- */}
        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
          {rec.blurb}
        </p>

        {/* ---- Meta ---- */}
        <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
          <span>by {rec.authorName}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={new Date(rec._creationTime).toISOString()}>
            {timeAgo(rec._creationTime)}
          </time>
        </div>

        {/* ---- External link button ---- */}
        {hasLink && (
          <a
            href={rec.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Visit Link
          </a>
        )}

        {/* ---- Admin / owner actions ---- */}
        {(canDelete || canTogglePick) && (
          <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
            {canTogglePick && (
              <button
                type="button"
                onClick={handleTogglePick}
                disabled={isTogglingPick}
                className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-50"
              >
                {isTogglingPick
                  ? "Updating..."
                  : rec.isStaffPick
                    ? "Remove Staff Pick"
                    : "Mark as Staff Pick"}
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        )}
      </div>
    </dialog>
  );
}
