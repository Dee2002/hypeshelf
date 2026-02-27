/**
 * Next.js Configuration – HypeShelf
 *
 * Security headers and image domain allowlisting can be added here
 * as the app grows.  For now, we keep it minimal.
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Security: Content Security Policy headers, HSTS, etc. should be
   * configured here or via a reverse proxy (e.g., Vercel, Cloudflare)
   * for production deployments.
   *
   * Example (uncomment for production):
   * async headers() {
   *   return [
   *     {
   *       source: "/(.*)",
   *       headers: [
   *         { key: "X-Frame-Options", value: "DENY" },
   *         { key: "X-Content-Type-Options", value: "nosniff" },
   *         { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
   *       ],
   *     },
   *   ];
   * },
   */
};

export default nextConfig;
