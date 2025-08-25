# Unity WebGL Deployment Guide

## Problem
Unity WebGL builds use compressed files (.gz or .br) that need proper HTTP headers to work correctly. Without the correct `Content-Encoding` headers, browsers cannot decompress the files, resulting in the error:
> "Unable to parse Build/Build.framework.js.gz! This can happen if build compression was enabled but web server hosting the content was misconfigured"

## Solution Implemented

### 1. File Structure
Place your Unity WebGL build files in:
```
public/
└── webgl/
    └── Build/
        ├── Build.loader.js          (uncompressed loader)
        ├── Build.framework.js.gz     (compressed framework)
        ├── Build.data.gz            (compressed data)
        ├── Build.wasm.gz            (compressed WebAssembly)
        └── Build.symbols.json.gz    (optional debug symbols)
```

### 2. Configuration Files Updated

#### `next.config.mjs`
- Added header rules for serving .gz and .br files with correct Content-Encoding
- Configured Content-Type for different file types

#### `vercel.json`
- Added header configuration for Vercel deployment
- Ensures compressed files are served correctly in production

#### `middleware.ts`
- Created middleware to handle Unity WebGL file requests
- Sets appropriate headers dynamically based on file extensions

### 3. Avatar Creator Page
Created `/avatar-creator` page at `src/app/avatar-creator/page.tsx`:
- Loads Unity WebGL content
- Handles authentication integration
- Shows loading progress
- Error handling with troubleshooting tips

## Unity Build Settings

When building in Unity:

### Recommended Settings
1. **Player Settings**:
   - Compression Format: **Gzip** (recommended) or **Brotli**
   - Decompression Fallback: **Enabled**

2. **Publishing Settings**:
   - Compression: **Gzip**
   - Name Files As Hashes: **Disabled** (easier to manage)

### Build Command
```
File > Build Settings > WebGL > Build
```

### After Building
1. Copy the entire Build folder to `public/webgl/Build/`
2. Ensure all .gz files are present
3. Keep the loader.js file uncompressed

## Testing Locally

1. Start development server:
```bash
npm run dev
```

2. Navigate to:
```
http://localhost:3000/avatar-creator
```

3. Check browser console for any errors

## Deployment to Vercel

1. Commit all changes:
```bash
git add .
git commit -m "Add Unity WebGL avatar creator with proper gzip headers"
git push
```

2. Vercel will automatically:
   - Apply the header configurations from `vercel.json`
   - Serve compressed files with correct headers
   - Handle the Unity WebGL content properly

## Troubleshooting

### Issue: Files still not loading
**Check Network Tab**:
1. Open browser DevTools > Network tab
2. Look for .gz files
3. Check Response Headers for `Content-Encoding: gzip`

### Issue: 404 errors for Unity files
**Verify file location**:
```bash
ls -la public/webgl/Build/
```
Files should be:
- Build.data.gz
- Build.framework.js.gz
- Build.loader.js
- Build.wasm.gz

### Issue: CORS errors
The middleware adds `Access-Control-Allow-Origin: *` headers. If you need stricter CORS:
```typescript
// In middleware.ts
response.headers.set('Access-Control-Allow-Origin', 'https://yourdomain.com');
```

### Issue: Large file size warnings
Unity WebGL builds can be large. Consider:
1. **Code stripping**: Enable in Unity Player Settings
2. **Texture compression**: Use compressed texture formats
3. **Audio compression**: Reduce audio quality where possible
4. **Brotli compression**: Smaller than Gzip but requires more browser support

## Alternative: Disable Compression

If you continue having issues, you can disable compression in Unity:

1. **Unity Build Settings**:
   - Publishing Settings > Compression Format: **Disabled**
   
2. **Remove header configurations** from:
   - `next.config.mjs`
   - `vercel.json`
   - `middleware.ts`

3. **File structure** becomes:
```
public/webgl/Build/
├── Build.loader.js
├── Build.framework.js  (uncompressed)
├── Build.data         (uncompressed)
└── Build.wasm         (uncompressed)
```

**Note**: This will significantly increase load times.

## Integration with Avatar API

The avatar creator page automatically:
1. Detects authenticated users
2. Passes user ID and auth token to Unity
3. Unity can call the avatar upload API

### From Unity to API:
```csharp
// Unity sends avatar data to:
POST /api/avatar/upload-public  // For testing
POST /api/avatar/upload         // With authentication
```

### From Web to Unity:
```javascript
// Pass user info to Unity
unityInstance.SendMessage('AuthManager', 'SetUserId', userId);
unityInstance.SendMessage('AuthManager', 'SetAuthToken', token);
```

## Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Mobile browsers (limited WebGL support)

## Performance Tips

1. **Lazy load** the Unity content only when needed
2. **Show placeholder** while loading
3. **Cache** the build files with service worker
4. **CDN**: Consider serving large files from CDN
5. **Progressive loading**: Load essential assets first