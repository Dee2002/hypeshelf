/**
 * Dashboard Page – HypeShelf (Authenticated)
 *
 * Personal management hub. Shows only YOUR recommendations with
 * stats, genre filter, and management controls.
 *
 * To browse everyone's recommendations, use the Explore (home) page.
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
import RecommendationDetail from "@/components/RecommendationDetail";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

export default function DashboardPage() {
  const [genre, setGenre] = useState<Genre | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRec, setSelectedRec] = useState<any | null>(null);

  const { isAuthenticated } = useConvexAuth();
  const { user: clerkUser } = useUser();

  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );

  const allResult = useQuery(
    api.recommendations.listAuthenticated,
    isAuthenticated ? {} : "skip"
  );

  const currentUserRole = currentUser?.role ?? "user";
  const currentUserId = clerkUser?.id ?? null;
  const userName = clerkUser?.firstName ?? currentUser?.name ?? null;

  // Filter to only the current user's recs, then apply genre filter.
  const allRecs = allResult?.page ?? [];
  const myRecs = currentUserId
    ? allRecs.filter((r: any) => r.createdBy === currentUserId)
    : [];
  const visibleRecs = genre
    ? myRecs.filter((r: any) => r.genre === genre)
    : myRecs;

  const dataLoaded = allResult !== undefined;
  const showGridSpinner = !dataLoaded;

  // Stats from the user's recs (unfiltered by genre).
  const staffPickCount = myRecs.filter((r: any) => r.isStaffPick).length;
  const genreCounts: Record<string, number> = {};
  for (const rec of myRecs) {
    genreCounts[(rec as any).genre] =
      (genreCounts[(rec as any).genre] || 0) + 1;
  }
  const topGenre =
    Object.keys(genreCounts).length > 0
      ? Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]
      : null;

  return (
    <>
      {/* ---- Auth warning ---- */}
      {!isAuthenticated && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Database connection issue:</strong> You&apos;re signed in to
          Clerk but not connected to Convex. Make sure you have a JWT template
          named{" "}
          <code className="rounded bg-amber-100 px-1">&quot;convex&quot;</code>{" "}
          in your{" "}
          <a
            href="https://dashboard.clerk.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Clerk dashboard
          </a>{" "}
          (JWT Templates section), then sign out and sign back in.
        </div>
      )}

      {/* ---- Page Header ---- */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {userName ? `Welcome back, ${userName}` : "Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Your recommendations at a glance.
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

      {/* ---- Stats Bar ---- */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">
            {dataLoaded ? myRecs.length : "–"}
          </p>
          <p className="text-xs text-gray-500">My Recs</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-amber-600">
            {dataLoaded ? staffPickCount : "–"}
          </p>
          <p className="text-xs text-gray-500">Staff Picks</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">
            {dataLoaded ? Object.keys(genreCounts).length : "–"}
          </p>
          <p className="text-xs text-gray-500">Genres</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-indigo-600 truncate">
            {dataLoaded
              ? topGenre
                ? GENRE_LABELS[topGenre[0] as Genre] ?? topGenre[0]
                : "–"
              : "–"}
          </p>
          <p className="text-xs text-gray-500">Top Genre</p>
        </div>
      </div>

      {/* ---- Genre Filter ---- */}
      <section className="mb-8" aria-label="Filter by genre">
        <GenreFilter activeGenre={genre} onSelect={setGenre} />
      </section>

      {/* ---- My Recommendations Grid ---- */}
      <section aria-label="My recommendations">
        {showGridSpinner && <LoadingSpinner />}

        {dataLoaded && visibleRecs.length === 0 && (
          <EmptyState
            message={
              genre
                ? "You have no recommendations in this genre."
                : "You haven't added any recommendations yet. Click \"Add Recommendation\" above to get started!"
            }
          />
        )}

        {dataLoaded && visibleRecs.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleRecs.map((rec: any) => (
              <RecommendationCard
                key={rec._id}
                recommendation={rec}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onSelect={setSelectedRec}
              />
            ))}
          </div>
        )}
      </section>

      {/* ---- Modals ---- */}
      <AddRecommendationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
      <RecommendationDetail
        recommendation={selectedRec}
        onClose={() => setSelectedRec(null)}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
      />
    </>
  );
}
