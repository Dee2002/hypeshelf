/**
 * Seed Data Script – HypeShelf
 *
 * Run via `npx convex run seed:seedData` after deploying the Convex
 * backend.  Populates the database with sample recommendations so the
 * app has content to display immediately.
 *
 * NOTE: This is an internal action – it bypasses auth intentionally.
 * It should only be run once in development/staging, never in
 * production with real user data.
 */

import { mutation } from "./_generated/server";

const SAMPLE_RECOMMENDATIONS = [
  {
    title: "The Last of Us",
    genre: "horror",
    link: "https://www.hbo.com/the-last-of-us",
    blurb:
      "A brutal, emotional journey through a post-apocalyptic world. The character development is unmatched.",
    authorName: "HypeShelf Team",
    isStaffPick: true,
  },
  {
    title: "Dune: Part Two",
    genre: "sci-fi",
    link: "https://www.dunemovie.com",
    blurb:
      "Villeneuve delivers a sci-fi epic that somehow exceeds the original. Visually stunning and emotionally resonant.",
    authorName: "HypeShelf Team",
    isStaffPick: true,
  },
  {
    title: "Baldur's Gate 3",
    genre: "fantasy",
    link: "https://baldursgate3.game",
    blurb:
      "The new gold standard for CRPGs. Incredible writing, freedom of choice, and replayability.",
    authorName: "HypeShelf Team",
    isStaffPick: false,
  },
  {
    title: "Everything Everywhere All at Once",
    genre: "comedy",
    link: "https://a24films.com/films/everything-everywhere-all-at-once",
    blurb:
      "A multiverse movie that's actually about something. Hilarious, heartbreaking, and deeply human.",
    authorName: "HypeShelf Team",
    isStaffPick: false,
  },
  {
    title: "Oppenheimer",
    genre: "drama",
    link: "https://www.oppenheimermovie.com",
    blurb:
      "Nolan's best work. A three-hour masterclass in tension, biography, and moral complexity.",
    authorName: "HypeShelf Team",
    isStaffPick: true,
  },
  {
    title: "John Wick: Chapter 4",
    genre: "action",
    link: "https://www.johnwick.movie",
    blurb:
      "Peak action cinema. The staircase scene alone is worth the price of admission.",
    authorName: "HypeShelf Team",
    isStaffPick: false,
  },
  {
    title: "Severance",
    genre: "thriller",
    link: "https://tv.apple.com/us/show/severance",
    blurb:
      "A workplace thriller that will keep you guessing. Season 1 is a perfect piece of television.",
    authorName: "HypeShelf Team",
    isStaffPick: false,
  },
  {
    title: "Planet Earth III",
    genre: "documentary",
    link: "https://www.bbc.co.uk/programmes/p0fhmt1t",
    blurb:
      "Breathtaking cinematography and storytelling. David Attenborough at the top of his game.",
    authorName: "HypeShelf Team",
    isStaffPick: false,
  },
  {
    title: "Spider-Man: Across the Spider-Verse",
    genre: "animation",
    link: "https://www.spiderverse.movie",
    blurb:
      "A visual masterpiece that pushes animation to new heights. Every frame is a painting.",
    authorName: "HypeShelf Team",
    isStaffPick: true,
  },
  {
    title: "Past Lives",
    genre: "romance",
    link: "https://a24films.com/films/past-lives",
    blurb:
      "A quiet, achingly beautiful film about love, memory, and the roads not taken. Devastating final scene.",
    authorName: "HypeShelf Team",
    isStaffPick: false,
  },
];

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists to prevent duplicate seeding.
    const existing = await ctx.db
      .query("recommendations")
      .first();

    if (existing) {
      return { message: "Database already seeded. Skipping." };
    }

    for (const rec of SAMPLE_RECOMMENDATIONS) {
      await ctx.db.insert("recommendations", {
        ...rec,
        createdBy: "seed_system",
        deletedAt: undefined,
      });
    }

    return {
      message: `Seeded ${SAMPLE_RECOMMENDATIONS.length} recommendations.`,
    };
  },
});
