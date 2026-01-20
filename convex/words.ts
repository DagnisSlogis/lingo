import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getRandomWord = query({
  args: {
    difficulty: v.string(),
  },
  handler: async (ctx, args) => {
    const words = await ctx.db
      .query("words")
      .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty))
      .collect();

    if (words.length === 0) {
      // Return fallback words if database is empty
      const fallbackWords: Record<string, string[]> = {
        easy: ["māja", "suns", "kaķis", "ziema", "vasara"],
        medium: ["brīvība", "lauksaimn", "dzīvoklis"],
        hard: ["universitāte", "matemātika", "bibliotēka"],
      };

      const fallback = fallbackWords[args.difficulty] || fallbackWords.easy;
      const randomWord = fallback[Math.floor(Math.random() * fallback.length)];

      return {
        word: randomWord,
        length: randomWord.length,
        difficulty: args.difficulty,
      };
    }

    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
  },
});

export const addWord = mutation({
  args: {
    word: v.string(),
    difficulty: v.string(),
  },
  handler: async (ctx, args) => {
    const word = args.word.toLowerCase().trim();
    const length = word.length;

    // Check if word already exists
    const existing = await ctx.db
      .query("words")
      .withIndex("by_difficulty", (q) => q.eq("difficulty", args.difficulty))
      .filter((q) => q.eq(q.field("word"), word))
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("words", {
      word,
      length,
      difficulty: args.difficulty,
    });
  },
});

export const seedWords = mutation({
  args: {
    words: v.array(
      v.object({
        word: v.string(),
        difficulty: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = [];

    for (const { word, difficulty } of args.words) {
      const cleanWord = word.toLowerCase().trim();
      const length = cleanWord.length;

      // Check if word already exists
      const existing = await ctx.db
        .query("words")
        .withIndex("by_difficulty", (q) => q.eq("difficulty", difficulty))
        .filter((q) => q.eq(q.field("word"), cleanWord))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("words", {
          word: cleanWord,
          length,
          difficulty,
        });
        results.push({ word: cleanWord, id, status: "created" });
      } else {
        results.push({ word: cleanWord, id: existing._id, status: "exists" });
      }
    }

    return results;
  },
});

export const getWordCount = query({
  args: {},
  handler: async (ctx) => {
    const easy = await ctx.db
      .query("words")
      .withIndex("by_difficulty", (q) => q.eq("difficulty", "easy"))
      .collect();
    const medium = await ctx.db
      .query("words")
      .withIndex("by_difficulty", (q) => q.eq("difficulty", "medium"))
      .collect();
    const hard = await ctx.db
      .query("words")
      .withIndex("by_difficulty", (q) => q.eq("difficulty", "hard"))
      .collect();

    return {
      easy: easy.length,
      medium: medium.length,
      hard: hard.length,
      total: easy.length + medium.length + hard.length,
    };
  },
});
