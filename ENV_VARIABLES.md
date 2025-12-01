# Environment Variables

This document lists all required and optional environment variables for the Sweetflips application.

## Required Environment Variables

### Database
- `DATABASE_URL` - PostgreSQL database connection string (used by Prisma)

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key

### API Keys

#### Razed API
- `BASE_RAZED_API_URL` - Base URL for Razed API endpoint
- `AUTH_RAZED` - Authentication/referral key for Razed API
- `RAZED_REFERRAL_CODE` - Referral code used in API requests (default: "SweetFlips")
- `NEXT_PUBLIC_RAZED_REFERRAL_CODE` - Referral code for client-side components (default: "SweetFlips")
- `RAZED_CLOUDFLARE_COOKIE` - Optional Cloudflare cookie for bypassing bot protection

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

#### Razed Special Period
- `SPECIAL_PERIOD_START_DATE` - Start date for special weekly event (format: YYYY-MM-DD, e.g., "2025-06-23")
- `SPECIAL_PERIOD_END_DATE` - End date for special weekly event (format: YYYY-MM-DD, e.g., "2025-06-30")

#### Luxdrop Bi-Weekly Period Configuration
- Bi-weekly (14-day) rolling periods are automatically calculated from a hardcoded anchor date (December 1, 2025)
  - The system automatically calculates rolling 14-day periods starting from this anchor date
  - Periods cross month boundaries automatically (e.g., Dec 29 - Jan 11)
  - Example periods: Dec 1-14, Dec 15-28, Dec 29 - Jan 11, etc.

#### Client-side Special Period (for Next.js public env vars)
- `NEXT_PUBLIC_SPECIAL_PERIOD_START_DATE` - Start date for special weekly event (format: YYYY-MM-DD)
- `NEXT_PUBLIC_SPECIAL_PERIOD_END_DATE` - End date for special weekly event (format: YYYY-MM-DD)

### Geo-blocking (Edge Middleware)
- `EDGE_BLOCKED_COUNTRIES` - Comma-separated list of blocked country codes (e.g., "US,GB")
- `EDGE_BLOCKED_CITIES` - Comma-separated list of blocked city names (lowercase)

## Environment Variable Validation

The application validates critical environment variables at runtime:

- API routes check for `BASE_RAZED_API_URL` and `AUTH_RAZED` before making requests
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
- Special period dates are optional - if not set, the application uses default values
- Luxdrop uses bi-weekly (14-day) rolling periods that automatically progress and cross month boundaries
