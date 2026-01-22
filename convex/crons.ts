import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Cleanup stale/abandoned matches every 2 minutes
crons.interval(
  "cleanup stale matches",
  { minutes: 2 },
  internal.matches.cleanupStaleMatches
);

// Cleanup stale matchmaking queue entries every 2 minutes
crons.interval(
  "cleanup stale matchmaking",
  { minutes: 2 },
  internal.matchmaking.cleanupStaleEntries
);

export default crons;
