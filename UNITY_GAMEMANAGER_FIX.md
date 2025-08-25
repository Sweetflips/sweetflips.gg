# Fix for GameManager Authentication

## Problem
The GameManager.cs is showing "GetAuthToken() not implemented" even though AuthenticationManager successfully retrieves the token.

## Solution
Update your GameManager.cs to use the AuthenticationManager's token instead of its own GetAuthToken method.

### Option 1: Use AuthenticationManager (Recommended)

Replace the GetAuthToken() method in GameManager.cs:

```csharp
private string GetAuthToken()
{
    // Use AuthenticationManager to get the token
    var authManager = FindObjectOfType<Sweetflips.Authentication.AuthenticationManager>();
    if (authManager != null)
    {
        string token = authManager.GetAuthToken();
        if (!string.IsNullOrEmpty(token))
        {
            return token;
        }
    }
    
    Debug.LogWarning("GetAuthToken() - No token available from AuthenticationManager");
    return "";
}

private int GetUserId()
{
    // Use AuthenticationManager to get the user ID
    var authManager = FindObjectOfType<Sweetflips.Authentication.AuthenticationManager>();
    if (authManager != null)
    {
        int userId = authManager.GetUserId();
        if (userId > 0)
        {
            return userId;
        }
    }
    
    // Fallback to a default or placeholder
    return 1;
}
```

### Option 2: Direct JavaScript Bridge

Add the same JavaScript bridge that AuthenticationManager uses:

```csharp
// Add at the top of GameManager class
#if UNITY_WEBGL && !UNITY_EDITOR
[DllImport("__Internal")]
private static extern string GetAuthTokenFromJS();

[DllImport("__Internal")]
private static extern int GetUserIdFromJS();
#endif

private string GetAuthToken()
{
    #if UNITY_WEBGL && !UNITY_EDITOR
    try
    {
        string jsToken = GetAuthTokenFromJS();
        if (!string.IsNullOrEmpty(jsToken))
        {
            return jsToken;
        }
    }
    catch (Exception e)
    {
        Debug.LogWarning($"Failed to get token from JavaScript: {e.Message}");
    }
    #endif
    
    Debug.LogWarning("GetAuthToken() not implemented. Please provide authentication token.");
    return "";
}

private int GetUserId()
{
    #if UNITY_WEBGL && !UNITY_EDITOR
    try
    {
        int jsUserId = GetUserIdFromJS();
        if (jsUserId > 0)
        {
            return jsUserId;
        }
    }
    catch (Exception e)
    {
        Debug.LogWarning($"Failed to get user ID from JavaScript: {e.Message}");
    }
    #endif
    
    return 1; // Default user ID
}
```

### Option 3: Make AuthenticationManager Static

Create a singleton pattern in AuthenticationManager:

```csharp
// In AuthenticationManager.cs
public static AuthenticationManager Instance { get; private set; }

private void Awake()
{
    if (Instance == null)
    {
        Instance = this;
    }
    else if (Instance != this)
    {
        Destroy(gameObject);
        return;
    }
    
    // Rest of Awake code...
}
```

Then in GameManager:

```csharp
private string GetAuthToken()
{
    if (Sweetflips.Authentication.AuthenticationManager.Instance != null)
    {
        return Sweetflips.Authentication.AuthenticationManager.Instance.GetAuthToken();
    }
    
    Debug.LogWarning("AuthenticationManager instance not found");
    return "";
}
```

## API Upload URL

Also update the avatar upload URL in line 81 of GameManager.cs:

```csharp
// Change from:
// Use the Unity-specific endpoint that handles user creation
string apiUrl = "https://sweetflips-gg-env-develop-sweetflips-projects.vercel.app/api/avatar/upload-unity";

// To (for your current deployment):
// Use the Unity-specific endpoint that handles user creation
string apiUrl = "https://sweetflips-gg-env-develop-sweetflips-projects.vercel.app/api/avatar/upload-unity";

// Or for production:
string apiUrl = "https://sweetflips.gg/api/avatar/upload";
```

## Complete Working Example

Here's what the SaveAvatarToAPI method should look like with proper authentication:

```csharp
private IEnumerator SaveAvatarToAPI(string avatarId)
{
    // Get authentication token from AuthenticationManager
    var authManager = FindObjectOfType<Sweetflips.Authentication.AuthenticationManager>();
    if (authManager == null)
    {
        Debug.LogError("AuthenticationManager not found. Cannot save avatar.");
        yield break;
    }
    
    string authToken = authManager.GetAuthToken();
    if (string.IsNullOrEmpty(authToken))
    {
        Debug.LogError("No authentication token available. Cannot save avatar to API.");
        yield break;
    }
    
    int userId = authManager.GetUserId();
    if (userId <= 0)
    {
        Debug.LogWarning("No valid user ID found. Using default.");
        userId = 1;
    }

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

    // Create the request with correct URL
    // Use the Unity-specific endpoint that handles user creation
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

## Testing
After making these changes:
1. Rebuild your Unity WebGL project
2. Upload the new build to public/webgl/Build/
3. The avatar should now be saved to your database successfully

## Verification
You can verify the avatar was saved by checking:
- Browser Network tab for the POST request to /api/avatar/upload
- Database for new avatar records
- Console logs for success messages