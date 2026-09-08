# CHANGELOG

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
