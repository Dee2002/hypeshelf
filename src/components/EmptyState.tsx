/**
 * EmptyState – displayed when a list query returns zero results.
 *
 * Accepts a customizable `message` prop so it can be reused across
 * different contexts (e.g., "No recommendations yet" vs.
 * "No results for this genre").
 *
 * Accessibility: uses a semantic paragraph and decorative SVG
 * marked with `aria-hidden`.
 */

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({
  message = "No recommendations yet. Be the first to add one!",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Decorative icon */}
      <svg
        className="mb-4 h-16 w-16 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
