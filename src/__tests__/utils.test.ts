/**
 * Unit Tests – Utility Functions
 *
 * Tests for `src/lib/utils.ts`.  These are pure functions with
 * no external dependencies, making them ideal for unit testing.
 */

import { describe, it, expect } from "vitest";
import { timeAgo, genreColor, isValidUrl } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  timeAgo                                                            */
/* ------------------------------------------------------------------ */

describe("timeAgo", () => {
  it('returns "just now" for timestamps less than 60 seconds ago', () => {
    const now = Date.now();
    expect(timeAgo(now)).toBe("just now");
    expect(timeAgo(now - 30_000)).toBe("just now");
  });

  it("returns minutes for timestamps 1-59 minutes ago", () => {
    const oneMinAgo = Date.now() - 60_000;
    expect(timeAgo(oneMinAgo)).toBe("1 minute ago");

    const fiveMinAgo = Date.now() - 5 * 60_000;
    expect(timeAgo(fiveMinAgo)).toBe("5 minutes ago");
  });

  it("returns hours for timestamps 1-23 hours ago", () => {
    const oneHourAgo = Date.now() - 3600_000;
    expect(timeAgo(oneHourAgo)).toBe("1 hour ago");

    const threeHoursAgo = Date.now() - 3 * 3600_000;
    expect(timeAgo(threeHoursAgo)).toBe("3 hours ago");
  });

  it("returns days for timestamps 24+ hours ago", () => {
    const oneDayAgo = Date.now() - 86400_000;
    expect(timeAgo(oneDayAgo)).toBe("1 day ago");

    const sevenDaysAgo = Date.now() - 7 * 86400_000;
    expect(timeAgo(sevenDaysAgo)).toBe("7 days ago");
  });
});

/* ------------------------------------------------------------------ */
/*  genreColor                                                         */
/* ------------------------------------------------------------------ */

describe("genreColor", () => {
  it("returns a color class for each known genre", () => {
    expect(genreColor("horror")).toContain("bg-red");
    expect(genreColor("action")).toContain("bg-orange");
    expect(genreColor("comedy")).toContain("bg-yellow");
    expect(genreColor("drama")).toContain("bg-purple");
    expect(genreColor("sci-fi")).toContain("bg-cyan");
    expect(genreColor("fantasy")).toContain("bg-indigo");
    expect(genreColor("romance")).toContain("bg-pink");
    expect(genreColor("thriller")).toContain("bg-gray");
    expect(genreColor("documentary")).toContain("bg-green");
    expect(genreColor("animation")).toContain("bg-blue");
    expect(genreColor("other")).toContain("bg-slate");
  });

  it("returns a fallback for unknown genres", () => {
    // TypeScript would normally prevent this, but testing the runtime fallback.
    expect(genreColor("unknown" as any)).toContain("bg-slate");
  });
});

/* ------------------------------------------------------------------ */
/*  isValidUrl                                                         */
/* ------------------------------------------------------------------ */

describe("isValidUrl", () => {
  it("returns true for empty string (link is optional)", () => {
    expect(isValidUrl("")).toBe(true);
  });

  it("returns true for valid HTTP URLs", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("https://example.com/path?q=test")).toBe(true);
  });

  it("returns false for non-HTTP protocols", () => {
    expect(isValidUrl("ftp://example.com")).toBe(false);
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidUrl("data:text/html,<h1>hi</h1>")).toBe(false);
  });

  it("returns false for malformed URLs", () => {
    expect(isValidUrl("not a url")).toBe(false);
    expect(isValidUrl("://missing-protocol")).toBe(false);
  });
});
