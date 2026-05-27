# DEPLOY.md

Latest deployment and environment setup instructions for Vercel.

## Local Development
1. Ensure Node.js 18+ and npm are installed.
2. Install dependencies: `npm install`
3. Configure PostgreSQL database and set `DATABASE_URL` in `.env`.
4. Run migrations: `npx prisma migrate dev`
5. Generate Prisma Client: `npx prisma generate`
6. Build project: `npm run build`
7. Start server: `npm start`

## Vercel Production Deployment

### 1. Database Connection Pooling
Serverless functions (like Vercel Edge/Node functions) can exhaust database connections rapidly. You **must** utilize a connection pooler.
- If using **Supabase**: Use the Transaction pooler URL (runs on port 6543) for `DATABASE_URL`, and append `?pgbouncer=true`. Keep the direct connection URL (port 5432) for `DIRECT_URL`.
- If using **Prisma Accelerate**: Replace standard connection string with your Accelerate URL.

### 2. Required Environment Variables
Add these to your Vercel Project Settings:
- `DATABASE_URL`: Connection string (with pooling configured).
- `DIRECT_URL`: Direct database connection for running schema migrations during build.
- `NEXT_PUBLIC_MAPBOX_TOKEN`: Active Mapbox GL API key.
- `NEXTAUTH_SECRET`: Random 32+ character string (generate via `openssl rand -base64 32`).
- `NEXTAUTH_URL`: The canonical URL of your Vercel deployment (e.g., `https://detroit-underground.vercel.app`).
- `STRIPE_SECRET_KEY`: Active Stripe secret key (start with `sk_test_` during staging).
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From Google Cloud Console OAuth setup.
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: From GitHub Developer Settings.

### 3. Build Configuration
Vercel should automatically detect Next.js.
- **Build Command**: `npx prisma generate && npx prisma migrate deploy && next build`
- **Install Command**: `npm install`
