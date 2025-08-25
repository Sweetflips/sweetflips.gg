# Unity WebGL Authentication Integration

## Overview
This document explains the authentication integration between the Next.js web application and Unity WebGL build. The system supports both Supabase email/password authentication and Kick.com OAuth authentication.

## Architecture

### Authentication Flow
1. User logs in via web application (email/password or Kick OAuth)
2. Authentication tokens are stored in cookies, localStorage, and sessionStorage
3. Unity WebGL reads authentication data through JavaScript bridge functions
4. Unity can make authenticated API calls using the retrieved tokens

## Key Components

### 1. Cookie Management (`src/lib/cookies.ts`)
- `storeAuthForUnity()`: Stores auth tokens in multiple locations for Unity access
- `getCookie()`: Retrieves values with fallback to localStorage/sessionStorage
- `clearAuthData()`: Clears all authentication data on logout

### 2. Unity JavaScript Bridge (`public/webgl/index.html`)
JavaScript functions accessible from Unity:
- `window.GetAuthToken()`: Returns the authentication token
- `window.GetUserId()`: Returns the user ID (public.User table)
- `window.GetAuthUserId()`: Returns the auth user ID (auth.users table)
- `window.requestAuthToken()`: Requests fresh auth token from parent page
- `window.setAuthData()`: Sets authentication data (called by parent page)

### 3. Authentication Context (`src/contexts/AuthContext.tsx`)
- Automatically stores auth tokens in cookies when user signs in
- Supports both Supabase and Kick.com authentication
- Clears cookies on logout

### 4. Login Pages
- **Email/Password Login** (`src/app/auth/signin/page.tsx`): Stores Supabase tokens
- **Kick OAuth Callback** (`src/pages/api/auth/callback.ts`): Stores Kick tokens and user IDs

## Unity Integration

### Reading Auth Data in Unity

The Unity `AuthenticationManager.cs` can retrieve auth data using:

```csharp
// In Unity C# code
[DllImport("__Internal")]
private static extern string GetAuthTokenFromJS();

[DllImport("__Internal")]
private static extern int GetUserIdFromJS();

// Usage
string token = GetAuthTokenFromJS();
int userId = GetUserIdFromJS();
```

### JavaScript Implementation (AuthenticationManager.jslib)

The Unity WebGL plugin searches for auth data in this order:
1. localStorage
2. sessionStorage
3. window object
4. Browser cookies

## Cookie Storage Details

### Cookies Set on Login

#### Supabase Authentication:
- `authToken`: Supabase access token
- `userId`: User ID from public.User table (if exists)
- `authUserId`: UUID from auth.users table

#### Kick OAuth Authentication:
- `access_token`: Kick OAuth token (httpOnly)
- `kick_id`: Kick user ID (httpOnly)
- `authToken`: Same as access_token (accessible to JS/Unity)
- `userId`: Internal user ID from database
- `authUserId`: UUID if linking to email account

### Cookie Options
```javascript
{
  httpOnly: false,  // Allow JavaScript/Unity access
  secure: true,     // HTTPS only in production
  sameSite: 'lax',
  path: '/',
  maxAge: 604800,   // 7 days
}
```

## API Endpoints for Unity

### Avatar Management
All endpoints check for authentication via cookies or Authorization header:

- `POST /api/avatar/upload` - Upload avatar (requires auth)
- `PUT /api/avatar/update` - Update avatar (requires auth)
- `GET /api/avatar/[userId]` - Get avatar by user ID
- `GET /api/avatar/by-auth/[authUserId]` - Get avatar by auth user ID
- `POST /api/avatar/upload-public` - Testing endpoint (no auth required)

### Making Authenticated Requests from Unity

```csharp
using (UnityWebRequest request = new UnityWebRequest(apiUrl, "POST"))
{
    string authToken = GetAuthToken(); // Uses the JS bridge
    request.SetRequestHeader("Authorization", $"Bearer {authToken}");
    request.SetRequestHeader("Content-Type", "application/json");
    
    yield return request.SendWebRequest();
}
```

## Testing the Integration

### 1. Check if Auth Data is Available
Open browser console on `/webgl/index.html` and run:
```javascript
console.log('Token:', window.GetAuthToken());
console.log('User ID:', window.GetUserId());
console.log('Auth User ID:', window.GetAuthUserId());
```

### 2. Manually Set Auth Data (for testing)
```javascript
window.setAuthData('test-token', 123, 'auth-user-uuid');
```

### 3. Monitor Unity Logs
Unity will log authentication status:
- "Token received from JavaScript"
- "User ID received from JavaScript: {id}"
- "No authentication token found" (if not authenticated)

## Troubleshooting

### Common Issues

1. **"GetAuthToken() not implemented"**
   - Ensure user is logged in via the web application first
   - Check that cookies are being set properly
   - Verify `/webgl/index.html` includes the JavaScript functions

2. **Token not persisting**
   - Check browser cookie settings (third-party cookies must be enabled)
   - Verify secure context (HTTPS in production)
   - Check cookie expiration dates

3. **Unity can't access tokens**
   - Ensure cookies have `httpOnly: false`
   - Check that Unity build is served from same domain
   - Verify JavaScript bridge functions are defined before Unity loads

### Debug Commands

Check authentication status:
```javascript
// In browser console
document.cookie.split(';').forEach(c => {
  if(c.includes('authToken') || c.includes('userId')) {
    console.log(c.trim());
  }
});

// Check localStorage
console.log('localStorage auth:', localStorage.getItem('authToken'));

// Check sessionStorage  
console.log('sessionStorage auth:', sessionStorage.getItem('authToken'));
```

## Security Considerations

1. **Token Storage**: Tokens are stored in non-httpOnly cookies for Unity access. This is less secure than httpOnly cookies but necessary for WebGL integration.

2. **HTTPS Required**: Always use HTTPS in production to prevent token interception.

3. **Token Expiration**: Tokens expire after 7 days. Unity should handle token refresh or re-authentication.

4. **CORS**: Ensure API endpoints allow requests from Unity WebGL origin.

## Future Improvements

1. Implement token refresh mechanism
2. Add WebSocket support for real-time auth updates
3. Implement secure token exchange for Unity-specific tokens
4. Add rate limiting for API endpoints
5. Implement token rotation on sensitive operations