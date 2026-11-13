# Detroit Underground (techno_platform_detroit)

A platform for the Detroit techno / underground music scene: events,
ratings and reviews, a unified hub dashboard, and a companion mobile app.

Stack: Next.js 16 / React 19, Prisma (PostgreSQL), NextAuth, Stripe,
Socket.io, Mapbox, web-push. A Python system-tray daemon
(`scripts/tray_server.py`) manages the local server. Mobile app lives in
`mobile/` (Expo).

## Status

**Active.** Version 5.8.0. Last activity: 2026-11-12 (forward-merge of the
v5.8.0 branch — reviews unit tests and mobile parity — plus a CHANGELOG
history restore). Recent work: mobile event-ratings parity (v5.7.0),
unified hub dashboard and system-tray daemon (v5.6.0).

Note: the previous README was the stock `create-next-app` boilerplate and
described nothing about this project. This revision replaces it.

## What's working

Per recent commit history and the codebase:

- Event ratings and reviews, with unit tests.
- Mobile app parity with the web dashboard.
- Unified hub dashboard.
- System tray daemon for local server management (`npm run tray`).
- Jest unit tests and Playwright e2e tests exist in-repo.

## What's not verified

- No live deployment is confirmed in the repo. A `vercel.json` exists,
  but no production URL or deployment status is documented.
- No users, revenue, or real-world usage is on record.

## Quick Start

```bash
npm install
npm run dev        # starts the custom server (server.js)
```

Other commands:

```bash
npm test           # Jest
npm run build && npm start   # production build
npm run tray       # system tray daemon
npm run server:status        # daemon status
```

## Links

- Repo: https://github.com/candlestixxx/techno_platform_detroit
- Related docs in-repo: `CHANGELOG.md`, `ROADMAP.md`, `TODO.md`,
  `DEPLOY.md`, `HANDOFF.md`, `VISION.md`
