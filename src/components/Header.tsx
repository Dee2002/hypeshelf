/**
 * Header – site-wide navigation bar.
 *
 * Renders differently based on auth state:
 *   • Signed out → "Sign in" button
 *   • Signed in  → navigation link to Dashboard + Clerk UserButton
 *
 * Accessibility:
 *   • Uses semantic <header> and <nav> elements.
 *   • All interactive elements are keyboard-accessible by default
 *     (native <a> and <button> elements).
 *   • `aria-label` on the nav for screen readers.
 */
"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3"
      >
        {/* ---- Brand ---- */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-gray-900 transition-colors hover:text-indigo-600"
        >
          HypeShelf
        </Link>

        {/* ---- Right side ---- */}
        <div className="flex items-center gap-4">
          <SignedIn>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-indigo-600"
            >
              Dashboard
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
}
