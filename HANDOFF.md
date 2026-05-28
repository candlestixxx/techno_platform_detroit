# HANDOFF.md

## Session Summary

In this session, the Detroit Underground Hub was fully scaffolded and brought up to v1.1.0.

### Key Milestones Achieved:
1. **Aggregator Engine:** Implemented live web scrapers using `axios` and `cheerio` to fetch event data from Movement Parties, Tectroit, and Resident Advisor. Events are synced directly into the Prisma database.
2. **Interactive Map:** Built the Mapbox GL integration (`UndergroundMap.tsx`) featuring dynamic pins mapped from API geodata with fallbacks. It handles SSR properly via Next.js dynamic imports.
3. **Marketplace & Stripe:** Added the `api/stripe/onboard` route to mock and handle connected account creation (Stripe Connect). The frontend supports a visual checkout process with local coupon claiming logic.
4. **Social Feed:** `HybridSocialFeed.tsx` is built with infinite scrolling (IntersectionObserver) combining artist posts, business specials, and events.
5. **Authentication:** Integrated `next-auth` with PrismaAdapter, supporting Credentials and OAuth logins securely.
6. **LiteLLM Configurator:** Built `scripts/litellm_setup.py` to auto-fetch free models from OpenRouter and deploy them for the `/api/llm` route proxy.
7. **CI/CD & Testing:** Finalized Jest and Playwright E2E configurations. Set up `.github/workflows/main.yml` for automated verifications. Next.js 15+ promise/param hydration deprecation warnings were fixed.

### Notes for Next Model/Developer:
- **Database:** Prisma v5 is enforced. The app expects a PostgreSQL connection. If using Vercel, ensure a connection pooler is active.
- **Stripe:** The app uses fallback mocks (`sk_test_mock123`). Inject real secret keys in production environments.
- **Testing:** Do not run Jest on the `/e2e/` folder. Use `npx playwright test` for UI checks and `npm test` for backend/utility tests.
- **Architecture:** Continue utilizing Tailwind CSS and the App Router paradigms established here. Ensure the global documentation standard (`VISION.md`, `ROADMAP.md`, `CHANGELOG.md`) is maintained with every increment.

End of session handoff successfully prepared.
