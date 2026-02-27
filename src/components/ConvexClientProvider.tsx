/**
 * ConvexClientProvider – wires the Convex React client into the
 * component tree and integrates it with Clerk authentication.
 *
 * Architecture notes:
 *   • `ConvexProviderWithClerk` automatically passes the Clerk JWT
 *     to Convex on every request, so all Convex queries/mutations
 *     receive the authenticated identity.
 *   • `useAuth` from @clerk/nextjs supplies the token getter.
 *   • The Convex deployment URL is read from the public env var
 *     `NEXT_PUBLIC_CONVEX_URL` (set in `.env.local`).
 *
 * Security note: the Convex URL is safe to expose publicly – it only
 * identifies the deployment.  All access control happens server-side.
 */
"use client";

import { ReactNode } from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/nextjs";

/**
 * Singleton Convex client – instantiated once at module scope.
 * The `!` assertion is safe because Next.js will fail to start if
 * the env var is missing (validated in `next.config.ts`).
 */
const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
