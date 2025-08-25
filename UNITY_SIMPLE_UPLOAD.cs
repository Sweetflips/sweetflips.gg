using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Collections.Generic;
using Newtonsoft.Json;
using ReadyPlayerMe.AvatarCreator;

/// <summary>
/// Simple avatar upload script for Unity - works without authentication
/// Place this script on a GameObject in your scene
/// </summary>
public class SimpleAvatarUploader : MonoBehaviour
{
    [Header("API Configuration")]
    [SerializeField] private string apiUrl = "https://sweetflips.gg/api/avatar/upload-public";
    [SerializeField] private int testUserId = 1; // Set this to your test user ID
    
    [Header("Status")]
    [SerializeField] private bool isUploading = false;
    [SerializeField] private string lastResponse = "";
    
    /// <summary>
    /// Call this method after avatar is created in Ready Player Me
    /// </summary>
    public void UploadAvatar(AvatarProperties avatarProperties)
    {
        StartCoroutine(UploadAvatarCoroutine(avatarProperties));
    }
    
    private IEnumerator UploadAvatarCoroutine(AvatarProperties avatarProperties)
    {
        isUploading = true;
        
        // Prepare the request data
        var requestData = new
        {
            userId = testUserId, // Using test user ID - no auth required
            avatarProperties = new
            {
                // Core properties from Ready Player Me
                Id = avatarProperties.Id,
                Partner = avatarProperties.Partner,
                Gender = avatarProperties.Gender?.ToString() ?? "neutral",
                BodyType = avatarProperties.BodyType.ToString(),
                
                // Convert Assets dictionary to a simpler format if needed
                Assets = ConvertAssetsToJson(avatarProperties.Assets),
                
                // Avatar visual data
                Base64Image = avatarProperties.Base64Image,
                isDraft = avatarProperties.isDraft,
                
                // Additional URLs
                avatarUrl = $"https://api.readyplayer.me/v1/avatars/{avatarProperties.Id}.glb",
                avatarLink = $"https://readyplayer.me/avatar/{avatarProperties.Id}",
                
                // Optional metadata
                isPublic = true,
                expression = "happy",
                renderPose = "standing"
            }
        };
        
        // Convert to JSON
        string jsonData = JsonConvert.SerializeObject(requestData);
        Debug.Log($"Sending avatar data: {jsonData}");
        
        // Create request
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
        
        using (UnityWebRequest request = new UnityWebRequest(apiUrl, "POST"))
        {
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            
            // Send request
            yield return request.SendWebRequest();
            
            // Handle response
            if (request.result == UnityWebRequest.Result.Success)
            {
                lastResponse = request.downloadHandler.text;
                Debug.Log($"✅ Avatar uploaded successfully!");
                Debug.Log($"Response: {lastResponse}");
                
                // Parse response if needed
                try
                {
                    var response = JsonConvert.DeserializeObject<Dictionary<string, object>>(lastResponse);
                    if (response.ContainsKey("avatar"))
                    {
                        Debug.Log($"Avatar saved with ID: {response["avatar"]}");
                    }
                }
                catch (System.Exception e)
                {
                    Debug.LogWarning($"Could not parse response: {e.Message}");
                }
                
                OnUploadSuccess(lastResponse);
            }
            else
            {
                lastResponse = $"Error {request.responseCode}: {request.downloadHandler.text}";
                Debug.LogError($"❌ Failed to upload avatar to API: HTTP/{request.responseCode}");
                Debug.LogError($"Error: {request.error}");
                Debug.LogError($"Response: {request.downloadHandler.text}");
                
                OnUploadError(request.error, request.downloadHandler.text);
            }
        }
        
        isUploading = false;
    }
    
    /// <summary>
    /// Convert Ready Player Me assets dictionary to JSON-friendly format
    /// </summary>
    private Dictionary<string, object> ConvertAssetsToJson(Dictionary<AssetType, object> assets)
    {
        if (assets == null) return new Dictionary<string, object>();
        
        var jsonAssets = new Dictionary<string, object>();
        foreach (var kvp in assets)
        {
            // Convert enum key to string
            string key = kvp.Key.ToString();
            jsonAssets[key] = kvp.Value;
        }
        return jsonAssets;
    }
    
    /// <summary>
    /// Called when upload succeeds
    /// </summary>
    protected virtual void OnUploadSuccess(string response)
    {
        // Override this in your implementation
        Debug.Log("Avatar upload completed successfully!");
        
        // Example: Show success UI
        // UIManager.Instance.ShowMessage("Avatar saved!");
    }
    
    /// <summary>
    /// Called when upload fails
    /// </summary>
    protected virtual void OnUploadError(string error, string response)
    {
        // Override this in your implementation
        Debug.LogError($"Avatar upload failed: {error}");
        
        // Example: Show error UI
        // UIManager.Instance.ShowError($"Failed to save avatar: {error}");
    }
    
    // Test method for Unity Editor
    [ContextMenu("Test Upload with Mock Data")]
    private void TestUploadWithMockData()
    {
        var mockProperties = new AvatarProperties
        {
            Id = "test-avatar-" + System.Guid.NewGuid().ToString().Substring(0, 8),
            Partner = "readyplayerme",
            Gender = OutfitGender.Masculine,
            BodyType = BodyType.FullBody,
            Assets = new Dictionary<AssetType, object>
            {
                { AssetType.HairStyle, "short" },
                { AssetType.HairColor, "#000000" },
                { AssetType.SkinColor, "light" }
            },
            Base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            isDraft = false
        };
        
        UploadAvatar(mockProperties);
    }
}

/// <summary>
/// Example integration with Ready Player Me Avatar Creator
/// </summary>
public class AvatarCreatorIntegration : SimpleAvatarUploader
{
    [Header("Ready Player Me")]
    [SerializeField] private AvatarCreatorData avatarCreatorData;
    
    void Start()
    {
        // Subscribe to avatar creation events
        if (avatarCreatorData != null)
        {
            // Listen for when avatar is created
            // This depends on your Ready Player Me setup
        }
    }
    
    /// <summary>
    /// Call this when Ready Player Me avatar is created
    /// </summary>
    public void OnAvatarCreated(string avatarUrl)
    {
        Debug.Log($"Avatar created: {avatarUrl}");
        
        // Extract avatar ID from URL
        string avatarId = ExtractAvatarIdFromUrl(avatarUrl);
        
        // Create properties object
        var properties = new AvatarProperties
        {
            Id = avatarId,
            Partner = "readyplayerme",
            // Set other properties based on your avatar configuration
            isDraft = false
        };
        
        // Upload to your backend
        UploadAvatar(properties);
    }
    
    private string ExtractAvatarIdFromUrl(string url)
    {
        // Extract ID from URLs like:
        // https://api.readyplayer.me/v1/avatars/[ID].glb
        // https://readyplayer.me/avatar/[ID]
        
        if (url.Contains("/avatars/"))
        {
            int start = url.LastIndexOf("/avatars/") + 9;
            int end = url.IndexOf(".", start);
            if (end == -1) end = url.Length;
            return url.Substring(start, end - start);
        }
        else if (url.Contains("/avatar/"))
        {
            int start = url.LastIndexOf("/avatar/") + 8;
            return url.Substring(start);
        }
        
        return System.Guid.NewGuid().ToString();
    }
}