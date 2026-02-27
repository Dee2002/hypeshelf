/**
 * UserSync – invisible component that syncs the Clerk user into
 * the Convex `users` table on every page load when authenticated.
 *
 * This ensures that:
 *   1. First-time users get a `users` record created automatically.
 *   2. Returning users get their profile fields (name, avatar) updated
 *      if they changed them in Clerk.
 *
 * Placed in the root layout so it runs on every page.
 */
"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function UserSync() {
  const { isSignedIn, isLoaded } = useUser();
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    // Only sync after Clerk has fully loaded AND the user is signed in.
    if (isLoaded && isSignedIn) {
      syncUser().catch((err) => {
        // Logging the error type without exposing sensitive data.
        // In production, this should go to a structured logging service.
        console.error("[UserSync] Failed to sync user:", err.message);
      });
    }
  }, [isLoaded, isSignedIn, syncUser]);

  // This component renders nothing – it's a side-effect-only component.
  return null;
}
