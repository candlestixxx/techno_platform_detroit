# MEMORY.md

Ongoing internal architectural observations:
- Next.js (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL is the stack.
- Jest is used for unit testing; Playwright for E2E testing.
- Mapbox GL API is used for geo-mapping.
- A centralized VERSION.md tracks the current build string (v5.6.0).
- Scrapers are currently heavily mocked but designed to fail gracefully.
- Admin Governance supports unflagging/deletion for both Posts and Events, plus vendor onboarding approval and Expo push broadcast dispatch.
- Business Analytics and Admin Governance are consolidated into `/dashboard` with descriptive tooltips and tiered tabs.
- `scripts/tray_server.py` acts as a multi-mode controller: headless daemon mode for containers and pystray tray UI on desktop workstations.
- Limited Vinyl products support mock blockchain minting (ethers.js) via the Artist Profile.
- Playwright discovery: Tectroit events can be successfully extracted by targeting Wix-specific data attributes and parsing multi-line text blocks.
