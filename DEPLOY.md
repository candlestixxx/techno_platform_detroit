# DEPLOY.md

Latest deployment and environment setup instructions.

1. Ensure Node.js 18+ and npm are installed.
2. Install dependencies: `npm install`
3. Configure PostgreSQL database and set `DATABASE_URL` in `.env`.
4. Run migrations: `npx prisma migrate dev`
5. Set `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env` for Mapbox functionality.
6. Build project: `npm run build`
7. Start server: `npm start`
