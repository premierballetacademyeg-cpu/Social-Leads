import * as db from "../db";

// Hobby plan: Vercel Cron can only run once a day, so the refresh is split in two:
//  - 07:00 UTC (10:00 Cairo summer time) from Vercel Cron (vercel.json)
//  - 13:00 and 19:00 UTC (16:00 and 22:00) from GitHub Actions (.github/workflows/metrics-refresh.yml)
// Both call the same route, which checks CRON_SECRET.
export const SOCIAL_METRICS_CRON = "0 7 * * *";
export const SOCIAL_METRICS_EXTRA_CRON = "0 13,19 * * *";
export const SOCIAL_METRICS_PATH = "/api/scheduled/refresh-social-metrics";

export async function getMetricsScheduleStatus() {
  const latest = await db.getLatestMetricCollectedAt();
  return {
    cron: SOCIAL_METRICS_CRON,
    extraCron: SOCIAL_METRICS_EXTRA_CRON,
    path: SOCIAL_METRICS_PATH,
    cronSecretConfigured: Boolean(process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 16),
    lastCollectedAt: latest,
    utcSchedule: "07:00 UTC (Vercel Cron), 13:00 and 19:00 UTC (GitHub Actions)",
  };
}
