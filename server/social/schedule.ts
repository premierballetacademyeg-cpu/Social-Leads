import * as db from "../db";

// Runs at 07:00, 13:00 and 19:00 UTC (10:00, 16:00, 22:00 Cairo summer time).
// Registered in vercel.json (crons); the route in routes.ts checks CRON_SECRET.
export const SOCIAL_METRICS_CRON = "0 7,13,19 * * *";
export const SOCIAL_METRICS_PATH = "/api/scheduled/refresh-social-metrics";

export async function getMetricsScheduleStatus() {
  const latest = await db.getLatestMetricCollectedAt();
  return {
    cron: SOCIAL_METRICS_CRON,
    path: SOCIAL_METRICS_PATH,
    cronSecretConfigured: Boolean(process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 16),
    lastCollectedAt: latest,
    utcSchedule: "07:00, 13:00, 19:00 UTC",
  };
}
