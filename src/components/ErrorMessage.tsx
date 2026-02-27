/**
 * ErrorMessage – generic error display component.
 *
 * Shows a red alert box with the error text and an optional
 * retry button.  Used wherever queries or mutations can fail.
 *
 * Accessibility: `role="alert"` ensures screen readers announce
 * the error immediately when it appears.
 */

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-center"
    >
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  );
}
