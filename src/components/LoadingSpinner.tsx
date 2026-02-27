/**
 * LoadingSpinner – accessible loading indicator.
 *
 * Uses a CSS-only animation (Tailwind `animate-spin`) to avoid
 * JS overhead.  The `role="status"` and visually-hidden text
 * ensure screen readers announce the loading state.
 */

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12" role="status">
      <svg
        className="h-8 w-8 animate-spin text-indigo-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {/* Visually hidden text for screen readers */}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
