/**
 * UserSync – invisible component that syncs the Clerk user into
 * the Convex `users` table on every page load when authenticated.
 *
 * This ensures that:
 *   1. First-time users get a `users` record created automatically.
 *   2. Returning users get their profile fields (name, avatar) updated
 *      if they changed them in Clerk.
 *
 * Important: we use `useConvexAuth` (not Clerk's `useUser`) to gate
 * the sync call.  `useConvexAuth` only reports `isAuthenticated: true`
 * AFTER the Convex client has received the Clerk JWT.  Using Clerk's
 * `useUser` causes a race condition where the mutation fires before
 * Convex has the auth token, resulting in "must be signed in" errors.
 *
 * Placed in the root layout so it runs on every page.
 */
"use client";

import { useEffect } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function UserSync() {
  const { isAuthenticated } = useConvexAuth();
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    // Only sync after Convex has confirmed it holds a valid auth token.
    if (isAuthenticated) {
      syncUser().catch((err) => {
        // Logging the error type without exposing sensitive data.
        // In production, this should go to a structured logging service.
        console.error("[UserSync] Failed to sync user:", err.message);
      });
    }
  }, [isAuthenticated, syncUser]);

  // This component renders nothing – it's a side-effect-only component.
  return null;
}
