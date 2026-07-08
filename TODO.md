# TODO.md

Granular immediate tasks:
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
