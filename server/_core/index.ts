import { createServer } from "http";
import net from "net";
import { seedInitialFaqs } from "../social/seed";
import { createApp } from "./app";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> { return new Promise(resolve => { const server = net.createServer(); server.listen(port, () => server.close(() => resolve(true))); server.on("error", () => resolve(false)); }); }
async function findAvailablePort(startPort = 3000): Promise<number> { for (let port = startPort; port < startPort + 20; port += 1) if (await isPortAvailable(port)) return port; throw new Error(`No available port found starting from ${startPort}`); }

// Standalone server (local development, Docker, VPS). Vercel uses server/vercel.ts instead.
async function startServer() {
  const app = createApp(); const server = createServer(app);
  try { await seedInitialFaqs(); } catch (error) { console.warn("[FAQ seed] Deferred until database is available", error instanceof Error ? error.message : error); }
  if (process.env.NODE_ENV === "development") await setupVite(app, server); else serveStatic(app);
  const preferredPort = parseInt(process.env.PORT || "3000", 10); const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  server.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
}
startServer().catch(console.error);
