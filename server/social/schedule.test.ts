import { describe, expect, it } from "vitest";
import { SOCIAL_METRICS_CRON, SOCIAL_METRICS_PATH } from "./schedule";
import vercelConfig from "../../vercel.json";

describe("social metrics schedule contract", () => {
  it("runs at 07:00, 13:00 and 19:00 UTC (10:00, 16:00, 22:00 Cairo summer time)", () => {
    expect(SOCIAL_METRICS_CRON).toBe("0 7,13,19 * * *");
    expect(SOCIAL_METRICS_PATH).toBe("/api/scheduled/refresh-social-metrics");
  });
  it("is registered in vercel.json with the same path and schedule", () => {
    expect(vercelConfig.crons).toContainEqual({ path: SOCIAL_METRICS_PATH, schedule: SOCIAL_METRICS_CRON });
  });
});
