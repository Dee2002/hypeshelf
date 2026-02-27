/**
 * Dashboard Page – HypeShelf (Authenticated)
 *
 * The main view for signed-in users.  Provides:
 *   1. An "Add recommendation" button that opens the form modal.
 *   2. Genre filter bar.
 *   3. Full recommendation list with ownership-aware controls.
 *   4. Cursor-based "Load more" pagination.
 *
 * Uses `listAuthenticated` which returns `createdBy` so the
 * frontend can render delete buttons for the owner's items
 * and admin controls (Staff Pick, delete any).
 *
 * Access control (frontend layer):
 *   • If the user is not signed in, Clerk's middleware redirects
 *     them before this page renders.
 *   • The component also checks `currentUser` from Convex to
 *     determine the role (admin vs. user).
 *
 * Note: frontend access control is for UX only. All real
 * authorization happens server-side in Convex mutations.
 */
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Genre } from "@/types";
import GenreFilter from "@/components/GenreFilter";
import RecommendationCard from "@/components/RecommendationCard";
import AddRecommendationForm from "@/components/AddRecommendationForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";

export default function DashboardPage() {
  const [genre, setGenre] = useState<Genre | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Clerk user (for the Clerk userId used to check ownership).
  const { user: clerkUser } = useUser();

  // Convex user record (for role information).
  const currentUser = useQuery(api.users.getCurrentUser);

  // Authenticated recommendation list.
  const result = useQuery(api.recommendations.listAuthenticated, {
    genre: genre ?? undefined,
  });

  const isLoading = result === undefined || currentUser === undefined;

  // Derive role – defaults to "user" while loading for safety.
  const currentUserRole = currentUser?.role ?? "user";
  const currentUserId = clerkUser?.id ?? null;

  return (
    <>
      {/* ---- Page Header ---- */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse, add, and manage recommendations.
          </p>
          {/* Role badge – helps admins know they have elevated privileges */}
          {currentUser && currentUser.role === "admin" && (
            <span className="mt-2 inline-block rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
              Admin
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Add a new recommendation"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Recommendation
        </button>
      </div>

      {/* ---- Genre Filter ---- */}
      <section className="mb-8" aria-label="Filter by genre">
        <GenreFilter activeGenre={genre} onSelect={setGenre} />
      </section>

      {/* ---- Recommendations Grid ---- */}
      <section aria-label="Your recommendations">
        {isLoading && <LoadingSpinner />}

        {!isLoading && result !== undefined && result.page.length === 0 && (
          <EmptyState
            message={
              genre
                ? "No recommendations found for this genre."
                : "No recommendations yet. Add the first one!"
            }
          />
        )}

        {!isLoading && result !== undefined && result.page.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.page.map((rec: any) => (
                <RecommendationCard
                  key={rec._id}
                  recommendation={rec}
                  currentUserId={currentUserId}
                  currentUserRole={currentUserRole}
                />
              ))}
            </div>

            {/* ---- Load More ---- */}
            {!result.isDone && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  Scroll down for more recommendations.
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* ---- Add Recommendation Modal ---- */}
      <AddRecommendationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </>
  );
}
