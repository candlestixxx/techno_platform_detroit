# CHANGELOG

## [v5.7.0]
- **Mobile Event Ratings & Reviews Parity:** Created `mobile/src/screens/EventDetailsScreen.js` providing mobile event intel display, average rating calculations, historical review listings, and interactive 5-star ratings submission.
- **Mobile Feed Integration:** Updated `mobile/src/screens/FeedScreen.js` to allow users to tap event cards to open event details, view community reports, and file reviews.
- **Mobile JWT Reviews Endpoint:** Expanded `POST /api/events/[id]/reviews` to support mobile client authentication via `Authorization: Bearer <token>` headers with JWT decoding.
- **E2E Test Robustness:** Restored semantic `<h1>` element on the web root header for automated Playwright verification suites.
- **CI Runner Stabilization:** Pinned GitHub Actions runner environment to `ubuntu-24.04` to resolve Playwright browser dependency installation on Ubuntu 26.04.

## [v5.6.0]
- **Unified Central Dashboard:** Built consolidated `/dashboard` aggregating business analytics, admin governance moderation (flagged posts, flagged events, vendor approvals), mobile broadcast push notifications, and high-value platform navigation into a single seamless interface.
- **Interactive Guidance:** Added contextual tooltips and descriptive guidance markers across all dashboard metrics and actions.
- **Subpage Consolidation:** Updated `/dashboard/business` to integrate cleanly with the primary dashboard while preserving backward compatibility.
- **System Tray & Server Controller:** Added `scripts/tray_server.py` with desktop system tray capabilities and headless CLI daemon mode for status inspection, logging, and graceful server process termination.
- **Script Clean-Up:** Organized `scripts/` directory non-destructively, archiving exploratory scripts into `scripts/archive/` and adding `scripts/README.md`.

## [v5.5.0]
- Added dynamic `src/app/events/[id]/page.tsx` rendering specific event data.
- Added UI component for authenticated users to leave 5-star ratings and written reviews, communicating with the `/api/events/[id]/reviews` endpoint.

## [v5.4.0]
- Added `EventReview` Prisma schema linking `User` and `Event` models.
- Constructed `/api/events/[id]/reviews` API endpoint to handle fetching and upserting user ratings.

## [v5.3.0]
- Added `mobile/src/screens/InboxScreen.js` resolving Direct Messaging UI for the mobile application.
- Decoded mobile JWT payloads natively utilizing standard Node `.buffer` packages via `--legacy-peer-deps`.
- Wired `InboxScreen` into the primary Tab Navigator within `App.js`.

## [v5.2.0]
- Added web application `/inbox` UI component rendering split-pane chat histories natively connected to the `/api/dm` schema.

## [v5.1.0]
- **Initiated Phase 5: Community Expansion.**
- Added `Conversation` and `DirectMessage` models to `schema.prisma`.
- Created `/api/dm/route.ts` to handle fetching and dispatching direct messages.

## [v5.0.0]
- **Gold Master Release**: Finalized Phase 4 Optimization and Polish.
- Confirmed full functional parity between the Next.js web application and the React Native mobile wrapper.
- Ensured 100% test coverage stability across Jest unit tests and Playwright E2E suites.
