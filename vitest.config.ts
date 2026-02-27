/**
 * Vitest Configuration – HypeShelf
 *
 * Uses jsdom environment for React component testing.
 * Path aliases mirror the Next.js `tsconfig.json` paths.
 */

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
