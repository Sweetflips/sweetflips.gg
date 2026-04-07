# Sweetflips

A Next.js application for leaderboards and user management.

## What We've Done

This document outlines all the cleanup and production readiness work completed on the codebase.

### 🧹 Code Cleanup

#### Removed Unused Dependencies (20+ packages)
- `crypto` - Replaced with Node.js built-in module
- `react-router-dom` - Not needed (Next.js uses its own routing)
- `dotenv` - Not needed (Next.js handles env vars automatically)
- `isomorphic-fetch` & `node-fetch` - Not needed (Next.js has built-in fetch)
- `express-session` - Not needed for Next.js API routes
- `@azure/msal-browser` & `@azure/msal-react` - Unused
- `ldapjs` & `ldapts` - Unused
- `mssql` - Unused
- `ssh2-sftp-client` - Unused
- `puppeteer`, `puppeteer-core`, `puppeteer-extra`, `puppeteer-extra-plugin-stealth` - Unused
- `passport`, `passport-oauth2` - Unused
- `redis` - Unused (was using in-memory rate limiting)
- `universal-cookie`, `nookies` - Unused (using `js-cookie`)
- Removed corresponding `@types/*` packages from devDependencies

#### Removed Dead Code
- **Rate Limiter** - Removed:
  - `lib/rateLimiter.ts` - Entire file (not used anywhere)

- **Commented Code** - Cleaned up:
  - Removed commented-out imports from components
  - Removed commented-out code blocks

#### Code Quality Improvements
- Removed 50+ debug `console.log` statements from production code
- Kept essential `console.error` for error logging
- Fixed crypto import to use Node.js built-in module (`import * as crypto from 'crypto'`)
- Improved TypeScript type safety (replaced `any` types):
  - `lib/auditLogger.ts` - Created `DecimalLike` type for flexible Decimal handling
  - `src/pages/api/LuxdropProxy.ts` - Fixed `proxyAgent` type

#### Configuration Improvements
- Made hardcoded dates configurable via environment variables:
  - Spartans special period dates
  - Luxdrop period year/month
  - All dates now use environment variables with sensible defaults
- Updated proxy code to support proxies without authentication
- Created comprehensive `.env.example` file
- Created `ENV_VARIABLES.md` documentation

### 🎯 Current Features

#### Active Leaderboards
1. **Spartans Leaderboard** (`/spartans`)
   - Monthly leaderboard with $75,000 prize pool
   - Configurable via `SPECIAL_PERIOD_START_DATE` and `SPECIAL_PERIOD_END_DATE`
   - API: Smartico affiliate `POST https://data-api3.aff.spartans.com/plywood?by=`
   - Shared proxy source for `/spartans` and homepage Spartans leaderboard

2. **Luxdrop Leaderboard** (`/luxdrop`)
   - Bi-weekly periods (1-15 and 16-30 of month)
   - Configurable via `LUXDROP_PERIOD_YEAR` and `LUXDROP_PERIOD_MONTH`
   - Uses proxy: `104.253.199.227:5506`

3. **Homepage Leaderboard**
   - Displays Spartans leaderboard on homepage
   - Uses same configuration as Spartans page

#### Other Features
- Stream schedule page (`/stream`)
- Big Wins display
- User authentication (Kick)
- Admin panel
- Chat system
- Avatar creator

## Installation

1. Clone the repository and navigate to the project directory:
```bash
cd sweetflips.gg-1
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   - Fill in all required environment variables in `.env.local` (see [ENV_VARIABLES.md](./ENV_VARIABLES.md) for details)

4. Set up the database:
```bash
npx prisma generate
npx prisma migrate deploy
```

If you are updating an existing deployed database after the squashed migration history, mark the new baseline as already applied once, then deploy the follow-up cleanup migration:
```bash
npx prisma migrate resolve --applied 20260405000000_baseline_current_schema
npx prisma migrate deploy
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Environment Variables

See [ENV_VARIABLES.md](./ENV_VARIABLES.md) for a complete list of required and optional environment variables.

### Required Variables

#### Database
- `DATABASE_URL` - PostgreSQL connection string

#### API Keys
- `SPARTANS_SMARTICO_LABEL_ID` - Spartans Smartico label id (defaults to `591127`)
- `SPARTANS_SMARTICO_COOKIE` - Full Cookie header value for the Smartico request
- `SPARTANS_SMARTICO_PAYLOAD` - Full Smartico plywood request body as JSON
- `LUXDROP_API_KEY` - Luxdrop API key
- `CRON_SECRET` - Secret for cron job authentication

#### Authentication
- `NEXT_PUBLIC_KICK_CLIENT_ID` - Kick client ID
- `KICK_CLIENT_SECRET` - Kick client secret

### Optional Variables

