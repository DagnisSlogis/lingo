import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Cleanup stale/abandoned matches every 2 minutes
crons.interval(
  "cleanup stale matches",
  { minutes: 2 },
  internal.matches.cleanupStaleMatches
);

export default crons;
