# Scripts Catalog

This directory houses maintenance, operational, and daemon automation utilities for Detroit Underground Hub.

## Active Utilities:
- `check_db.ts`: Direct Prisma diagnostic utility for checking user counts and database health.
  Usage: `npx ts-node scripts/check_db.ts`
- `seed_admin.ts`: Seeds the initial Administrator, demo flagged posts, events, and business applicants.
  Usage: `npx ts-node scripts/seed_admin.ts`
- `run_sync.ts`: Triggers the Resident Advisor and Tectroit live event synchronization pipelines.
  Usage: `npx ts-node scripts/run_sync.ts`
- `litellm_setup.py`: Fetches and validates OpenRouter LLM providers for the recommendation proxy.
  Usage: `python3 scripts/litellm_setup.py`
- `tray_server.py`: Background system tray & server management daemon. Supports checking status, viewing PIDs, and quitting all running processes gracefully.
  Usage:
    - Status: `npm run server:status` or `python3 scripts/tray_server.py --status`
    - Stop/Quit: `npm run server:stop` or `python3 scripts/tray_server.py --stop`
    - Tray / Monitor: `npm run tray` or `python3 scripts/tray_server.py`

## Archive (`scripts/archive/`):
- `test_playwright.ts`: One-off standalone Playwright scraper exploration script.
- `test_tectroit.ts`: One-off DOM selector extraction experiment for Tectroit Wix layout.
