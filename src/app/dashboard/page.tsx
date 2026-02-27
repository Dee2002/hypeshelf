/**
 * Dashboard Page – HypeShelf (Authenticated)
 *
 * Personal management hub for signed-in users. Distinct from the
 * public home page (discovery feed).
 *
 * Layout:
 *   1. Welcome header with add button.
 *   2. Stats cards (loaded independently — shows "–" while loading).
 *   3. Tabs: "My Recommendations" / "All Recommendations".
 *   4. Genre filter + grid.
 *
 * Loading strategy: page structure (header, stats placeholders, tabs,
 * genre filter) renders immediately. Only the recommendation grid
 * shows a spinner while its data loads. This prevents the
 * blank-page-with-infinite-spinner problem.
 */
"use client";

import { useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import type { Genre } from "@/types";
import { GENRE_LABELS } from "@/types";
import GenreFilter from "@/components/GenreFilter";
import RecommendationCard from "@/components/RecommendationCard";
import AddRecommendationForm from "@/components/AddRecommendationForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

type Tab = "mine" | "all";

export default function DashboardPage() {
  const [genre, setGenre] = useState<Genre | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("mine");

  const { isAuthenticated } = useConvexAuth();
  const { user: clerkUser } = useUser();

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );

  const myStats = useQuery(
    api.recommendations.getMyStats,
    isAuthenticated ? {} : "skip"
  );

  const myRecs = useQuery(
    api.recommendations.listMyRecommendations,
    isAuthenticated && activeTab === "mine"
      ? { genre: genre ?? undefined }
      : "skip"
  );

  const allRecs = useQuery(
    api.recommendations.listAuthenticated,
    isAuthenticated && activeTab === "all"
      ? { genre: genre ?? undefined }
      : "skip"
  );

  const result = activeTab === "mine" ? myRecs : allRecs;

  // Only the grid content waits — page structure is always visible.
  const isGridLoading = !isAuthenticated || result === undefined;

  const currentUserRole = currentUser?.role ?? "user";
  const currentUserId = clerkUser?.id ?? null;
  const userName = clerkUser?.firstName ?? currentUser?.name ?? null;

  // Top genre from stats.
  const topGenre =
    myStats?.genreCounts && Object.keys(myStats.genreCounts).length > 0
      ? Object.entries(myStats.genreCounts).sort((a, b) => b[1] - a[1])[0]
      : null;

  return (
    <>
      {/* ---- Page Header ---- */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {userName ? `Welcome back, ${userName}` : "Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Your personal HypeShelf. Manage your recs and track your stats.
          </p>
          {currentUser?.role === "admin" && (
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

      {/* ---- Stats Bar (always visible, shows "–" while loading) ---- */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">
            {myStats ? myStats.totalActive : "–"}
          </p>
          <p className="text-xs text-gray-500">My Recs</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-amber-600">
            {myStats ? myStats.staffPickCount : "–"}
          </p>
          <p className="text-xs text-gray-500">Staff Picks</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">
            {myStats ? Object.keys(myStats.genreCounts).length : "–"}
          </p>
          <p className="text-xs text-gray-500">Genres</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-indigo-600 truncate">
            {myStats
              ? topGenre
                ? GENRE_LABELS[topGenre[0] as Genre] ?? topGenre[0]
                : "–"
              : "–"}
          </p>
          <p className="text-xs text-gray-500">Top Genre</p>
        </div>
      </div>

      {/* ---- Tabs ---- */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6" aria-label="Dashboard tabs">
          <button
            type="button"
            onClick={() => {
              setActiveTab("mine");
              setGenre(null);
            }}
            className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === "mine"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            My Recommendations
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setGenre(null);
            }}
            className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            All Recommendations
          </button>
        </nav>
      </div>

      {/* ---- Genre Filter ---- */}
      <section className="mb-8" aria-label="Filter by genre">
        <GenreFilter activeGenre={genre} onSelect={setGenre} />
      </section>

      {/* ---- Recommendations Grid ---- */}
      <section aria-label={activeTab === "mine" ? "My recommendations" : "All recommendations"}>
        {isGridLoading && <LoadingSpinner />}

        {!isGridLoading && result !== undefined && result.page.length === 0 && (
          <EmptyState
            message={
              activeTab === "mine"
                ? genre
                  ? "You have no recommendations in this genre."
                  : "You haven't added any recommendations yet. Click \"Add Recommendation\" above to get started!"
                : genre
                  ? "No recommendations found for this genre."
                  : "No recommendations yet. Be the first to add one!"
            }
          />
        )}

        {!isGridLoading && result !== undefined && result.page.length > 0 && (
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

            {!result.isDone && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  More recommendations available.
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
