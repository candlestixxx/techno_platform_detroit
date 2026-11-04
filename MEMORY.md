# MEMORY.md

Ongoing internal architectural observations:
- Next.js (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL is the stack.
- Jest is used for unit testing (`__tests__/api.test.ts`, `__tests__/aggregator.test.ts`, `__tests__/auth.test.ts`, `__tests__/reviews.test.ts`).
- Playwright is used for E2E testing (`e2e/ui.spec.ts`).
- GitHub Actions CI runner is pinned to `ubuntu-24.04` in `.github/workflows/main.yml` due to Playwright Chromium dependency requirements.
- Mapbox GL API is used for geo-mapping.
- A centralized VERSION.md tracks the current build string (v5.8.0).
- Scrapers are currently heavily mocked but designed to fail gracefully.
- Admin Governance supports unflagging/deletion for both Posts and Events, plus vendor onboarding approval and Expo push broadcast dispatch.
- Business Analytics and Admin Governance are consolidated into `/dashboard` with descriptive tooltips and tiered tabs.
- `scripts/tray_server.py` acts as a multi-mode controller: headless daemon mode for containers and pystray tray UI on desktop workstations.
- Mobile client (`/mobile`) uses React Native with Expo, and interfaces with the API layer via JWT Bearer authentication headers.
- `/api/events/[id]/reviews` supports both NextAuth server sessions and JWT Bearer tokens from mobile clients, verified with unit tests.
