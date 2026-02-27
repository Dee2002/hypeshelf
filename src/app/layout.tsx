/**
 * Root Layout – HypeShelf
 *
 * This is the top-level layout for the entire application.
 *
 * Provider hierarchy (outermost → innermost):
 *   1. ClerkProvider   – authentication context
 *   2. ConvexClientProvider – database/real-time context (uses Clerk tokens)
 *   3. UserSync        – syncs Clerk user → Convex users table
 *   4. Header          – site-wide navigation bar
 *   5. <main>          – page content
 *
 * Security note: `ClerkProvider` must wrap `ConvexClientProvider`
 * so that Convex can obtain the Clerk JWT for authenticated requests.
 *
 * The `<html lang="en">` attribute is required for accessibility
 * (screen readers need to know the document language).
 */

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import UserSync from "@/components/UserSync";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "HypeShelf – Collect and share the stuff you're hyped about",
  description:
    "A shared recommendations hub for friends. Discover movies, shows, games, and more that people are hyped about.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ClerkProvider>
          <ConvexClientProvider>
            {/* UserSync runs silently on every page load when signed in */}
            <UserSync />
            <Header />
            <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
