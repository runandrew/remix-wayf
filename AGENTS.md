# Agent house rules

This repo is WAYF (When are you free?).

## Screenshots

Never use `google-chrome`, `chromium`, `chromium-browser`, or headless Chrome CLI (`--headless`, `--screenshot`, and similar flags) for UI proof.

Prefer Cursor walkthrough or computerUse. If blocked once, stop. Open or update the PR and hand shots to WAYF Dev or Andrew. Do not fall back to Chrome CLI.

Prefer build, typecheck, and HTTP smoke over screenshots when pixels are not required.

Nested pstack and poteto agents inherit the parent model (`inherit-parent`). Do not let Fast or xhigh override parent grok-4.6 medium with Fast off.
