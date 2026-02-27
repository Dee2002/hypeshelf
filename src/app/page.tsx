/**
 * Public Landing Page – HypeShelf
 *
 * The root page visible to everyone (authenticated or not).
 *
 * Layout:
 *   1. Hero section with tagline and CTA.
 *   2. Genre filter bar.
 *   3. Grid of the latest public recommendations.
 *   4. "Load more" pagination button.
 *
 * This page uses the `listPublic` query which does NOT require
 * authentication and strips `createdBy` from results (privacy).
 *
 * Design:
 *   • Mobile-first: single column on small screens, 2-column grid
 *     on medium, 3-column on large.
 *   • Hero uses a clean, centered layout for visual clarity.
 *   • The "Sign in to add yours" button is only shown to
 *     unauthenticated visitors.
 */
"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { SignedOut, SignInButton } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import type { Genre } from "@/types";
import GenreFilter from "@/components/GenreFilter";
import RecommendationCard from "@/components/RecommendationCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

export default function HomePage() {
  const [genre, setGenre] = useState<Genre | null>(null);

  // Fetch public recommendations (no auth required).
  const result = useQuery(api.recommendations.listPublic, {
    genre: genre ?? undefined,
  });

  // Convex returns `undefined` while loading.
  const isLoading = result === undefined;

  return (
    <>
      {/* ---- Hero Section ---- */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          HypeShelf
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Collect and share the stuff you&apos;re hyped about.
        </p>

        {/* CTA for unauthenticated visitors */}
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
      </section>

      {/* ---- Genre Filter ---- */}
      <section className="mb-8" aria-label="Filter by genre">
        <GenreFilter activeGenre={genre} onSelect={setGenre} />
      </section>

      {/* ---- Recommendations Grid ---- */}
      <section aria-label="Recommendations">
        {isLoading && <LoadingSpinner />}

        {!isLoading && result.page.length === 0 && (
          <EmptyState
            message={
              genre
                ? `No recommendations found for this genre. Try a different filter!`
                : "No recommendations yet. Be the first to add one!"
            }
          />
        )}

        {!isLoading && result.page.length > 0 && (
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

            {/* ---- Load More hint ---- */}
            {!result.isDone && (
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  More recommendations available. Sign in to browse the full list.
                </p>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
