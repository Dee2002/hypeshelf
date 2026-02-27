/**
 * AddRecommendationForm – modal form for creating a new recommendation.
 *
 * Design choices:
 *   • Controlled form with client-side validation that mirrors
 *     server-side rules (defense in depth).
 *   • Inline validation errors shown below each field.
 *   • Submit button disabled while submitting (prevent double-submit).
 *   • On success, the form resets and closes the modal.
 *   • On error, a user-friendly message is shown.
 *
 * Accessibility:
 *   • All inputs have associated <label> elements.
 *   • Error messages use `aria-describedby` to link to their input.
 *   • Focus is trapped in the modal when open (via `dialog` element).
 *   • Escape key closes the modal.
 *
 * Security:
 *   • All values are trimmed before submission.
 *   • URL is validated on both client and server side.
 *   • No raw user input is rendered as HTML (React escapes by default).
 */
"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { GENRE_LABELS, GENRE_LIST, type Genre } from "@/types";
import { isValidUrl } from "@/lib/utils";

interface AddRecommendationFormProps {
  /** Controls visibility of the form modal. */
  isOpen: boolean;
  /** Callback to close the modal. */
  onClose: () => void;
}

export default function AddRecommendationForm({
  isOpen,
  onClose,
}: AddRecommendationFormProps) {
  // ---- Form state ----
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<Genre>("other");
  const [link, setLink] = useState("");
  const [blurb, setBlurb] = useState("");

  // ---- UI state ----
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const addRec = useMutation(api.recommendations.add);

  // Sync dialog open/close with the `isOpen` prop.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Handle Escape key (native dialog behavior) and backdrop click.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleClose() {
      onClose();
    }

    function handleClick(e: MouseEvent) {
      // Close when clicking the backdrop (the dialog element itself,
      // not its children).
      if (e.target === dialog) {
        onClose();
      }
    }

    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("click", handleClick);
    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleClick);
    };
  }, [onClose]);

  /** Client-side validation. Returns true if valid. */
  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = "Title is required.";
    } else if (trimmedTitle.length > 200) {
      newErrors.title = "Title must be 200 characters or fewer.";
    }

    if (!GENRE_LIST.includes(genre)) {
      newErrors.genre = "Please select a valid genre.";
    }

    const trimmedLink = link.trim();
    if (trimmedLink && !isValidUrl(trimmedLink)) {
      newErrors.link = "Please enter a valid URL (https://...).";
    }

    const trimmedBlurb = blurb.trim();
    if (!trimmedBlurb) {
      newErrors.blurb = "Blurb is required.";
    } else if (trimmedBlurb.length > 500) {
      newErrors.blurb = "Blurb must be 500 characters or fewer.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await addRec({
        title: title.trim(),
        genre,
        link: link.trim(),
        blurb: blurb.trim(),
      });

      // Reset form and close on success.
      setTitle("");
      setGenre("other");
      setLink("");
      setBlurb("");
      setErrors({});
      onClose();
    } catch (err: any) {
      // Show server validation error to the user.
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-lg rounded-2xl border-0 p-0 shadow-xl backdrop:bg-black/50"
      aria-label="Add a recommendation"
    >
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Add a Recommendation
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close form"
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

        {/* ---- Submit-level error ---- */}
        {submitError && (
          <div
            role="alert"
            className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* ---- Title ---- */}
          <div className="mb-4">
            <label
              htmlFor="rec-title"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="rec-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              aria-describedby={errors.title ? "rec-title-error" : undefined}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g., Dune: Part Two"
            />
            {errors.title && (
              <p id="rec-title-error" className="mt-1 text-xs text-red-600">
                {errors.title}
              </p>
            )}
          </div>

          {/* ---- Genre ---- */}
          <div className="mb-4">
            <label
              htmlFor="rec-genre"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Genre <span className="text-red-500">*</span>
            </label>
            <select
              id="rec-genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value as Genre)}
              aria-describedby={errors.genre ? "rec-genre-error" : undefined}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {GENRE_LIST.map((g) => (
                <option key={g} value={g}>
                  {GENRE_LABELS[g]}
                </option>
              ))}
            </select>
            {errors.genre && (
              <p id="rec-genre-error" className="mt-1 text-xs text-red-600">
                {errors.genre}
              </p>
            )}
          </div>

          {/* ---- Link (optional) ---- */}
          <div className="mb-4">
            <label
              htmlFor="rec-link"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Link{" "}
              <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="rec-link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              maxLength={2048}
              aria-describedby={errors.link ? "rec-link-error" : undefined}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="https://..."
            />
            {errors.link && (
              <p id="rec-link-error" className="mt-1 text-xs text-red-600">
                {errors.link}
              </p>
            )}
          </div>

          {/* ---- Blurb ---- */}
          <div className="mb-6">
            <label
              htmlFor="rec-blurb"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Blurb <span className="text-red-500">*</span>
            </label>
            <textarea
              id="rec-blurb"
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              maxLength={500}
              rows={3}
              required
              aria-describedby={errors.blurb ? "rec-blurb-error" : undefined}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Why should someone check this out?"
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.blurb ? (
                <p id="rec-blurb-error" className="text-xs text-red-600">
                  {errors.blurb}
                </p>
              ) : (
                <span />
              )}
              <span className="text-xs text-gray-400">
                {blurb.length}/500
              </span>
            </div>
          </div>

          {/* ---- Submit ---- */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add Recommendation"}
          </button>
        </form>
      </div>
    </dialog>
  );
}
