# Luxdrop Leaderboard - Complete Documentation

## Overview

The Luxdrop leaderboard is a bi-weekly competition that tracks user wagering activity and distributes prizes to the top 20 users. The system uses the Luxdrop affiliate API to fetch leaderboard data and displays it on the `/luxdrop` page.

---

## Timeline & Period Calculation

### Base Start Date
- **Base Start Date**: December 1, 2025, 00:00:00 UTC
- **Period Length**: 14 days (bi-weekly)
- **Period Calculation**: Automatically calculates the current bi-weekly period based on days elapsed since the base start date

### Period Calculation Logic

```typescript
const baseStartDate = DateTime.utc(2025, 12, 1, 0, 0, 0);
const periodLengthDays = 14;

const daysSinceStart = Math.floor(now.diff(baseStartDate, "days").days);
const periodNumber = Math.floor(daysSinceStart / periodLengthDays);

const periodStartDate = baseStartDate.plus({ days: periodNumber * periodLengthDays });
const periodEndDate = periodStartDate.plus({ days: periodLengthDays - 1 }).set({ hour: 23, minute: 59, second: 59 });
```

### Period Format
- **Start Date**: Beginning of the 14-day period (00:00:00 UTC)
- **End Date**: End of the 14-day period (23:59:59 UTC)
- **Display Format**: "MMM d - MMM d, yyyy" (e.g., "Dec 1 - Dec 14, 2025")

### Query Parameters
The API proxy accepts optional query parameters:
- `startDate`: ISO date string (YYYY-MM-DD) - overrides automatic calculation
- `endDate`: ISO date string (YYYY-MM-DD) - overrides automatic calculation

If not provided, the system automatically calculates the current bi-weekly period.

---

## Prizes & Rewards

### Total Prize Pool
- **Total Prize Pool**: $22,000 per bi-weekly period
- **Distribution**: $11,000 distributed across top 20 users (as stated in UI)
- **Note**: The UI displays "$22,000" but mentions "$11,000" in the description

### Reward Structure (Top 20)

| Rank | Reward Amount (USD) |
|------|---------------------|
| 1    | $4,250              |
| 2    | $2,100              |
| 3    | $1,050              |
| 4    | $700                |
| 5    | $500                |
| 6    | $350                |
| 7    | $300                |
| 8    | $275                |
| 9    | $250                |
| 10   | $225                |
| 11   | $200                |
| 12   | $180                |
| 13   | $160                |
| 14   | $130                |
| 15   | $110                |
| 16   | $80                 |
| 17   | $50                 |
| 18   | $40                 |
| 19   | $30                 |
| 20   | $20                 |

### Reward Mapping Code

```typescript
const rewardMapping: { [key: number]: number } = {
  1: 4250,
  2: 2100,
  3: 1050,
  4: 700,
  5: 500,
  6: 350,
  7: 300,
  8: 275,
  9: 250,
  10: 225,
  11: 200,
  12: 180,
  13: 160,
  14: 130,
  15: 110,
  16: 80,
  17: 50,
  18: 40,
  19: 30,
  20: 20,
};
```

### Reward Assignment Logic
1. If the API returns a reward value > 0, use the API reward
2. Otherwise, use the reward mapping based on rank
3. Rewards are displayed in USD currency format (no decimals if .00)

---

## API Details

### Luxdrop API Endpoint

**Base URL**: `https://api.luxdrop.com/external/affiliates`

**Full URL**: `https://api.luxdrop.com/external/affiliates`

### API Request Method
- **Method**: GET
- **Authentication**: API Key via `x-api-key` header

### API Request Parameters

| Parameter | Type   | Required | Description                                    |
|-----------|--------|----------|------------------------------------------------|
| `codes`   | string | Yes      | Affiliate code(s) to query (comma-separated)  |
| `startDate` | string | Yes    | Start date in ISO format (YYYY-MM-DD)         |
| `endDate` | string   | Yes    | End date in ISO format (YYYY-MM-DD)           |

### API Request Headers

```
x-api-key: {LUXDROP_API_KEY}
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
Accept: application/json
```

### API Response Format

The API can return data in multiple formats:
1. **Array format**: Direct array of affiliate entries
2. **Object format**: Object containing `data`, `results`, `items`, or `affiliates` property

**Expected Entry Fields**:
- `username` or `user` or `name` or `id` - User identifier
- `wagered` or `wagered_amount` or `wager` or `amount` - Wagered amount
- `reward` (optional) - Reward amount from API

### API Credentials

**API Key**: `65dc17f61f7889075fe2b070856a096e6960ba75ff58a505e0f04c0a40975191`

