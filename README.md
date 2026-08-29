# WAYF

When are you free? A no-account meetup scheduler. Pick a name, share a link, mark the days you can do. Overlaps get a check.

Live today at [wayf.vercel.app](https://wayf.vercel.app). This repo is a rewrite onto React Router 7 and Cloudflare Workers. Existing `/m/:id` links keep working against the same Neon `meet` table.

## Product

- `/` — name the meetup and create it
- `/m/:id` — who's free on which days (`:id` is `meet.external_id`)
- `/m/:id/avails` — enter a name, or pick an existing one to edit
- `/m/:id/avails?group=Name` — multi-select calendar, then Save

Identity is the name you type. There are no accounts, no time-of-day slots, no auth.

`availabilities` is JSONB keyed by participant name:

```json
{ "Alex": [{ "day": "2026-08-30" }] }
```

## Local development

```sh
npm install
cp .dev.vars.example .dev.vars
# put a Neon DATABASE_URL in .dev.vars
npm run dev
```

That is `react-router dev` (Vite) running your server code in the Workers runtime via `@cloudflare/vite-plugin`. Open http://localhost:5173.

`npx wrangler dev` also works after a build (`npm run build && npx wrangler dev`). Day to day, use `npm run dev`.

The Worker uses `@neondatabase/serverless` over HTTP. A `postgresql://postgres@localhost` URL from docker-compose will not work here. Point `.dev.vars` at Neon (a branch is fine).

```sh
npm run typecheck
npm run lint
npm run build
```

## Deploy to Cloudflare

Do not put `DATABASE_URL` in `wrangler.jsonc` or in git.

```sh
npx wrangler login
npx wrangler secret put DATABASE_URL
npm run deploy
```

`npm run deploy` runs `react-router build` then `wrangler deploy`. That overwrites the existing account Worker named `wayf` (id `e5e1317519674e49aaab82528e6ab10a`).

Public hosts already attached to that Worker:

- https://wayf.andrew-37e.workers.dev
- https://wayf.grainlabs.co

`wrangler.jsonc` keeps both (`workers_dev` + custom domain). Do not point `wayf.vercel.app` at these until you want the cutover.

Optional later: Cloudflare Hyperdrive in front of Neon. Not required. Neon HTTP does not open a TCP `pg` connection per request, which is the thing the old Remix/Vercel setup was doing.

## Vercel redirect

Keep the Vercel project. `wayf.vercel.app` should 308 to the Workers host once that hostname exists.

1. Replace `YOUR-WORKERS-HOST.example.workers.dev` in `vercel.json` with the real Workers URL (no `https://` change needed beyond the hostname).
2. In the Vercel project, set Framework Preset to Other so it does not try to build this as a Node Remix app. `vercel.json` already no-ops the build and only serves redirects.

Do not delete the Vercel project. Old bookmarks and the current production host need that 308.

## What changed from Remix 2

The old app created a new `node-postgres` client on every query (`drizzle(process.env.DATABASE_URL)` with no pool) from Vercel serverless, then talked to Neon. Homepage HTML was uncached. Leftover unused Supabase repository code and a one-off migrate script sat next to the live Drizzle path. Sentry sourcemaps were wired into `remix build`.

This rewrite:

- SSR on Cloudflare Workers (official Vite plugin path, not Pages)
- Neon via HTTP (`drizzle-orm/neon-http`), same schema
- Homepage GET is static: no Neon, no session. Cached at the edge (`caches.default`) keyed by the production build id and hashed CSS URL. Browsers get `max-age=0, must-revalidate` so a reload after deploy cannot keep HTML that points at deleted `/assets/*` files.
- Neon HTTP client is reused per Worker isolate. Create and save availability are one query each, then redirect
- Dead Supabase, Remix Node server, Sentry upload, and Vercel analytics removed
