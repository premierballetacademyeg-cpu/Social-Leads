import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { registerSocialRoutes } from "../social/routes";
import { registerAuthRoutes } from "./auth";
import { createContext } from "./context";

/** Builds the Express app (API only). Shared by the Vercel entry and the standalone server. */
export function createApp() {
  const app = express();
  app.use(express.json({ limit: "50mb", verify: (req, _res, buffer) => { (req as express.Request & { rawBody?: Buffer }).rawBody = Buffer.from(buffer); } }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerAuthRoutes(app);
  registerSocialRoutes(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  return app;
}