**Affiliate Code**: `sweetflips`

**Environment Variables**:
- `LUXDROP_API_KEY`: `65dc17f61f7889075fe2b070856a096e6960ba75ff58a505e0f04c0a40975191`
- `LUXDROP_API_BASE_URL`: `https://api.luxdrop.com/external/affiliates` (default)
- `LUXDROP_AFFILIATE_CODE`: `sweetflips` (default)
- `NEXT_PUBLIC_LUXDROP_AFFILIATE_CODE`: `sweetflips` (default)

---

## Proxy Configuration

The system supports optional HTTP proxy configuration for API requests:

**Proxy Settings**:
- **Host**: `104.253.199.227`
- **Port**: `5506`
- **Username**: `ozxnqgrw`
- **Password**: `kbqc558eowm4`

**Environment Variables**:
- `PROXY_HOST`: `104.253.199.227`
- `PROXY_PORT`: `5506`
- `PROXY_USERNAME`: `ozxnqgrw`
- `PROXY_PASSWORD`: `kbqc558eowm4`

**Proxy URL Format**: `http://{username}:{password}@{host}:{port}`

If proxy credentials are provided, all API requests will be routed through the proxy.

---

## Implementation Details

### API Proxy Endpoint

**Route**: `/api/LuxdropProxy`

**File**: `src/pages/api/LuxdropProxy.ts`

**Features**:
- Database caching (10-minute TTL)
- ETag support for cache validation
- Stale-while-revalidate caching strategy
- Username masking for privacy
- Rate limit handling (429 responses)
- Automatic period calculation
- Proxy support

### Cache Configuration

- **Cache TTL**: 10 minutes (600,000 ms)
- **Cache Storage**: PostgreSQL database (`LuxdropLeaderboardCache` table)
- **Cache Key Format**: `{affiliateCode}|{startDate}|{endDate}`
- **HTTP Cache Headers**:
  - `Cache-Control`: `public, s-maxage=300, stale-while-revalidate=900, max-age=60`
  - `Cache-Tag`: `leaderboard,luxdrop`
  - `ETag`: Base64-encoded hash of data

### Database Schema

**Table**: `LuxdropLeaderboardCache`

```prisma
model LuxdropLeaderboardCache {
  id            String   @id @default(uuid())
  cacheKey      String   @unique
  data          Json
  period        Json?
  etag          String?
  fetchedAt     DateTime @default(now())
  expiresAt     DateTime
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([expiresAt])
}
```

### Frontend Component

**File**: `src/components/Luxdrop/LuxdropLeaderboard.tsx`

**Features**:
- Automatic data fetching on mount
- Auto-refresh every 5 minutes (300,000 ms)
- Period calculation matching backend
- Username masking
- Top 3 podium display
- Full leaderboard table (ranks 4-20)
- Countdown timer to period end
- Error handling with retry functionality

### Username Masking

Usernames are masked for privacy:
- **Length ≤ 2**: No masking
- **Length ≤ 4**: First char + asterisks + last char (e.g., `A**B`)
- **Length > 4**: First 2 chars + asterisks + last 2 chars (e.g., `AB***CD`)

Masking is applied:
1. When storing data in cache (backend)
2. When displaying data (frontend)
3. When returning cached data (backend)

### Data Processing

1. **Filter**: Only users with wagered amount > 0
2. **Sort**: Descending by wagered amount
3. **Limit**: Top 20 users
4. **Rank Assignment**: Sequential ranking (1-20)
5. **Reward Assignment**: API reward if available, otherwise use reward mapping

### Currency Formatting

- **Wagered Amount**: Full currency format with decimals (e.g., `$1,234.56`)
- **Reward Amount**: Currency format without `.00` (e.g., `$4,250` instead of `$4,250.00`)

---

## API Request Example

### Direct API Call (without proxy)

```bash
curl -X GET "https://api.luxdrop.com/external/affiliates?codes=sweetflips&startDate=2025-12-01&endDate=2025-12-14" \
  -H "x-api-key: 65dc17f61f7889075fe2b070856a096e6960ba75ff58a505e0f04c0a40975191" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  -H "Accept: application/json"
```

### Via Proxy Endpoint

```bash
curl -X GET "https://sweetflips.gg/api/LuxdropProxy?startDate=2025-12-01&endDate=2025-12-14"
```

Or let the system auto-calculate the period:

```bash
curl -X GET "https://sweetflips.gg/api/LuxdropProxy"
```

---

## Response Format

### Success Response

