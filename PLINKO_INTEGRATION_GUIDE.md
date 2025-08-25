# Plinko Integration Guide

## Current Issue & Fix

The Plinko game was showing "Client seed is required" error because the existing Plinko iframe wasn't updated to send the new required parameters.

### Temporary Fix Applied
The spend endpoint now generates a client seed server-side if one isn't provided for backward compatibility:
```typescript
const finalClientSeed = clientSeed || crypto.randomBytes(16).toString('hex');
```

## Proper Integration

### 1. Update Plinko Game Frontend

The Plinko game (iframe) should be updated to:

#### A. Generate and Send Client Seed
```javascript
// In the Plinko game frontend
const clientSeed = Math.random().toString(36).substring(2, 15);

// When making spend request
const response = await fetch('/api/plinko/spend', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-plinko-secret': PLINKO_SECRET_TOKEN
  },
  credentials: 'include',
  body: JSON.stringify({
    amount: betAmount,
    clientSeed: clientSeed,  // Add this
    risk: selectedRisk       // 'low', 'medium', or 'high'
  })
});
```

#### B. Handle New Response Format
The spend endpoint now returns:
```json
{
  "success": true,
  "sessionId": "uuid-here",
  "serverSeedHash": "hash-here"
}
```

#### C. Send Session ID for Payout
```javascript
// When claiming payout
const response = await fetch('/api/plinko/payout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-plinko-secret': PLINKO_SECRET_TOKEN
  },
  credentials: 'include',
  body: JSON.stringify({
    sessionId: sessionId  // From spend response
  })
});
```

### 2. Environment Setup

#### Both Sides Need:
```env
PLINKO_SECRET_TOKEN=same_secret_on_both_sides
```

#### Main App (.env.local):
```env
PLINKO_URL=https://your-plinko-game.com
PLINKO_SECRET_TOKEN=your_generated_secret
```

#### Plinko Game:
```env
PLINKO_SECRET_TOKEN=your_generated_secret
API_BASE_URL=https://your-main-app.com
```

### 3. Security Flow

1. **Spend Request**:
   - User clicks "Drop Ball"
   - Plinko sends: amount, clientSeed, risk
   - Backend validates balance
   - Creates game session
   - Returns sessionId

2. **Game Play**:
   - Plinko simulates ball drop
   - Uses provided sessionId

3. **Payout Request**:
   - Plinko sends: sessionId
   - Backend validates session
   - Calculates payout server-side
   - Credits user account

### 4. Testing the Current Setup

With the temporary fix, Plinko should work as before:

1. **Test Basic Play**:
   - Open Plinko page
   - Click "Drop Ball"
   - Should deduct tokens
   - Should credit winnings

2. **Check Audit Logs**:
   ```sql
   SELECT * FROM "TokenTransaction" 
   WHERE "transactionType" IN ('spend', 'payout')
   ORDER BY "createdAt" DESC LIMIT 10;
   ```

3. **Verify Sessions** (in development):
   - Check browser console for any errors
   - Verify tokens are deducted/credited correctly

### 5. Future Improvements

1. **Update Plinko Frontend** to send client seeds
2. **Display Server Seed Hash** to user for transparency
3. **Add Provably Fair Verification** page where users can verify past games
4. **Store Game History** in database for permanent record

### 6. Rollback if Needed

If issues occur, remove the backward compatibility:
```typescript
// Change back to require client seed
if (!clientSeed || typeof clientSeed !== 'string') {
  return res.status(400).json({ error: 'Client seed is required' });
}
```

But this will break Plinko until the frontend is updated.