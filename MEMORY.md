# MEMORY.md

Ongoing internal architectural observations:
- Next.js (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL is the stack.
- Jest is used for unit testing.
- Mapbox GL API is used for geo-mapping.
- A centralized VERSION.md tracks the current build string.
- Scrapers are currently heavily mocked but designed to fail gracefully.
- Admin Governance supports unflagging/deletion for both Posts and Events.
- Limited Vinyl products support mock blockchain minting (ethers.js) via the Artist Profile.
- Playwright discovery: Tectroit events can be successfully extracted by targeting Wix-specific data attributes and parsing multi-line text blocks.
