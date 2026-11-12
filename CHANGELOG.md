# CHANGELOG

## [v5.8.0]
- **Event Reviews Unit Test Suite:** Implemented `__tests__/reviews.test.ts` providing rigorous unit test coverage for `GET` and `POST` routes on `/api/events/[id]/reviews`.
- **Edge Case & Security Testing:** Added automated test assertions for missing/invalid rating scores (out of range, non-integer), unauthorized access responses (401), missing event entity errors (404), NextAuth web session resolution, and mobile JWT Bearer token authorization.
- **Mobile Platform Testing Parity:** Validated authenticated review payloads transmitted from both web and React Native mobile clients.

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

## [v4.6.0]
- Added message composition UI to the mobile application `FeedScreen.js`.
- Expanded `/api/feed` `POST` route to extract and verify mobile JWT Bearer tokens.

## [v4.5.0]
- Synced mobile application `ProfileScreen.js` to allow native profile editing (Name, Role).
- Expanded `/api/profile` `PUT` route to support decoding JWT Bearer tokens from mobile clients.

## [v4.4.0]
- Added backend checkout integration and browser deep-linking logic to the Mobile Marketplace Screen (`mobile/src/screens/MarketplaceScreen.js`).

## [v4.3.0]
- Installed `react-native-maps` into the Expo mobile application (`/mobile`).
- Updated `MapScreen.js` to render a native interactive map displaying live event coordinates.

## [v4.2.0]
- Added Edge Caching headers (`Cache-Control: public, s-maxage=60, stale-while-revalidate=120`) to `/api/events` and `/api/feed` to mitigate rate-limiting.
- Initiated Phase 4: Optimization and Polish.

## [v4.1.0]
- Added `expo-server-sdk` for sending mobile push notifications.
- Created `/api/push/expo-send` route to broadcast notifications.
- Integrated Expo Push Notifications broadcast UI into the Admin Governance dashboard.

## [v4.0.0]
- Resolved upstream merge conflicts via intelligent branching.
- Synced local repository with remote tracking upstream changes.
- Updated documentation and incremented project version.

## [v3.1.0]
- Added Expo Push Notification registration endpoint (`/api/push/expo-register`).
- Added `expoPushToken` to Prisma schema.
- Finalized Phase 3 roadmap tasks.

## [v3.0.0]
- Implementing mobile authentication utilizing JWTs.

## [v2.3.0]
- Connected React Native mobile app screens (Marketplace, Profile) to the Next.js API layer.
- Added mock JWT bypass logic to the React Native profile screen for local scaffolding without NextAuth web cookies.

## [v2.2.0]
- Connected React Native mobile app screens (Feed, Map) to the Next.js API layer.
- Finalized Phase 2 roadmap tasks.

## [v2.1.0]
- Setup React Navigation bottom tabs in the Expo mobile app.

## [v2.0.0]
- Initializing React Native Expo mobile wrapper in the `/mobile` directory to interface with the Next.js API.

## [v1.9.0]
- Added Admin Governance dashboard and backend routes.
- Added blockchain integration (ethers.js mock) for limited vinyl minting.

## [v1.8.0]
- Added Dynamic Native Ticketing (simulated Stripe checkout).
- Updated user profile to surface generated QR codes for event tickets.

## [v1.7.0]
- Added AI Recommendation Agent using LiteLLM.

## [v1.6.0]
- Migrated event chat from short-polling to socket.io WebSockets via custom server.js.

## [v1.4.0]
- Added User Profile tracking interface for Subscriptions and Promo claims.

## [v1.3.0]
- Implemented Push Notifications via Service Workers.

## [v1.2.0]
- Added Artist Subscriptions & Business Analytics Dashboard.

## [v1.1.0]
- Setup Next.js, Mapbox, Hybrid Social Feed, Marketplace Mock, Aggregator Scrapers.
