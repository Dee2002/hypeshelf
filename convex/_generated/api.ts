/**
 * Auto-generated stub – replaced by `npx convex dev` at runtime.
 *
 * This file exists so TypeScript can compile and tests can run
 * without an active Convex deployment.  When you run `npx convex dev`,
 * Convex overwrites this file with real type-safe bindings.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { FunctionReference } from "convex/server";

export const api: any = {
  recommendations: {
    listPublic: {} as FunctionReference<"query">,
    listAuthenticated: {} as FunctionReference<"query">,
    add: {} as FunctionReference<"mutation">,
    remove: {} as FunctionReference<"mutation">,
    toggleStaffPick: {} as FunctionReference<"mutation">,
  },
  users: {
    getCurrentUser: {} as FunctionReference<"query">,
    syncUser: {} as FunctionReference<"mutation">,
    setUserRole: {} as FunctionReference<"mutation">,
  },
  seed: {
    seedData: {} as FunctionReference<"mutation">,
  },
};

export const internal: any = {};
