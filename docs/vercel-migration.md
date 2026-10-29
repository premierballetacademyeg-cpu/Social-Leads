# Moving Social Desk from Manus to v0 / Vercel

## What changed in the code
| Area | Before (Manus) | Now |
|---|---|---|
| Staff login | Manus OAuth | `/login` page, email + password (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, optional `STAFF_ACCOUNTS`), signed cookie (`JWT_SECRET`) |
| Scheduled metrics refresh | Manus heartbeat job | Vercel Cron → `/api/scheduled/refresh-social-metrics`, protected by `CRON_SECRET` |
| Notifications | in-app + ntfy push | in-app only: bell + banner across the top for unread warning/critical items |
| Hosting entry | `server/_core/index.ts` | `server/vercel.ts` bundled to `api/index.mjs` by `pnpm build:vercel`; client built to `public/` |
| FAQs | 10 (2 Summer Intensive) | 8 live (EN/AR); PSI archived; "Sync official FAQs" button in FAQ Library |
| Branches | Maadi, New Cairo | + Sheikh Zayed in escalation replies |
| Removed | Manus runtime/debug plugins, unused LLM/image/voice/map/storage helpers, ntfy | – |

The database schema is unchanged: keep the same `DATABASE_URL`.

## Environment variables (Vercel → Project → Settings → Environment Variables)
Copy every existing `META_*`, `BROWSER_USE_*` and `DATABASE_URL` value from Manus unchanged, then add:

| Name | How to get it |
|---|---|
| `JWT_SECRET` | 32+ random characters |
| `ADMIN_EMAIL` | staff login email |
| `ADMIN_PASSWORD_HASH` | `pnpm hash-password "your password"` |
| `STAFF_ACCOUNTS` (optional) | `[{"email":"x@y.com","hash":"scrypt$..."}]` |
| `CRON_SECRET` | 16+ random characters (Vercel sends it automatically on cron calls) |

Remove: `OWNER_OPEN_ID`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `BUILT_IN_FORGE_*`, `NTFY_*`.
Keep `META_SEND_ENABLED` OFF until the preview checks pass.

## Project settings
Framework preset **Other**. `vercel.json` already sets install/build commands, output folder and routing.

**Scheduled refresh on the Hobby plan:** Vercel Cron runs once a day, so the work is split. Vercel Cron does 07:00 UTC (in `vercel.json`); the GitHub Actions workflow `.github/workflows/metrics-refresh.yml` does 13:00 and 19:00 UTC. Add the repo secrets `APP_URL` and `CRON_SECRET` (same value as on Vercel). Cron jobs run on **production** deployments only.

## After deploying
1. Sign in at `/login`.
2. FAQ Library → **Sync official FAQs** (once).
3. Integrations → confirm all checks are green and "Schedule secret is configured".
4. Cut over per the action plan (update the Meta webhook URLs, then enable `META_SEND_ENABLED`).

`docs/meta-business-verification.md` is a historical record and still mentions the old manus.space URLs.
