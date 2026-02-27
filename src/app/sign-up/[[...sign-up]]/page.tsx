/**
 * Sign-Up Page – HypeShelf
 *
 * Uses Clerk's pre-built <SignUp /> component rendered at
 * `/sign-up`.  The catch-all route (`[[...sign-up]]`) allows
 * Clerk to handle multi-step flows under the same route prefix.
 *
 * Layout: centered for a clean sign-up experience.
 */

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <SignUp
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
