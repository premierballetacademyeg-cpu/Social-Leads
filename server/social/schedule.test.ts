import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SOCIAL_METRICS_CRON, SOCIAL_METRICS_EXTRA_CRON, SOCIAL_METRICS_PATH } from "./schedule";
import vercelConfig from "../../vercel.json";

describe("social metrics schedule contract", () => {
  it("covers 07:00, 13:00 and 19:00 UTC (10:00, 16:00, 22:00 Cairo summer time)", () => {
    expect(SOCIAL_METRICS_CRON).toBe("0 7 * * *");
    expect(SOCIAL_METRICS_EXTRA_CRON).toBe("0 13,19 * * *");
    expect(SOCIAL_METRICS_PATH).toBe("/api/scheduled/refresh-social-metrics");
  });
  it("registers the daily run in vercel.json (Hobby plan allows one run per day)", () => {
    expect(vercelConfig.crons).toEqual([{ path: SOCIAL_METRICS_PATH, schedule: SOCIAL_METRICS_CRON }]);
  });
  it("runs the two extra daily refreshes from the GitHub Actions workflow", () => {
    const workflow = readFileSync(new URL("../../.github/workflows/metrics-refresh.yml", import.meta.url), "utf-8");
    expect(workflow).toContain(`- cron: "${SOCIAL_METRICS_EXTRA_CRON}"`);
    expect(workflow).not.toMatch(/^\s*#\s*-\s*cron/m);
  });
});
