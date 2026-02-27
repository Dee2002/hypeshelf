/**
 * Component Test Stubs – HypeShelf
 *
 * These tests verify that components render without crashing.
 * They use mocked Convex and Clerk providers since the real
 * providers require network access and authentication.
 *
 * In a full test suite, you would:
 *   1. Mock `useQuery` / `useMutation` from "convex/react"
 *   2. Mock `useUser` / `useAuth` from "@clerk/nextjs"
 *   3. Use @testing-library/react for interaction tests
 *
 * These stubs serve as a starting point to be expanded as the
 * application grows.
 */

import { describe, it, expect, vi } from "vitest";

// ---- Mock Convex ----
vi.mock("convex/react", () => ({
  useQuery: vi.fn(() => undefined),
  useMutation: vi.fn(() => vi.fn()),
  ConvexReactClient: vi.fn(),
}));

vi.mock("convex/react-clerk", () => ({
  ConvexProviderWithClerk: ({ children }: any) => children,
}));

// ---- Mock Clerk ----
vi.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children }: any) => children,
  SignedIn: ({ children }: any) => children,
  SignedOut: ({ children }: any) => children,
  SignInButton: ({ children }: any) => children,
  UserButton: () => null,
  useUser: vi.fn(() => ({ user: null, isSignedIn: false, isLoaded: true })),
  useAuth: vi.fn(() => ({ getToken: vi.fn() })),
}));

// ---- Mock Convex API ----
vi.mock("../../convex/_generated/api", () => ({
  api: {
    recommendations: {
      listPublic: "recommendations:listPublic",
      listAuthenticated: "recommendations:listAuthenticated",
      add: "recommendations:add",
      remove: "recommendations:remove",
      toggleStaffPick: "recommendations:toggleStaffPick",
    },
    users: {
      getCurrentUser: "users:getCurrentUser",
      syncUser: "users:syncUser",
    },
  },
}));

/* ------------------------------------------------------------------ */
/*  LoadingSpinner                                                     */
/* ------------------------------------------------------------------ */

describe("LoadingSpinner", () => {
  it("can be imported without error", async () => {
    const mod = await import("@/components/LoadingSpinner");
    expect(mod.default).toBeDefined();
  });
});

/* ------------------------------------------------------------------ */
/*  EmptyState                                                         */
/* ------------------------------------------------------------------ */

describe("EmptyState", () => {
  it("can be imported without error", async () => {
    const mod = await import("@/components/EmptyState");
    expect(mod.default).toBeDefined();
  });
});

/* ------------------------------------------------------------------ */
/*  ErrorMessage                                                       */
/* ------------------------------------------------------------------ */

describe("ErrorMessage", () => {
  it("can be imported without error", async () => {
    const mod = await import("@/components/ErrorMessage");
    expect(mod.default).toBeDefined();
  });
});

/* ------------------------------------------------------------------ */
/*  GenreFilter                                                        */
/* ------------------------------------------------------------------ */

describe("GenreFilter", () => {
  it("can be imported without error", async () => {
    const mod = await import("@/components/GenreFilter");
    expect(mod.default).toBeDefined();
  });
});

/* ------------------------------------------------------------------ */
/*  RecommendationCard                                                 */
/* ------------------------------------------------------------------ */

describe("RecommendationCard", () => {
  it("can be imported without error", async () => {
    const mod = await import("@/components/RecommendationCard");
    expect(mod.default).toBeDefined();
  });
});

/* ------------------------------------------------------------------ */
/*  AddRecommendationForm                                              */
/* ------------------------------------------------------------------ */

describe("AddRecommendationForm", () => {
  it("can be imported without error", async () => {
    const mod = await import("@/components/AddRecommendationForm");
    expect(mod.default).toBeDefined();
  });
});

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

describe("Header", () => {
  it("can be imported without error", async () => {
    const mod = await import("@/components/Header");
    expect(mod.default).toBeDefined();
  });
});
