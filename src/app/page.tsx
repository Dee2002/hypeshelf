/**
 * Public Landing / Explore Page – HypeShelf
 *
 * The root page visible to everyone (authenticated or not).
 * Serves as the public discovery feed.
 *
 * Layout:
 *   1. Hero with tagline + CTA.
 *   2. "Latest recommendations" section label.
 *   3. Genre filter bar.
 *   4. Grid of latest public recommendations.
 *
 * The page structure (hero, filter, section heading) always renders
 * immediately. Only the grid area shows a spinner while data loads.
 *
 * This page uses `listPublic` which does NOT require auth and strips
 * `createdBy` from results (privacy-by-design).
 */
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { api } from "../../convex/_generated/api";
import type { Genre } from "@/types";
import GenreFilter from "@/components/GenreFilter";
import RecommendationCard from "@/components/RecommendationCard";
import AddRecommendationForm from "@/components/AddRecommendationForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

export default function HomePage() {
  const [genre, setGenre] = useState<Genre | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const result = useQuery(api.recommendations.listPublic, {
    genre: genre ?? undefined,
  });

  const isGridLoading = result === undefined;

  return (
    <>
      {/* ---- Hero Section ---- */}
      <section className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          HypeShelf
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Collect and share the stuff you&apos;re hyped about.
        </p>

        <SignedOut>
          <SignInButton mode="modal">
            <button
              type="button"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Sign in to add yours
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
            >
              Go to Dashboard
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </SignedIn>
      </section>

      {/* ---- Section heading ---- */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Latest Recommendations
        </h2>
        <p className="text-sm text-gray-500">
          See what everyone is hyped about right now.
        </p>
      </div>

      {/* ---- Genre Filter ---- */}
      <section className="mb-8" aria-label="Filter by genre">
        <GenreFilter activeGenre={genre} onSelect={setGenre} />
      </section>

      {/* ---- Recommendations Grid ---- */}
      <section aria-label="Recommendations">
        {isGridLoading && <LoadingSpinner />}

        {!isGridLoading && result.page.length === 0 && (
          <EmptyState
            message={
              genre
                ? "No recommendations found for this genre. Try a different filter!"
                : "No recommendations yet. Be the first to add one!"
            }
          />
        )}

        {!isGridLoading && result.page.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.page.map((rec: any) => (
                <RecommendationCard
                  key={rec._id}
                  recommendation={rec}
                  currentUserId={null}
                  currentUserRole={null}
                />
              ))}
            </div>

            {!result.isDone && (
              <SignedOut>
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-400">
                    Sign in to browse more recommendations and add your own.
                  </p>
                </div>
              </SignedOut>
            )}
          </>
        )}
      </section>

      {/* ---- Add Recommendation Modal (for signed-in users) ---- */}
      <AddRecommendationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </>
  );
}
