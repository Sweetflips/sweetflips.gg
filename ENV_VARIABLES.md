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

#### Luxdrop API
- `LUXDROP_API_KEY` - API key for Luxdrop affiliate API

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

- API routes check for `BASE_RAZED_API_URL` and `AUTH_RAZED` before making requests
- API routes check for `LUXDROP_API_KEY` before making Luxdrop API requests
- Database connection is validated by Prisma during initialization

## Notes

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser and should not contain sensitive data
- All dates should be in UTC format (YYYY-MM-DD)
- Proxy configuration is optional - if not provided, requests will be made directly
- Special period dates are optional - if not set, the application defaults to standard monthly logic
