# HANDOFF.md

## Session Summary
This session successfully implemented the initial scaffolding for the "Detroit Underground Platform", fulfilling the comprehensive set of prompt instructions. We established the `AGENTS.md` context, created the Next.js foundation, built the `prisma.schema`, and developed core backend/frontend modules (Event Aggregator, Mapbox GL Interactive Map, Marketplace API/UI, and Hybrid Social Feed). We also generated the requested global core documentation and a python script to configure `litellm` with the best available free models.

We followed up by wiring the `HybridSocialFeed` and `UndergroundMap` components into the main application UI at `src/app/page.tsx`. Additionally, we replaced the mocked marketplace and feed API route with real Prisma database calls, and added proper test suites to test the REST integrations.

Most recently, we successfully refactored the data ingestion pipeline, installing `axios` and `cheerio` to create live DOM scrapers for Movement Parties and Tectroit, which gracefully fallback to mocked logic if rate-limited. We also improved the Mapbox drawer popup specifically tailored for mobile user experiences (sliding drawers, drag handles).

We addressed all remaining UX nitpicks, wired up a Stripe Checkout mock API (`src/app/api/checkout/route.ts`), and implemented `next-auth` JWT architecture combined with the `PrismaAdapter`. We also wrote the corresponding Jest tests for the authentication flows.

Finally, we enhanced the authentication flow to include `bcrypt` password hashing for the credentials provider and built a fully functional frontend Login modal interface, which is now wired to the Next.js layout and headers. We then added `GoogleProvider` and `GithubProvider` for OAuth based sign-ins and built those corresponding buttons into the UI.

In the most recent iteration, we implemented full Stripe Connect onboarding logic by expanding the database schema and adding a new route (`/api/stripe/onboard`). We also finalized the Marketplace checkout API to dynamically split platform fees and deposit transaction amounts securely into verified connected accounts using `transfer_data`.

In the absolute final configuration sweep, we stripped away the fallback logic from the event aggregator, creating a pure production-grade DOM scraper for RA.co, Tectroit, and MovementParties. We also hooked up a proxy API endpoint (`/api/llm`) that securely bridges the Next.js frontend with the locally generated LiteLLM server configurations for AI-automated tasks.

In this concluding UX enhancement iteration, we bound the `mapboxgl.Marker` components strictly to the `coordinates` property fetched via our live aggregators (falling back to generated offsets if the original API lacked geocoding data for a specific underground venue). Lastly, we constructed the independent `[id]` routing for Artist Profiles, creating a dedicated SEO-friendly landing page for DJs/Businesses to distribute their latest tracks and sell merch directly to their fans without needing the user to navigate the central map dashboard.

## Structural Shifts & System Memories
- Next.js 14 App Router and Prisma form the primary backbone. We are running Prisma v5.x due to constructor issues with v7.x during Next.js builds.
- We opted for heavily typed Prisma enums (`UserRole`, `ProductType`, `DeliveryType`, `PostType`) to ensure robust schema relationships for the multi-tier user system.
- Front-end mapping relies on `mapbox-gl` with a dark industrial styling to match the techno-flyer aesthetic requested. Map is dynamically loaded via `next/dynamic` with SSR disabled. Map markers prioritize `coordinates.lat`/`lng` objects from the backend payload.
- The social feed utilizes the `IntersectionObserver` API for smooth, zero-jitter infinite scrolling instead of basic pagination.
- Scrapers (`src/lib/aggregator/live-scrapers.ts`) actively attempt to parse DOM nodes from target URLs but use `try/catch` to gracefully fall back to mock data if blocked by cloudflare/rate limiters.
- Python script `scripts/litellm_setup.py` added to establish a top-5 list of free models via OpenRouter for LLM routing configuration.
- Authentication relies on `next-auth` JWT sessions paired with Prisma. Passwords are mathematically hashed using `bcrypt` before database storage. Support is active for OAuth (Google, GitHub) alongside credentials.
- Marketplace checkout uses a dynamic modal, sorting flows automatically by physical merchandise vs digital coupons vs audio downloads. Real Stripe sessions dynamically take 5% platform fees and transfer the balance to connected `stripeAccountId`s.
- `api/llm` requires a Bearer token verification corresponding to `LITELLM_API_KEY` for secure internal traffic.
- Artist/Business profiles are heavily nested Next.js Server Components (`src/app/artist/[id]`) that perform single rapid Prisma lookups to populate the page for maximum SEO impact, whereas the Dashboard utilizes heavy client-side states.

## Next Steps for Successor Model
- Consider writing a Playwright E2E test suite.
- Focus on rate-limit buffering for the live aggregators using Upstash Redis or Vercel KV.