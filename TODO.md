# TODO.md

**Phase 4 Optimization and Polish is complete.** All structural features and integration checkpoints have been cleared.

Granular immediate tasks:
- [x] Declare Gold Master.
- [x] Integrate Mobile Feed posting logic with the `/api/feed` backend.
- [x] Sync Mobile Profile UI logic with the `/api/profile` backend.
- [x] Implement Mobile Marketplace deep-linking checkout integration logic.
- [x] Implement `react-native-maps` visualization in the Mobile Map Screen.
- [x] Implement Edge Caching headers for Feed and Events API.
- [x] Integrate Expo Push Notification sending logic (`expo-server-sdk`) with Admin Dashboard.
- [x] Add `isAdmin` and `isApproved` flags to Prisma User model.
- [x] Add `isFlagged` flag to Prisma Post and Event models.
- [x] Create `/admin` frontend dashboard with moderation tables (Extended to include Flagged Events).
- [x] Install `ethers` library for mock blockchain integration.
- [x] Add `/api/blockchain/mint` to simulate limited vinyl NFT creation (Accessible via Artist Profile).
- [x] Implement actual live scrapers for Resident Advisor and Tectroit (RA.co integrated into Feed; Tectroit verified via Playwright).
- [x] Connect Stripe webhooks for automated artist payout splitting.
- [x] Implement unified social/event feed (HybridSocialFeed).
- [x] Add profile editing and professional role selection.
- [x] Connect all navigation buttons and ensure auth flow is seamless.
