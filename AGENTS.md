# Agent house rules

This repo is WAYF (When are you free?).

## Screenshots

Prefer [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser) (`open` → viewport → `screenshot`) for visual proof.

Fallback: Cursor walkthrough or computerUse when agent-browser is unavailable or the surface is not a normal webpage.

Never use `google-chrome`, `chromium`, `chromium-browser`, or headless Chrome or Chromium CLI (`--headless`, `--screenshot`, and similar) as the primary screenshot path. Do not install or launch Chrome in the cloud agent sandbox just to capture a page.

If agent-browser and walkthrough or computerUse are blocked once, stop. Open or update the PR and hand shots to WAYF Dev or Andrew. Do not fall back to Chrome CLI.

Prefer build, typecheck, and HTTP smoke over screenshots when pixels are not required.

## Models

House CloudAgent / coding parent default:

- model: grok-4.7
- Fast off (fast=false)
- reasoning_effort=high

Nested pstack and poteto agents inherit the parent model (`inherit-parent`). Do not let Fast or xhigh override that parent.

## Tests

`npm test` runs the unit tests and the route tests. The route tests open a temporary Postgres database in the test process and apply the Drizzle schema. They do not read a Neon `DATABASE_URL`.

`npm run test:e2e` runs the browser tests. That command starts a local server on the same kind of database. Install the browser once with `npx playwright install chromium`.

GitHub Actions runs lint, typecheck, build, and `npm test` on the GitHub runner. The browser tests run in `mcr.microsoft.com/playwright:v1.64.1-noble`, the image published for the locked `@playwright/test` version. The workflow does not deploy. Screenshot comparison allows no differing pixels. A failed browser job uploads the diff images.

Update visual baselines from that same image. A desktop browser will not match CI.

With Docker:

```
docker run --rm --ipc=host -v "$PWD":/work -w /work -e PLAYWRIGHT_BROWSERS_PATH=/ms-playwright -e PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 mcr.microsoft.com/playwright:v1.64.1-noble bash -lc "npm ci && npx playwright test --update-snapshots"
```

Without Docker, run the CI workflow on the branch and set "update snapshots" to true. That job rewrites the png files in the image above and commits them. Committing a file named `e2e/UPDATE_SNAPSHOTS` asks the same job to rewrite the baselines, delete that file, and commit. Keep the image tag on the locked `@playwright/test` version.
