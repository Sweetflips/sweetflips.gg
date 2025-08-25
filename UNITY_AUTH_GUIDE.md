# Unity Authentication Guide for Avatar API

## Overview
The Avatar API requires authentication to ensure users can only modify their own avatars. Here's how to implement authentication in your Unity WebGL build.

## Authentication Methods

### Method 1: Using Bearer Token (Recommended)

If your users log in through your web application first, you can pass the authentication token to Unity.

#### Step 1: Pass Token from Web to Unity

In your web application (JavaScript):
```javascript
// After user logs in, get their auth token
const authToken = localStorage.getItem('supabase.auth.token'); // or however you store it
const userId = getUserId(); // Get the current user's ID

// Pass to Unity when initializing
unityInstance.SendMessage('AuthManager', 'SetAuthToken', authToken);
unityInstance.SendMessage('AuthManager', 'SetUserId', userId.toString());
```

#### Step 2: Store Token in Unity

Create an `AuthManager.cs` script:
```csharp
using UnityEngine;

public class AuthManager : MonoBehaviour
{
    private static AuthManager instance;
    public static AuthManager Instance
    {
        get
        {
            if (instance == null)
            {
                instance = FindObjectOfType<AuthManager>();
                if (instance == null)
                {
                    GameObject go = new GameObject("AuthManager");
                    instance = go.AddComponent<AuthManager>();
                    DontDestroyOnLoad(go);
                }
            }
            return instance;
        }
    }

    private string authToken;
    private int userId;

    public string AuthToken => authToken;
    public int UserId => userId;

    void Awake()
    {
        if (instance == null)
        {
            instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else if (instance != this)
        {
            Destroy(gameObject);
        }
    }

    public void SetAuthToken(string token)
    {
        authToken = token;
        Debug.Log($"Auth token set: {!string.IsNullOrEmpty(token)}");
    }

    public void SetUserId(string id)
    {
        if (int.TryParse(id, out int parsedId))
        {
            userId = parsedId;
            Debug.Log($"User ID set: {userId}");
        }
    }
}
```

#### Step 3: Update Your API Call with Authentication

Update your `GameManager.cs` or avatar upload script:

```csharp
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using Newtonsoft.Json;
using ReadyPlayerMe.AvatarCreator;

public class GameManager : MonoBehaviour
{
    private const string API_BASE = "https://sweetflips.gg/api/avatar";
    
    IEnumerator SaveAvatarToAPI(AvatarProperties avatarProperties)
    {
        // Get auth token and user ID from AuthManager
        string authToken = AuthManager.Instance.AuthToken;
        int userId = AuthManager.Instance.UserId;
        
        if (string.IsNullOrEmpty(authToken))
        {
            Debug.LogError("No auth token available. User must be logged in.");
            yield break;
        }
        
        if (userId == 0)
        {
            Debug.LogError("No user ID available.");
            yield break;
        }

        // Prepare the request data
        var requestData = new
        {
            userId = userId,
            avatarProperties = new
            {
                Id = avatarProperties.Id,
                Partner = avatarProperties.Partner,
                Gender = avatarProperties.Gender?.ToString(),
                BodyType = avatarProperties.BodyType.ToString(),
                Assets = avatarProperties.Assets,
                Base64Image = avatarProperties.Base64Image,
                isDraft = avatarProperties.isDraft,
                avatarUrl = $"https://api.readyplayer.me/v1/avatars/{avatarProperties.Id}.glb",
                avatarLink = $"https://readyplayer.me/avatar/{avatarProperties.Id}"
            }
        };

        string jsonData = JsonConvert.SerializeObject(requestData);
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);

        using (UnityWebRequest request = new UnityWebRequest(API_BASE + "/upload", "POST"))
        {
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            
            // Set headers
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("Authorization", $"Bearer {authToken}"); // Add auth header
            
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Avatar uploaded successfully!");
                Debug.Log($"Response: {request.downloadHandler.text}");
            }
            else
            {
                Debug.LogError($"Failed to upload avatar: HTTP/{request.responseCode}");
                Debug.LogError($"Error: {request.error}");
                Debug.LogError($"Response: {request.downloadHandler.text}");
            }
        }
    }
}
```

### Method 2: Using Session Cookies (WebGL Only)

For WebGL builds running in the same domain, cookies are automatically sent:

```csharp
IEnumerator SaveAvatarToAPIWithCookies(AvatarProperties avatarProperties)
{
    // In WebGL, cookies are automatically included if:
    // 1. Your Unity WebGL build is hosted on the same domain (sweetflips.gg)
    // 2. The user is already logged in on the website
    
    var requestData = new
    {
        userId = AuthManager.Instance.UserId,
        avatarProperties = new
        {
            // ... avatar properties
        }
    };

    string jsonData = JsonConvert.SerializeObject(requestData);
    byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);

    using (UnityWebRequest request = new UnityWebRequest(API_BASE + "/upload", "POST"))
    {
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");
        
        // No Authorization header needed - cookies will be sent automatically
        
        yield return request.SendWebRequest();
        // ... handle response
    }
}
```

### Method 3: JavaScript Bridge (Recommended for WebGL)

Create a more robust integration using JavaScript:

