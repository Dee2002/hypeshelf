/**
 * Clerk Middleware – HypeShelf
 *
 * Protects routes that require authentication.
 *
 * Route protection strategy:
 *   • `/dashboard(.*)` → requires sign-in.  Unauthenticated users
 *     are redirected to `/sign-in`.
 *   • All other routes (including `/`) are public.
 *
 * Security note: this is the FIRST line of defense for protected
 * pages.  However, the real authorization happens server-side in
 * Convex mutations/queries.  The middleware only prevents
 * unauthenticated users from seeing the dashboard UI.
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     *   • Static files (_next/static)
     *   • Image optimization (_next/image)
     *   • Favicon
     *   • Public assets in /public
     */
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
