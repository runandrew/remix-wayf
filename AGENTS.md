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
