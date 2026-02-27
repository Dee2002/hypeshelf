/**
 * Sign-In Page – HypeShelf
 *
 * Uses Clerk's pre-built <SignIn /> component rendered at
 * `/sign-in`.  The catch-all route (`[[...sign-in]]`) allows
 * Clerk to handle multi-step flows (e.g., MFA, OAuth callbacks)
 * under the same route prefix.
 *
 * Layout: centered vertically and horizontally for a clean,
 * focused authentication experience.
 */

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg",
          },
        }}
      />
    </div>
  );
}
