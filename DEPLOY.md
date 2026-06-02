# DEPLOYMENT GUIDE

## Phase 4: Production Containerization

The Detroit Underground Hub has evolved beyond Vercel serverless edge compatibility due to the implementation of a custom Next.js `server.js` wrapper which powers long-running real-time Socket.io WebSockets.

To deploy the application securely and scalably, it must now be orchestrated via Docker.

### Requirements
- Docker
- Docker Compose

### Startup
1. Ensure your `.env` variables are correctly mapped inside your hosting environment (Stripe, VAPID, NextAuth Secret, Database URL).
2. From the root repository, execute:
   ```bash
   docker-compose up --build -d
   ```
3. The cluster will spin up a fresh PostgreSQL `15-alpine` database and the Next.js `standalone` production build, mapping traffic to port `3000`.

### Database Migrations
Once the cluster is running, you must synchronize the Prisma schema into the new PostgreSQL container:
```bash
docker-compose exec web npx prisma migrate deploy
```

### Scraping Cron Jobs
Because the system is no longer hosted on Vercel, the `vercel.json` cron architecture is inactive. You must setup a system-level cron job on your host machine to periodically ping the aggregation route:
```bash
0 2 * * * curl -X GET http://localhost:3000/api/cron/sync-events -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### CI/CD Integration
The `.github/workflows/main.yml` pipeline has been updated to automatically verify the `Dockerfile` build on every PR. In a production environment, this workflow should be extended to push the validated image to a registry (e.g., AWS ECR or Docker Hub) and trigger a deployment webhook on your target VPS.
