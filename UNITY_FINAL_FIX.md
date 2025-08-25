# Unity GameManager Final Fix

## Update Your GameManager.cs

Replace your GetUserId() method and update the API endpoint:

```csharp
private int GetUserId()
{
    // Method 1: Try to get from AuthenticationManager first
    var authManager = FindObjectOfType<AuthenticationManager>();
    if (authManager != null)
    {
        int userId = authManager.GetUserId();
        if (userId > 0)
        {
            Debug.Log($"Got user ID from AuthenticationManager: {userId}");
            return userId;
        }
    }

    // Method 2: Try direct JavaScript bridge for WebGL
    #if UNITY_WEBGL && !UNITY_EDITOR
    try
    {
        int jsUserId = GetUserIdFromJS();
        if (jsUserId > 0)
        {
            Debug.Log($"Got user ID from JavaScript: {jsUserId}");
            return jsUserId;
        }
    }
    catch (System.Exception e)
    {
        Debug.LogWarning($"Failed to get user ID from JavaScript: {e.Message}");
    }
    #endif

    // Fallback to default (the API will create a user if needed)
    Debug.LogWarning("No user ID available, using default: 1");
    return 1;
}
```

## Add WebGL External Calls

Add these at the top of your GameManager class:

```csharp
#if UNITY_WEBGL && !UNITY_EDITOR
[DllImport("__Internal")]
private static extern string GetAuthTokenFromJS();

[DllImport("__Internal")]
private static extern int GetUserIdFromJS();
#endif
```

## IMPORTANT: Change the API Endpoint

In your SaveAvatarToAPI method, change the API URL to use the Unity-specific endpoint:

```csharp
// Change from:
string apiUrl = "https://sweetflips-gg-env-develop-sweetflips-projects.vercel.app/api/avatar/upload";

// To:
string apiUrl = "https://sweetflips-gg-env-develop-sweetflips-projects.vercel.app/api/avatar/upload-unity";
```

## Complete SaveAvatarToAPI Method

Here's the complete working method:

```csharp
private IEnumerator SaveAvatarToAPI(string avatarId)
{
    // Get authentication token
    string authToken = GetAuthToken();
    if (string.IsNullOrEmpty(authToken))
    {
        Debug.LogError("No authentication token available. Cannot save avatar to API.");
        yield break;
    }

    // Get user ID (optional, API will handle user creation if needed)
    int userId = GetUserId();
    Debug.Log($"Using user ID: {userId} for avatar upload");

    // Prepare the avatar data
    var avatarData = new AvatarUploadData
    {
        userId = userId,
        avatarProperties = new AvatarPropertiesData
        {
            Id = avatarId,
            Partner = avatarCreatorStateMachine.avatarCreatorData.AvatarProperties.Partner,
            Gender = avatarCreatorStateMachine.avatarCreatorData.AvatarProperties.Gender.ToString(),
            BodyType = avatarCreatorStateMachine.avatarCreatorData.AvatarProperties.BodyType.ToString(),
            avatarLink = $"https://readyplayer.me/avatar/{avatarId}",
            avatarUrl = $"{Env.RPM_MODELS_BASE_URL}/{avatarId}.glb",
            isDraft = avatarCreatorStateMachine.avatarCreatorData.AvatarProperties.isDraft
        }
    };

    // Convert to JSON
    string jsonData = JsonUtility.ToJson(avatarData);
    Debug.Log($"Sending avatar data to API: {jsonData}");
    byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonData);

    // Use the Unity-specific endpoint
    string apiUrl = "https://sweetflips-gg-env-develop-sweetflips-projects.vercel.app/api/avatar/upload-unity";
    
    using (UnityWebRequest request = new UnityWebRequest(apiUrl, "POST"))
    {
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");
        request.SetRequestHeader("Authorization", $"Bearer {authToken}");

        // Send the request
        yield return request.SendWebRequest();

        // Handle the response
        if (request.result == UnityWebRequest.Result.Success)
        {
            Debug.Log($"Avatar successfully uploaded to API: {request.downloadHandler.text}");
        }
        else
        {
            Debug.LogError($"Failed to upload avatar to API: {request.error}");
            Debug.LogError($"Response: {request.downloadHandler.text}");
        }
    }
}
```

## Why the Changes?

1. **New Unity-specific endpoint** (`/api/avatar/upload-unity`):
   - Automatically creates a user record if one doesn't exist
   - Handles users who signed up via Supabase but don't have a public.User record yet
   - Has CORS headers configured for Unity WebGL

2. **GetUserId() implementation**:
   - First tries AuthenticationManager (which already works)
   - Falls back to JavaScript bridge
   - Returns 1 as default (API will handle it)

3. **Token format**:
   - Ensures "Bearer " prefix is added to the token
   - The Unity-specific endpoint properly validates Supabase tokens

## Testing

After making these changes:
1. Rebuild your Unity WebGL project
2. Upload the new build files
3. Test avatar creation again

The avatar should now save successfully to the database!

## Verification

You can verify success by:
1. Checking the browser console for "Avatar successfully uploaded to API"
2. Checking the Network tab for a 200 response from `/api/avatar/upload-unity`
3. Checking your database for the new avatar record