```json
{
  "data": [
    {
      "username": "ab***cd",
      "wagered": 12345.67,
      "reward": 4250,
      "rank": 1
    },
    {
      "username": "ef***gh",
      "wagered": 9876.54,
      "reward": 2100,
      "rank": 2
    }
    // ... up to 20 entries
  ],
  "period": {
    "month": "December",
    "year": 2025,
    "period": "Dec 1 - Dec 14, 2025",
    "startDate": "2025-12-01",
    "endDate": "2025-12-14",
    "note": "Leaderboard data from 2025-12-01 to 2025-12-14"
  }
}
```

### Error Response

```json
{
  "error": "Failed to fetch leaderboard data",
  "message": "API returned 401: Unauthorized",
  "details": null,
  "timestamp": "2025-02-03T12:00:00.000Z"
}
```

### Rate Limit Response (429)

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests",
  "retryAfter": 60,
  "timestamp": "2025-02-03T12:00:00.000Z"
}
```

---

## Cron Job Integration

The leaderboard cache is refreshed via cron job:

**Endpoint**: `/api/cron/refresh-leaderboards`

**File**: `src/pages/api/cron/refresh-leaderboards.ts`

**Authentication**: Requires `CRON_SECRET` header

**CRON_SECRET**: `Wg!n+kYdmnj@LJd-z)qLYRJC2ZNF*Y`

The cron job calls `/api/LuxdropProxy` to refresh the cache periodically.

---

## Page Route

**URL**: `/luxdrop`

**File**: `src/app/luxdrop/page.tsx`

**Component**: `LuxdropLeaderboard`

**Metadata**:
- Title: "LuxDrop Leaderboard"
- Description: "LuxDrop Leaderboard"
- Image: `/images/cover/Luxdrop_Leaderboard.png`

---

## Environment Variables Summary

### Required Variables

```bash
# Luxdrop API
LUXDROP_API_KEY=<your-luxdrop-api-key>
LUXDROP_API_BASE_URL=https://api.luxdrop.com/external/affiliates
LUXDROP_AFFILIATE_CODE=sweetflips
NEXT_PUBLIC_LUXDROP_AFFILIATE_CODE=sweetflips

# Proxy (Optional)
PROXY_HOST=<your-proxy-host>
PROXY_PORT=<your-proxy-port>
PROXY_USERNAME=<your-proxy-username>
PROXY_PASSWORD=<your-proxy-password>

# Database
DATABASE_URL=<your-database-connection-string>

# Cron
CRON_SECRET=<your-cron-secret>
```

---

## Key Files

1. **API Proxy**: `src/pages/api/LuxdropProxy.ts`
2. **Frontend Component**: `src/components/Luxdrop/LuxdropLeaderboard.tsx`
3. **Page Route**: `src/app/luxdrop/page.tsx`
4. **Database Schema**: `prisma/schema.prisma` (LuxdropLeaderboardCache model)
5. **Cron Job**: `src/pages/api/cron/refresh-leaderboards.ts`

---

## Notes

1. **Username Privacy**: All usernames are masked before storage and display
2. **Cache Strategy**: 10-minute TTL with stale-while-revalidate for resilience
3. **Period Calculation**: Automatically calculates bi-weekly periods from Dec 1, 2025
4. **Reward Fallback**: Uses reward mapping if API doesn't provide reward values
5. **Top 20 Only**: Only top 20 users are displayed and cached
6. **Auto-refresh**: Frontend refreshes data every 5 minutes
7. **Proxy Support**: Optional proxy configuration for API requests
8. **Error Handling**: Returns stale cache if API fails (if available)

---

## Testing

To test the Luxdrop leaderboard implementation:

1. **Test API Proxy**:
   ```bash
   curl http://localhost:3000/api/LuxdropProxy
   ```

2. **Test with Custom Dates**:
   ```bash
   curl "http://localhost:3000/api/LuxdropProxy?startDate=2025-12-01&endDate=2025-12-14"
   ```

3. **View Page**:
   Navigate to `http://localhost:3000/luxdrop`

4. **Check Cache**:
   Query the `LuxdropLeaderboardCache` table in PostgreSQL

---

## Summary

The Luxdrop leaderboard is a bi-weekly competition system that:
- Tracks user wagering via Luxdrop affiliate API
- Distributes $11,000-$22,000 in prizes to top 20 users
- Uses 14-day periods starting from December 1, 2025
- Implements caching, privacy masking, and error handling
- Supports optional proxy configuration
- Auto-refreshes every 5 minutes on the frontend
- Caches data for 10 minutes on the backend
