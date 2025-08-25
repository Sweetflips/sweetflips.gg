# Vercel Deployment Fix

## The Issue
The build fails because Prisma client hasn't been generated with the new `TokenTransaction` model, causing the Decimal import to fail.

## Solutions Applied

### 1. Updated Import Strategy
Changed the auditLogger.ts to use dynamic imports that work even before Prisma generates.

### 2. Deployment Steps

1. **First, commit and push the fixes**:
   ```bash
   git add .
   git commit -m "Fix Decimal import for Vercel build"
   git push origin main
   ```

2. **In Vercel, ensure these build settings**:
   - Build Command: `prisma generate && next build` (or use the existing `vercel-build` script)
   - Install Command: `npm install` (default)

3. **Add the migration file to git** (if not already):
   ```bash
   git add prisma/migrations/20250801_add_token_transaction_audit_log/migration.sql
   git commit -m "Add TokenTransaction migration"
   git push origin main
   ```

## Alternative Quick Fix

If the above doesn't work, you can temporarily disable the audit logging until the database is migrated:

1. Set an environment variable in Vercel:
   ```
   SKIP_AUDIT_LOGGING=true
   ```

2. Then update createAuditLog to check this:
   ```typescript
   if (process.env.SKIP_AUDIT_LOGGING === 'true') {
     return;
   }
   ```

3. After deployment succeeds:
   - Run the migration manually
   - Remove the SKIP_AUDIT_LOGGING variable
   - Redeploy

## Manual Migration After Deployment

If the automatic migration doesn't run, execute manually:

```bash
# SSH into your production environment or use Vercel CLI
npx prisma migrate deploy
```

## Verification

After successful deployment:

1. Check that the `TokenTransaction` table exists:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'TokenTransaction';
   ```

2. Test a simple transaction to ensure logging works.

## Notes

The dynamic import approach ensures:
- Build succeeds even without generated Prisma client
- Runtime will use the proper Decimal type once generated
- Fallback implementation prevents crashes