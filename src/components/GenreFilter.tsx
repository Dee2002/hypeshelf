/**
 * GenreFilter – horizontal scrollable genre filter bar.
 *
 * Design choices:
 *   • Uses a horizontal scroll for mobile-first design; on wider
 *     screens the genres wrap naturally.
 *   • "All" is always the first option and represents no filter.
 *   • Active genre uses a filled style, inactive uses outline style.
 *   • Keyboard accessible – each filter is a native <button>.
 *
 * Accessibility:
 *   • `role="group"` with `aria-label` describes the filter purpose.
 *   • `aria-pressed` on each button indicates the active selection.
 */
"use client";

import { GENRE_LABELS, GENRE_LIST, type Genre } from "@/types";

interface GenreFilterProps {
  /** Currently selected genre, or `null` for "All". */
  activeGenre: Genre | null;
  /** Callback when the user selects a genre (null = clear filter). */
  onSelect: (genre: Genre | null) => void;
}

export default function GenreFilter({
  activeGenre,
  onSelect,
}: GenreFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter recommendations by genre"
      className="flex flex-wrap gap-2"
    >
      {/* "All" button – clears the genre filter */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={activeGenre === null}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          activeGenre === null
            ? "bg-indigo-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        All
      </button>

      {GENRE_LIST.map((genre) => (
        <button
          key={genre}
          type="button"
          onClick={() => onSelect(genre)}
          aria-pressed={activeGenre === genre}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            activeGenre === genre
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {GENRE_LABELS[genre]}
        </button>
      ))}
    </div>
  );
}
