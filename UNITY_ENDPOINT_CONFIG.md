# Unity Endpoint Configuration

## Important: Update Your Unity AuthenticationManager

The `AuthenticationManager.cs` in your Unity project needs to be updated with the correct API endpoints.

### Current Issue
Your Unity code has this hardcoded endpoint:
```csharp
[SerializeField] private string tokenValidationEndpoint = "https://sweetflips-g5wci4vg9-sweetflips-projects.vercel.app/api/auth/validate";
```

This is pointing to the wrong deployment URL.

### Correct Endpoints

#### For Development:
```csharp
private string tokenValidationEndpoint = "http://localhost:3000/api/auth/validate";
```

#### For Production:
```csharp
private string tokenValidationEndpoint = "https://sweetflips.gg/api/auth/validate";
```

#### For Staging/Preview (your current deployment):
```csharp
private string tokenValidationEndpoint = "https://sweetflips-gg-env-develop-sweetflips-projects.vercel.app/api/auth/validate";
```

### Avatar Upload Endpoints

Update your `GameManager.cs` avatar upload URL:

#### Current (incorrect):
```csharp
string apiUrl = "https://sweetflips-gg-env-develop-sweetflips-projects.vercel.app/api/avatar/upload";
```

#### Should be:
```csharp
// For production
string apiUrl = "https://sweetflips.gg/api/avatar/upload";

// For staging
string apiUrl = "https://sweetflips-gg-env-develop-sweetflips-projects.vercel.app/api/avatar/upload";

// For development
string apiUrl = "http://localhost:3000/api/avatar/upload";
```

### How to Make Endpoints Configurable

Instead of hardcoding, consider making these configurable in Unity:

1. **Option 1: Use a ScriptableObject**
```csharp
[CreateAssetMenu(fileName = "APIConfig", menuName = "Config/API Configuration")]
public class APIConfig : ScriptableObject
{
    public string baseUrl = "https://sweetflips.gg";
    public string tokenValidationPath = "/api/auth/validate";
    public string avatarUploadPath = "/api/avatar/upload";
    
    public string TokenValidationEndpoint => baseUrl + tokenValidationPath;
    public string AvatarUploadEndpoint => baseUrl + avatarUploadPath;
}
```

2. **Option 2: Use Environment Detection**
```csharp
private string GetAPIBaseUrl()
{
    #if UNITY_EDITOR
        return "http://localhost:3000";
    #elif DEVELOPMENT_BUILD
        return "https://sweetflips-gg-env-develop-sweetflips-projects.vercel.app";
    #else
        return "https://sweetflips.gg";
    #endif
}
```

3. **Option 3: Get from JavaScript**
```csharp
[DllImport("__Internal")]
private static extern string GetAPIBaseURL();

private string GetValidationEndpoint()
{
    #if UNITY_WEBGL && !UNITY_EDITOR
        string baseUrl = GetAPIBaseURL();
        if (!string.IsNullOrEmpty(baseUrl))
        {
            return baseUrl + "/api/auth/validate";
        }
    #endif
    
    // Fallback
    return "https://sweetflips.gg/api/auth/validate";
}
```

And in your index.html:
```javascript
window.GetAPIBaseURL = function() {
    return window.location.origin;
};
```

### GameObject Naming Issue

The error "SendMessage: object AuthenticationManager not found!" suggests the GameObject might not be named exactly "AuthenticationManager" in your Unity scene.

To fix this:
1. Check your Unity scene hierarchy for the exact GameObject name
2. It might be named something like:
   - "Authentication Manager" (with space)
   - "AuthManager"
   - Or nested under Canvas like "Canvas/AuthenticationManager"

3. Or add this to your AuthenticationManager.cs Awake method:
```csharp
private void Awake()
{
    // Ensure GameObject has the correct name for JavaScript communication
    gameObject.name = "AuthenticationManager";
    
    // Rest of your Awake code...
}
```

### Testing Checklist

1. ✅ Authentication token is found in cookies/localStorage
2. ✅ Token is passed to Unity via JavaScript bridge
3. ⚠️ Unity GameObject "AuthenticationManager" needs to be findable
4. ⚠️ Validation endpoint URL needs to be corrected in Unity
5. ✅ CORS headers are now properly configured in the API

### Next Steps

1. Update your Unity `AuthenticationManager.cs` with the correct validation endpoint
2. Ensure the GameObject is named "AuthenticationManager" or update the JavaScript to use the correct name
3. Rebuild and re-upload your Unity WebGL build
4. The authentication should then work properly!