#### Unity C# Code:
```csharp
using System.Runtime.InteropServices;
using UnityEngine;

public class AvatarAPIBridge : MonoBehaviour
{
    [DllImport("__Internal")]
    private static extern void UploadAvatarJS(string avatarDataJson);
    
    [DllImport("__Internal")]
    private static extern string GetAuthToken();
    
    [DllImport("__Internal")]
    private static extern string GetUserId();

    public void SaveAvatar(AvatarProperties properties)
    {
        var data = new
        {
            avatarProperties = properties
        };
        
        string json = JsonConvert.SerializeObject(data);
        
        #if UNITY_WEBGL && !UNITY_EDITOR
            UploadAvatarJS(json);
        #else
            Debug.Log("Avatar upload only works in WebGL build");
        #endif
    }
    
    // Called from JavaScript when upload completes
    public void OnAvatarUploaded(string response)
    {
        Debug.Log($"Avatar uploaded: {response}");
    }
    
    // Called from JavaScript on error
    public void OnAvatarUploadError(string error)
    {
        Debug.LogError($"Avatar upload failed: {error}");
    }
}
```

#### JavaScript Plugin (`Plugins/WebGL/AvatarAPI.jslib`):
```javascript
mergeInto(LibraryManager.library, {
    UploadAvatarJS: function(avatarDataJsonPtr) {
        var avatarDataJson = UTF8ToString(avatarDataJsonPtr);
        var data = JSON.parse(avatarDataJson);
        
        // Get auth token from your web app
        var authToken = localStorage.getItem('supabase.auth.token') || 
                       sessionStorage.getItem('auth_token');
        
        // Get user ID from your web app
        var userId = localStorage.getItem('user_id') || 
                    sessionStorage.getItem('user_id');
        
        if (!authToken || !userId) {
            unityInstance.SendMessage('AvatarAPIBridge', 'OnAvatarUploadError', 
                'User not authenticated');
            return;
        }
        
        // Add userId to the data
        data.userId = parseInt(userId);
        
        // Make the API call
        fetch('/api/avatar/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
            body: JSON.stringify(data),
            credentials: 'include' // Include cookies
        })
        .then(response => response.json())
        .then(result => {
            unityInstance.SendMessage('AvatarAPIBridge', 'OnAvatarUploaded', 
                JSON.stringify(result));
        })
        .catch(error => {
            unityInstance.SendMessage('AvatarAPIBridge', 'OnAvatarUploadError', 
                error.toString());
        });
    },
    
    GetAuthToken: function() {
        var token = localStorage.getItem('supabase.auth.token') || '';
        var bufferSize = lengthBytesUTF8(token) + 1;
        var buffer = _malloc(bufferSize);
        stringToUTF8(token, buffer, bufferSize);
        return buffer;
    },
    
    GetUserId: function() {
        var userId = localStorage.getItem('user_id') || '0';
        var bufferSize = lengthBytesUTF8(userId) + 1;
        var buffer = _malloc(bufferSize);
        stringToUTF8(userId, buffer, bufferSize);
        return buffer;
    }
});
```

## Setting Up Authentication in Your Web App

In your main web application (Next.js), pass authentication to Unity:

```javascript
// In your page where Unity is embedded
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Your auth context

export default function UnityAvatarPage() {
    const { user, token } = useAuth();
    
    useEffect(() => {
        // Wait for Unity to load
        window.addEventListener('unityLoaded', () => {
            if (window.unityInstance && user) {
                // Pass auth info to Unity
                window.unityInstance.SendMessage('AuthManager', 'SetAuthToken', token);
                window.unityInstance.SendMessage('AuthManager', 'SetUserId', user.id.toString());
                
                // Store in localStorage for JavaScript bridge
                localStorage.setItem('supabase.auth.token', token);
                localStorage.setItem('user_id', user.id.toString());
            }
        });
    }, [user, token]);
    
    return (
        <div id="unity-container">
            {/* Unity WebGL content */}
        </div>
    );
}
```

## Testing Authentication

1. **Test in Unity Editor**:
```csharp
// For testing in editor, set mock values
#if UNITY_EDITOR
    void Start()
    {
        AuthManager.Instance.SetAuthToken("test-token-12345");
        AuthManager.Instance.SetUserId("1");
    }
#endif
```

2. **Debug Authentication Issues**:
```csharp
IEnumerator TestAuth()
{
    using (UnityWebRequest request = UnityWebRequest.Get(API_BASE + "/test-auth"))
    {
        request.SetRequestHeader("Authorization", $"Bearer {AuthManager.Instance.AuthToken}");
        
        yield return request.SendWebRequest();
        
        Debug.Log($"Auth test response: {request.responseCode}");
        Debug.Log($"Response body: {request.downloadHandler.text}");
    }
}
```

## Common Issues and Solutions

### Issue: 401 Unauthorized
- **Cause**: No auth token provided
- **Solution**: Ensure user is logged in and token is passed to Unity

### Issue: 403 Forbidden
- **Cause**: User trying to modify another user's avatar
- **Solution**: Ensure userId matches the authenticated user

### Issue: CORS errors
- **Cause**: Cross-origin requests blocked
- **Solution**: 
  - Host Unity build on same domain
  - Or configure CORS in your API
  - Or use JavaScript bridge method

### Issue: Token expired
- **Cause**: Auth token has expired
- **Solution**: Refresh token before making API calls:
```javascript
// In JavaScript
async function refreshToken() {
    const { data, error } = await supabase.auth.refreshSession();
    if (data?.session?.access_token) {
        unityInstance.SendMessage('AuthManager', 'SetAuthToken', 
            data.session.access_token);
    }
}
```

## Security Notes

1. **Never hardcode tokens** in Unity code
2. **Use HTTPS** for all API calls
3. **Validate tokens** on the server side
4. **Implement token refresh** for long sessions
5. **Use environment-specific API URLs**

## Example Implementation

Complete example available in the Unity sample project:
- `Assets/Scripts/Avatar/AvatarUploader.cs`
- `Assets/Plugins/WebGL/AvatarAPI.jslib`
- `Assets/Scripts/Auth/AuthManager.cs`