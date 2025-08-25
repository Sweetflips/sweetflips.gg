# Unity Avatar Integration Guide

## Overview
This guide explains how to integrate your Unity WebGL Ready Player Me avatar creator with the Sweetflips backend API for storing and retrieving avatar data.

## API Endpoints

### Base URL
```
https://sweetflips.gg/api/avatar
```

## 1. Avatar Data Structure

The avatar system expects data matching Ready Player Me's `AvatarProperties` structure:

```csharp
[Serializable]
public struct AvatarProperties
{
    public string Id;           // Ready Player Me avatar ID
    public string Partner;      // Partner identifier
    public OutfitGender Gender; // masculine, feminine, neutral
    public BodyType BodyType;   // fullbody, halfbody, fullbody-xr
    public Dictionary<AssetType, object> Assets; // Customization assets
    public string Base64Image;  // Base64 encoded preview
    public bool isDraft;        // Draft status
}
```

### Additional fields supported by the API:
- `avatarUrl` (string): URL to the .glb 3D model file
- `avatarLink` (string): Ready Player Me shareable avatar link (e.g. https://readyplayer.me/avatar/[id])
- `thumbnailUrl` (string): URL to thumbnail image
- `bodyShape` (string): average, athletic, heavyset, plussize
- `renderPose` (string): relaxed, powerStance, standing, thumbsUp
- `expression` (string): happy, lol, sad, scared, rage
- `isPublic` (bool): Whether avatar is publicly visible
- `metadata` (object): Any additional custom data

## 2. API Integration

### Upload/Create Avatar

**Endpoint:** `POST /api/avatar/upload`

```csharp
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using Newtonsoft.Json;

public class AvatarAPIManager : MonoBehaviour
{
    private const string API_BASE = "https://sweetflips.gg/api/avatar";
    
    public IEnumerator UploadAvatar(int userId, AvatarProperties avatarProps)
    {
        // Prepare the request data
        var requestData = new
        {
            userId = userId,
            avatarProperties = new
            {
                Id = avatarProps.Id,
                Partner = avatarProps.Partner,
                Gender = avatarProps.Gender.ToString(),
                BodyType = avatarProps.BodyType.ToString(),
                Assets = avatarProps.Assets,
                Base64Image = avatarProps.Base64Image,
                isDraft = avatarProps.isDraft,
                // Add additional fields if needed
                avatarUrl = GetAvatarGLBUrl(), // Your method to get GLB URL
                avatarLink = GetAvatarLink(), // Ready Player Me shareable link
                thumbnailUrl = GetThumbnailUrl() // Your method to get thumbnail
            }
        };
        
        string jsonData = JsonConvert.SerializeObject(requestData);
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
        
        using (UnityWebRequest request = new UnityWebRequest(API_BASE + "/upload", "POST"))
        {
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            
            // Add authentication header if you have a token
            // request.SetRequestHeader("Authorization", "Bearer " + authToken);
            
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Avatar uploaded successfully: " + request.downloadHandler.text);
                // Handle success response
                var response = JsonConvert.DeserializeObject<AvatarUploadResponse>(request.downloadHandler.text);
                OnAvatarUploaded(response);
            }
            else
            {
                Debug.LogError("Avatar upload failed: " + request.error);
                Debug.LogError("Response: " + request.downloadHandler.text);
            }
        }
    }
}
```

### Update Avatar

**Endpoint:** `PUT /api/avatar/update`

```csharp
public IEnumerator UpdateAvatar(int userId, Dictionary<string, object> updates)
{
    var requestData = new
    {
        userId = userId,
        avatarProperties = updates
    };
    
    string jsonData = JsonConvert.SerializeObject(requestData);
    byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
    
    using (UnityWebRequest request = new UnityWebRequest(API_BASE + "/update", "PUT"))
    {
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");
        
        yield return request.SendWebRequest();
        
        if (request.result == UnityWebRequest.Result.Success)
        {
            Debug.Log("Avatar updated successfully");
        }
        else
        {
            Debug.LogError("Avatar update failed: " + request.error);
        }
    }
}
```

### Get Avatar Properties

**Endpoint:** `GET /api/avatar/{userId}`

```csharp
public IEnumerator GetAvatarProperties(int userId)
{
    string url = $"{API_BASE}/{userId}";
    
    using (UnityWebRequest request = UnityWebRequest.Get(url))
    {
        yield return request.SendWebRequest();
        
        if (request.result == UnityWebRequest.Result.Success)
        {
            var response = JsonConvert.DeserializeObject<AvatarGetResponse>(request.downloadHandler.text);
            if (response.success)
            {
                // Convert response to AvatarProperties
                AvatarProperties props = new AvatarProperties
                {
                    Id = response.avatar.Id,
                    Partner = response.avatar.Partner,
                    Gender = ParseGender(response.avatar.Gender),
                    BodyType = ParseBodyType(response.avatar.BodyType),
                    Assets = response.avatar.Assets,
                    Base64Image = response.avatar.Base64Image,
                    isDraft = response.avatar.isDraft
                };
                
                OnAvatarLoaded(props);
            }
        }
        else if (request.responseCode == 404)
        {
            Debug.Log("No avatar found for user");
            // Handle no avatar case - maybe show avatar creator
        }
        else
        {
            Debug.LogError("Failed to get avatar: " + request.error);
        }
    }
}
```

## 3. Response Classes

```csharp
[Serializable]
public class AvatarUploadResponse
{
    public bool success;
    public string message;
    public AvatarData avatar;
}

[Serializable]
public class AvatarGetResponse
{
    public bool success;
    public AvatarData avatar;
}

[Serializable]
public class AvatarData
{
    public string Id;
    public string Partner;
    public string Gender;
    public string BodyType;
    public string BodyShape;
    public Dictionary<string, object> Assets;
    public string Base64Image;
    public bool isDraft;
    public string avatarUrl;
    public string avatarLink;
    public string thumbnailUrl;
    public string renderPose;
    public string expression;
    public bool isPublic;
    public Dictionary<string, object> metadata;
}
```

## 4. JavaScript Bridge (For WebGL)

Since you're using WebGL, you can also communicate through JavaScript:

### Unity to JavaScript

```csharp
[DllImport("__Internal")]
private static extern void SaveAvatarToBackend(string avatarJson);

public void SaveAvatar(AvatarProperties props, int userId)
{
    var data = new
    {
        userId = userId,
        avatarProperties = props
    };
    
    string json = JsonConvert.SerializeObject(data);
    
    #if UNITY_WEBGL && !UNITY_EDITOR
        SaveAvatarToBackend(json);
    #endif
}
```

### JavaScript Plugin (Plugins/WebGL/AvatarBridge.jslib)

```javascript
mergeInto(LibraryManager.library, {
    SaveAvatarToBackend: function(avatarJsonPtr) {
        var avatarJson = UTF8ToString(avatarJsonPtr);
        var data = JSON.parse(avatarJson);
        
        // Call the API using fetch
        fetch('/api/avatar/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            // Send result back to Unity
            unityInstance.SendMessage('AvatarManager', 'OnAvatarSaved', JSON.stringify(result));
        })
        .catch(error => {
            unityInstance.SendMessage('AvatarManager', 'OnAvatarSaveError', error.toString());
        });
    },
    
    LoadAvatarFromBackend: function(userId) {
        fetch('/api/avatar/' + userId)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.avatar) {
                    unityInstance.SendMessage('AvatarManager', 'OnAvatarLoaded', JSON.stringify(data.avatar));
                } else {
                    unityInstance.SendMessage('AvatarManager', 'OnNoAvatarFound', '');
                }
            })
            .catch(error => {
                unityInstance.SendMessage('AvatarManager', 'OnAvatarLoadError', error.toString());
            });
    }
});
```

## 5. Complete Integration Example

```csharp
using UnityEngine;
using ReadyPlayerMe.AvatarCreator;
using ReadyPlayerMe.Core;
using System.Collections;

public class SweetflipsAvatarManager : MonoBehaviour
{
    private AvatarCreatorData avatarCreatorData;
    private int currentUserId;
    
    void Start()
    {
        // Get user ID from your session/auth system
        currentUserId = GetCurrentUserId();
        
        // Load existing avatar or show creator
        StartCoroutine(LoadUserAvatar());
    }
    
    IEnumerator LoadUserAvatar()
    {
        yield return GetAvatarProperties(currentUserId);
    }
    
    // Called when avatar is created/modified in Ready Player Me
    public void OnAvatarCreated(AvatarProperties properties)
    {
        StartCoroutine(SaveAvatarToBackend(properties));
    }
    
    IEnumerator SaveAvatarToBackend(AvatarProperties properties)
    {
        // Add any additional data
        var avatarData = new
        {
            userId = currentUserId,
            avatarProperties = new
            {
                Id = properties.Id,
                Partner = properties.Partner,
                Gender = properties.Gender.ToString().ToLower(),
                BodyType = properties.BodyType.ToString().ToLower(),
                Assets = ConvertAssetsToJson(properties.Assets),
                Base64Image = properties.Base64Image,
                isDraft = properties.isDraft,
                avatarUrl = GetAvatarModelUrl(properties.Id),
                avatarLink = GetAvatarShareableLink(properties.Id),
                expression = "happy",
                renderPose = "standing"
            }
        };
        
        // Upload to backend
        yield return UploadAvatar(currentUserId, properties);
    }
    
    // Convert Ready Player Me assets to JSON-serializable format
    private Dictionary<string, object> ConvertAssetsToJson(Dictionary<AssetType, object> assets)
    {
        var jsonAssets = new Dictionary<string, object>();
        foreach (var kvp in assets)
        {
            // Convert AssetType enum to string matching backend expectations
            string key = kvp.Key.ToString();
            jsonAssets[key] = kvp.Value;
        }
        return jsonAssets;
    }
    
    private string GetAvatarModelUrl(string avatarId)
    {
        // Construct Ready Player Me GLB URL
        return $"https://api.readyplayer.me/v1/avatars/{avatarId}.glb";
    }
    
    private string GetAvatarShareableLink(string avatarId)
    {
        // Construct Ready Player Me shareable link
        return $"https://readyplayer.me/avatar/{avatarId}";
    }
}
```

## 6. Error Handling

The API returns standard HTTP status codes:

- **200**: Success
- **400**: Bad Request (missing/invalid parameters)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (user lacks permission)
- **404**: Not Found (no avatar for user)
- **500**: Server Error

Error response format:
```json
{
    "error": "Error message description"
}
```

## 7. Authentication

If your API requires authentication, include the user's auth token:

```csharp
request.SetRequestHeader("Authorization", "Bearer " + authToken);
```

Or use cookies if your authentication system uses them:
```csharp
request.SetRequestHeader("Cookie", cookieValue);
```

## 8. Best Practices

1. **Cache Avatar Data**: Store loaded avatar data locally to reduce API calls
2. **Compress Images**: Compress Base64 images before sending to reduce payload size
3. **Batch Updates**: Group multiple property changes into single update calls
4. **Error Recovery**: Implement retry logic for failed API calls
5. **Offline Support**: Queue avatar updates when offline and sync when connected

## 9. Testing

Test endpoints using curl or Postman:

```bash
# Upload avatar
curl -X POST https://sweetflips.gg/api/avatar/upload \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "avatarProperties": {
      "Id": "test-avatar-id",
      "Gender": "masculine",
      "BodyType": "fullbody",
      "Assets": {},
      "isDraft": false
    }
  }'

# Get avatar
curl https://sweetflips.gg/api/avatar/123
```

## 10. Support

For issues or questions about the API integration:
- Check API documentation at `/AVATAR_API_DOCUMENTATION.md`
- Review error messages in Unity Console and browser console
- Ensure CORS is properly configured for WebGL builds
- Verify authentication tokens are valid and included in requests