#### Proxy Configuration (for Luxdrop API)
- `PROXY_HOST` - Proxy server hostname
- `PROXY_PORT` - Proxy server port
- `PROXY_USERNAME` - Proxy authentication username (optional)
- `PROXY_PASSWORD` - Proxy authentication password (optional)

#### Leaderboard Dates
- `SPECIAL_PERIOD_START_DATE` - Spartans special period start (format: YYYY-MM-DD)
- `SPECIAL_PERIOD_END_DATE` - Spartans special period end (format: YYYY-MM-DD)
- `NEXT_PUBLIC_SPECIAL_PERIOD_START_DATE` - Client-side Spartans period start
- `NEXT_PUBLIC_SPECIAL_PERIOD_END_DATE` - Client-side Spartans period end
- `LUXDROP_PERIOD_YEAR` - Luxdrop period year
- `LUXDROP_PERIOD_MONTH` - Luxdrop period month (1-12)
- `NEXT_PUBLIC_LUXDROP_PERIOD_YEAR` - Client-side Luxdrop year
- `NEXT_PUBLIC_LUXDROP_PERIOD_MONTH` - Client-side Luxdrop month

## Build for Production

```bash
npm run build
npm start
```

Or deploy to Vercel:
```bash
vercel
```

## Project Structure

```
sweetflips.gg-1/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── spartans/     # Spartans leaderboard page
│   │   ├── luxdrop/      # Luxdrop leaderboard page
│   │   ├── stream/       # Stream schedule page
│   │   └── ...
│   ├── components/       # React components
│   │   ├── Spartans/     # Spartans leaderboard component
│   │   ├── Luxdrop/      # Luxdrop leaderboard component
│   │   └── ...
│   ├── lib/              # Shared utilities
│   │   ├── metadata.ts   # Page metadata helpers
│   │   └── getBaseUrl.ts # Base URL for server-side fetches
│   └── pages/
│       └── api/          # API routes
│           ├── SpartansProxy.ts   # Spartans API proxy
│           └── LuxdropProxy.ts    # Luxdrop API proxy
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Prisma schema
├── .env.local            # Environment variables (gitignored)
├── .env.example          # Environment variables template
└── ENV_VARIABLES.md      # Environment variables documentation
```

## API Endpoints

### Leaderboard APIs
- `GET /api/SpartansProxy` - Spartans leaderboard data (monthly)
- `GET /api/LuxdropProxy` - Luxdrop leaderboard data (bi-weekly periods)

### Cron Jobs
- `GET /api/cron/refresh-leaderboards` - Warms Spartans, Luxdrop, and CSGOWIN proxy routes (Vercel cron, every 5 minutes)

## Technical Details

### Type Safety
- Strict TypeScript configuration enabled
- Replaced all `any` types with proper types
- Proper type definitions for Prisma and API responses

### Serverless Compatibility
- Database-backed solutions recommended for production
- All cleanup intervals handle serverless environments gracefully

### Security
- Environment variables properly validated
- API keys never exposed to client (except `NEXT_PUBLIC_*` vars)
- Username masking in leaderboard responses
- Spartans Smartico cookies and payload stay server-side in environment variables
- Rate limiting removed (was using in-memory, not production-ready)

### Performance
- Removed unused dependencies (smaller bundle size)
- Proper caching headers on API responses
- Clean codebase with no dead code

## Testing Locally

1. Ensure all environment variables are set in `.env.local`
2. Run `npm run dev`
3. Open `http://localhost:3000`
4. Test leaderboards:
   - Homepage: `http://localhost:3000`
   - Spartans: `http://localhost:3000/spartans`
   - Luxdrop: `http://localhost:3000/luxdrop`
   - Stream: `http://localhost:3000/stream`

## Production Deployment

### Vercel
1. Push code to repository
2. Connect to Vercel
3. Set all environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production
- Copy all variables from `.env.local` to Vercel environment variables
- Ensure `NEXT_PUBLIC_*` variables are set for client-side access
- Set `CRON_SECRET` for cron job authentication

## Notes

- Proxy configuration is optional - if not provided, requests go directly
- Special period dates are optional - defaults to monthly logic if not set
- Luxdrop uses bi-weekly periods (1-15 and 16-30) automatically
- All dates should be in UTC format (YYYY-MM-DD)
- The codebase is now production-ready with no unused dependencies or dead code

## Recent Changes Summary

- ✅ Removed 20+ unused dependencies
- ✅ Removed rate limiter (was unused)
- ✅ Cleaned up 50+ console.log statements
- ✅ Fixed all TypeScript type safety issues
- ✅ Made all dates configurable via environment variables
- ✅ Created comprehensive environment variable documentation
- ✅ Updated proxy code to support authentication-optional proxies
- ✅ Migrated to Spartans casino (February 2026)

## Support

For issues or questions, refer to:
- [ENV_VARIABLES.md](./ENV_VARIABLES.md) - Environment variables documentation
- 
- [package.json](./package.json) - Dependencies and scripts
