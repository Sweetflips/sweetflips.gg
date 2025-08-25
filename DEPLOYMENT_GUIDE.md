# Deployment Guide for Security Improvements

## 1. PLINKO_SECRET_TOKEN Setup

### What is it?
The `PLINKO_SECRET_TOKEN` is a shared secret between your main application and the Plinko game endpoint. It prevents unauthorized access to the spend/payout endpoints.

### How to Generate It

Option 1 - Using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Option 2 - Using OpenSSL:
```bash
openssl rand -hex 32
```

Option 3 - Using an online generator:
Visit https://generate-secret.vercel.app/32

Example output: `a7f3d2b8e9c4f6a1d5e8b2c7f4a9d3e6b8c1f5a2d7e4b9c6f3a8d5e2b7c4f1a6`

### Where to Store It

1. **Local Development** (.env.local):
```env
PLINKO_SECRET_TOKEN=your_generated_token_here
```

2. **Vercel Deployment**:
```bash
vercel env add PLINKO_SECRET_TOKEN
# Paste your token when prompted
# Select: Production, Preview, Development
```

3. **Other Hosting Providers**:
- Add to your environment variables section
- Ensure it's marked as secret/sensitive

### Important Security Notes
- Never commit this token to Git
- Use different tokens for development and production
- Rotate the token periodically (every 3-6 months)
- Store it in your password manager

## 2. Pre-Deployment Checklist

### Database Preparation
```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Create migration files (if not done already)
npx prisma migrate dev --name add_token_transaction_audit_log

# 3. Test migration on staging database first
DATABASE_URL=your_staging_db_url npx prisma migrate deploy
```

### Environment Variables
Ensure these are set in your production environment:
- `DATABASE_URL` - Your PostgreSQL connection string
- `PLINKO_SECRET_TOKEN` - Generated above
- `PLINKO_URL` - URL where your Plinko game is hosted
- All existing variables (SUPABASE_URL, etc.)

## 3. Deployment Steps

1. **Deploy Code**:
   ```bash
   git add .
   git commit -m "Add security improvements: rate limiting, audit logging, game validation"
   git push origin main
   ```

2. **Run Database Migration**:
   ```bash
   # In production environment
   npx prisma migrate deploy
   ```

3. **Verify Deployment**:
   - Check deployment logs for errors
   - Ensure all endpoints return 200 OK

## 4. Post-Deployment Verification

### Step 1: Basic Health Checks

Test each endpoint with curl or Postman:

```bash
# Test rate limiting headers (should see X-RateLimit headers)
curl -I https://yourdomain.com/api/user/transaction-history \
  -H "Cookie: kick_id=test_user"

# Expected headers:
# X-RateLimit-Limit: 20
# X-RateLimit-Remaining: 19
# X-RateLimit-Reset: 2024-08-02T...
```

### Step 2: Test Token Conversion
1. Log in as a test user
2. Try to convert points to tokens
3. Check:
   - Conversion works correctly
   - Transaction appears in database
   - Audit log entry created

```sql
-- Check audit logs in database
SELECT * FROM "TokenTransaction" 
WHERE "userId" = YOUR_TEST_USER_ID 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

### Step 3: Test Rate Limiting
```bash
# Make rapid requests to trigger rate limit
for i in {1..10}; do
  curl -X POST https://yourdomain.com/api/convert-tokens \
    -H "Cookie: kick_id=test_user" \
    -H "Content-Type: application/json" \
    -d '{"amount": 100}'
done

# Should see 429 error after 3rd request (for token conversion)
```

### Step 4: Test Plinko Integration
1. Try to play Plinko game
2. Verify:
   - Spend endpoint deducts tokens
   - Payout endpoint requires valid session
   - Both create audit logs

### Step 5: Admin Panel Testing
1. Log in as admin
2. Try to adjust a user's token balance
3. Verify:
   - Adjustment works
   - Audit log shows admin_adjustment type
   - Metadata includes admin info

### Step 6: Transaction History
1. Check user transaction history endpoint
2. Verify pagination works
3. Check admin can see all transactions

## 5. Monitoring Checklist

### Immediate (First 24 hours)
- [ ] Monitor error logs for any 500 errors
- [ ] Check database for audit log entries
- [ ] Verify rate limiting is not too restrictive
- [ ] Monitor token conversion patterns
- [ ] Check for any suspicious activity in audit logs

### SQL Queries for Monitoring

```sql
-- Check recent transactions
SELECT 
  tt."transactionType",
  COUNT(*) as count,
  SUM(tt."amount") as total_amount
FROM "TokenTransaction" tt
WHERE tt."createdAt" > NOW() - INTERVAL '1 hour'
GROUP BY tt."transactionType";

-- Find suspicious activity
SELECT 
  u.username,
  COUNT(*) as transaction_count,
  SUM(tt."amount") as total_amount
FROM "TokenTransaction" tt
JOIN "User" u ON u.id = tt."userId"
WHERE tt."createdAt" > NOW() - INTERVAL '1 hour'
GROUP BY u.username
HAVING COUNT(*) > 10
ORDER BY transaction_count DESC;

-- Check admin adjustments
SELECT 
  tt.*,
  u.username
FROM "TokenTransaction" tt
JOIN "User" u ON u.id = tt."userId"
WHERE tt."transactionType" = 'admin_adjustment'
ORDER BY tt."createdAt" DESC
LIMIT 20;
```

## 6. Rollback Plan

If critical issues occur:

### Quick Disable (Temporary)
Add environment variable to disable features:
```env
DISABLE_RATE_LIMITING=true
DISABLE_AUDIT_LOGGING=true
```

Then in code, check these before applying features.

### Full Rollback
```bash
# 1. Revert code
git revert HEAD
git push origin main

# 2. Rollback migration (if needed)
npx prisma migrate resolve --rolled-back 20250801_add_token_transaction_audit_log
```

## 7. Success Indicators

Your deployment is successful when:
- ✅ No increase in error rates
- ✅ All endpoints respond normally
- ✅ Audit logs are being created
- ✅ Rate limiting prevents abuse without blocking legitimate users
- ✅ Transaction history is accessible
- ✅ Admin functions work correctly

## 8. Common Issues and Solutions

### Issue: "TokenTransaction model not found"
**Solution**: Run `npx prisma generate` and restart server

### Issue: Rate limiting too strict
**Solution**: Adjust limits in `lib/rateLimiter.ts` and redeploy

### Issue: Plinko game not working
**Solution**: Verify PLINKO_SECRET_TOKEN is set correctly on both sides

### Issue: Audit logs not appearing
**Solution**: Check database connection and permissions

## 9. Performance Monitoring

Watch for:
- Database query performance (audit logs add overhead)
- Memory usage (in-memory rate limiting)
- Response times on token-related endpoints

## 10. Next Steps After Successful Deployment

1. **Set up alerts** for suspicious transactions
2. **Schedule regular reviews** of audit logs
3. **Plan Redis integration** for production scale
4. **Document rate limits** for your users
5. **Create admin dashboard** for viewing audit logs

---

Remember: Take it slow, test thoroughly, and monitor closely in the first 24-48 hours after deployment.