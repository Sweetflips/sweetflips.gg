# Environment Variables

This document lists all required and optional environment variables for the Sweetflips application.

## Required Environment Variables

### Database
- `DATABASE_URL` - PostgreSQL database connection string (used by Prisma)
  - When using Vercel Postgres, this should be set to `POSTGRES_PRISMA_URL` (includes connection pooling)
  - For migrations, use `POSTGRES_URL_NON_POOLING` if available

### API Keys

#### Spartans API (Nexus Campaign Hub)
- `API_KEY_SWEET_FLIPS` - API key for x-api-key header (preferred; falls back to `SPARTANS_API_KEY`)
- `SPARTANS_API_KEY` - Legacy API key (fallback if `API_KEY_SWEET_FLIPS` not set)
- `BASE_SPARTANS_API_URL` - Not used by proxy (kept for reference only; proxy uses hardcoded endpoint for affiliateId 527938 / campaignId 20499)
- `SPARTANS_REFERRAL_CODE` - Referral code used in API requests (default: "SweetFlips")
- `NEXT_PUBLIC_SPARTANS_REFERRAL_CODE` - Referral code for client-side components (default: "SweetFlips")
- `NEXT_PUBLIC_SPARTANS_SIGNUP_URL` - Spartans casino signup URL with referral

#### Luxdrop API
- `LUXDROP_API_KEY` - API key for Luxdrop affiliate API
- `LUXDROP_API_BASE_URL` - Base URL for Luxdrop API (default: "https://api.luxdrop.com/external/affiliates")
- `LUXDROP_AFFILIATE_CODE` - Affiliate code used in API requests (default: "sweetflips")
- `NEXT_PUBLIC_LUXDROP_AFFILIATE_CODE` - Affiliate code for client-side components (default: "sweetflips")

#### Kick Streaming
- `KICK_CHANNEL_NAME` - Kick channel name for API requests (default: "sweetflips")
- `NEXT_PUBLIC_KICK_CHANNEL_NAME` - Kick channel name for client-side components (default: "sweetflips")
- `NEXT_PUBLIC_KICK_CHANNEL_URL` - Kick channel URL for links (default: "https://kick.com/sweetflips")

#### Cron Jobs
- `CRON_SECRET` - Secret token for authenticating cron job requests

### Proxy Configuration (Optional)
- `PROXY_HOST` - Proxy server hostname
- `PROXY_PORT` - Proxy server port
- `PROXY_USERNAME` - Proxy authentication username
- `PROXY_PASSWORD` - Proxy authentication password

## Optional Environment Variables

### Special Event Periods

#### Spartans Special Period
- `SPECIAL_PERIOD_START_DATE` - Start date for special weekly event (format: YYYY-MM-DD, e.g., "2025-06-23")
- `SPECIAL_PERIOD_END_DATE` - End date for special weekly event (format: YYYY-MM-DD, e.g., "2025-06-30")

#### Luxdrop Period Configuration
- `LUXDROP_PERIOD_YEAR` - Year for Luxdrop leaderboard period (default: current year)
- `LUXDROP_PERIOD_MONTH` - Month for Luxdrop leaderboard period (default: current month)

#### Client-side Special Period (for Next.js public env vars)
- `NEXT_PUBLIC_SPECIAL_PERIOD_START_DATE` - Start date for special weekly event (format: YYYY-MM-DD)
- `NEXT_PUBLIC_SPECIAL_PERIOD_END_DATE` - End date for special weekly event (format: YYYY-MM-DD)
- `NEXT_PUBLIC_LUXDROP_PERIOD_YEAR` - Year for Luxdrop period (default: current year)
- `NEXT_PUBLIC_LUXDROP_PERIOD_MONTH` - Month for Luxdrop period (default: current month)

### Geo-blocking (Edge Middleware)
- `EDGE_BLOCKED_COUNTRIES` - Comma-separated list of blocked country codes (e.g., "US,GB")
- `EDGE_BLOCKED_CITIES` - Comma-separated list of blocked city names (lowercase)

## Environment Variable Validation

The application validates critical environment variables at runtime:

- Spartans proxy uses `API_KEY_SWEET_FLIPS` (or `SPARTANS_API_KEY` fallback) for upstream authentication
- API routes check for `LUXDROP_API_KEY` before making Luxdrop API requests
- Database connection is validated by Prisma during initialization

## Security Notes

**IMPORTANT:** All sensitive values are now stored in environment variables and never hardcoded in the source code:

- API keys, secrets, and authentication tokens are read from environment variables
- Referral codes and affiliate codes are configurable via environment variables
- API endpoints are configurable via environment variables
- Client-side public values use `NEXT_PUBLIC_` prefix and are safe to expose to the browser
- Server-side sensitive values should never be prefixed with `NEXT_PUBLIC_`

## Notes

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser and should not contain sensitive data
- All dates should be in UTC format (YYYY-MM-DD)
- Proxy configuration is optional - if not provided, requests will be made directly
- Special period dates are optional - if not set, the application defaults to standard monthly logic
