import type { Express, Request, Response } from "express";
import { handleInboundEvent } from "./engine";
import { refreshSocialMetrics } from "./metrics";
import { metaReadiness, normalizeMetaPayload, verifyMetaSignature } from "./meta";
import { isCronAuthorized } from "../_core/auth";
import * as db from "../db";
type RawRequest = Request & { rawBody?: Buffer };

export function registerSocialRoutes(app: Express) {
  app.get("/api/meta/webhook", (req, res) => {
    const mode = req.query["hub.mode"]; const token = req.query["hub.verify_token"]; const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN && typeof challenge === "string") return res.status(200).send(challenge);
    return res.status(403).json({ error: "Webhook verification failed" });
  });
  app.post("/api/meta/webhook", async (req: RawRequest, res: Response) => {
    const readiness = metaReadiness();
    if (!readiness.hasAppSecret && !readiness.hasInstagramAppSecret) return res.status(503).json({ error: "Webhook signature secret is not configured" });
    if (!verifyMetaSignature(req.rawBody, req.header("x-hub-signature-256") ?? undefined)) return res.status(403).json({ error: "Invalid webhook signature" });
    try { for (const event of normalizeMetaPayload(req.body)) await handleInboundEvent(event); return res.status(200).send("EVENT_RECEIVED"); }
    catch (error) { console.error("[Meta webhook] event processing failed", error); await db.createStaffNotification({ type: "integration_failure", severity: "critical", title: "Meta webhook processing failed", detail: "An incoming social event could not be processed. Review the integration and conversation log.", href: "/integrations" }); return res.status(500).json({ error: "Webhook processing failed" }); }
  });
  const refreshHandler = async (req: Request, res: Response) => {
    if (!isCronAuthorized(req)) return res.status(401).json({ error: "unauthorized" });
    try { return res.json({ ok: true, result: await refreshSocialMetrics() }); }
    catch (error) { await db.createStaffNotification({ type: "integration_failure", severity: "critical", title: "Scheduled metrics refresh failed", detail: "The scheduled social metrics refresh needs staff attention.", href: "/integrations" }); return res.status(500).json({ error: error instanceof Error ? error.message : "Scheduled refresh failed", timestamp: new Date().toISOString() }); }
  };
  // Vercel Cron sends GET; GitHub Actions / curl can use either.
  app.get("/api/scheduled/refresh-social-metrics", refreshHandler);
  app.post("/api/scheduled/refresh-social-metrics", refreshHandler);
}
