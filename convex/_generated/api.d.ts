/* eslint-disable */
/**
 * Generated API module.
 * Run `npx convex dev` to regenerate.
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

import type * as leaderboard from "../leaderboard.js";
import type * as seedWords from "../seedWords.js";
import type * as words from "../words.js";

/**
 * A utility for referencing Convex functions in your app's API.
 */
declare const fullApi: ApiFromModules<{
  leaderboard: typeof leaderboard;
  seedWords: typeof seedWords;
  words: typeof words;
}>;

export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;
