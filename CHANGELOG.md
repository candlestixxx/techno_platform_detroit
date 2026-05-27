# CHANGELOG.md

## v1.0.0 (Current)
- Prepared final V1 release structure for Detroit Underground.
- Refactored internal API route ES6 imports to strict top-of-file guidelines to resolve final code review nitpicks.

## v0.9.0
- Added authenticated POST endpoint for users to create new feed broadcasts in `/api/feed/route.ts`.
- Integrated a real-time post creation form UI exclusively visible to authenticated users in `HybridSocialFeed.tsx`.

## v0.8.0
- Prepared repository for Vercel production deployment (`DEPLOY.md`).
- Implemented GitHub Actions CI workflow to run tests, linting, and builds automatically.

## v0.7.0
- Configured Edge Caching Headers (`Cache-Control`) on aggregate API endpoints to prevent rate limit blocks.
- Setup Playwright End-to-End browser UI testing suite.

## v0.6.0
- Upgraded `UndergroundMap.tsx` marker placement to explicitly utilize the `event.coordinates` property queried from the live scraping APIs.
- Built independent frontend profile routing (`/artist/[id]`) for specific Artists/Businesses to showcase their posts and marketplace products.

## v0.5.0
- Removed fallback mock scrapers, fully relying on `axios`/`cheerio` live DOM parsing for production event aggregators.
- Implemented `/api/llm` API route proxy intended to interface with the locally configured `litellm` python instance for data summarizations and venue analytics.

## v0.4.0
- Added Stripe Connect Onboarding API (`/api/stripe/onboard`).
- Finalized Stripe Checkout API to distribute platform fees and transfer payments to connected `stripeAccountId`.
- Updated User Prisma schema to support `stripeAccountId`.

## v0.3.0
- Configured Google and GitHub OAuth providers within `next-auth`.
- Updated authentication UI with OAuth login buttons.

## v0.2.0
- Implemented live HTML scrapers (Axios/Cheerio) and RA.co GraphQL fetcher.
- Optimized Mapbox UI for mobile devices (drag handles, sliding drawers).
- Implemented Stripe Checkout flow mock API.
- Implemented `next-auth` JWT architecture for User/Artist profiles.
- Resolved Next.js SSR crashes with dynamic Mapbox loading.
- Bumped and purged Prisma back to v5.x due to build constructor errors in v7.

## v0.1.0
- Scaffolding of Next.js architecture.
- Implementation of Prisma Schema.
- Creation of Mapbox interactive component.
- Creation of Hybrid Social Feed.
- Implementation of Market Place UI and API route.
- Creation of Mock Aggregator framework and tests.
- Creation of global documentation (VISION, MEMORY, DEPLOY, IDEAS, ROADMAP, TODO).
