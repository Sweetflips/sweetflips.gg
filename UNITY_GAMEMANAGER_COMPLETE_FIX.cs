using ReadyPlayerMe.AvatarCreator;
using ReadyPlayerMe.Core;
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Text;
using Sweetflips.Authentication;
using System.Runtime.InteropServices;

namespace ReadyPlayerMe.Samples.AvatarCreatorWizard
{
    public class GameManager : MonoBehaviour
    {
        [SerializeField] private AvatarCreatorStateMachine avatarCreatorStateMachine;
        [SerializeField] private AvatarConfig inGameConfig;

        private AvatarObjectLoader avatarObjectLoader;

        // Add WebGL external calls for direct access if AuthenticationManager is not available
        #if UNITY_WEBGL && !UNITY_EDITOR
        [DllImport("__Internal")]
        private static extern string GetAuthTokenFromJS();
        
        [DllImport("__Internal")]
        private static extern int GetUserIdFromJS();
        #endif

        private void OnEnable()
        {
            avatarCreatorStateMachine.AvatarSaved += OnAvatarSaved;
        }

        private void OnDisable()
        {
            avatarCreatorStateMachine.AvatarSaved -= OnAvatarSaved;
            avatarObjectLoader?.Cancel();
        }

        private void OnAvatarSaved(string avatarId)
        {
            Debug.Log($"Avatar saved with id: {avatarId}");
            
            // Start coroutine to save avatar to API
            StartCoroutine(SaveAvatarToAPI(avatarId));
            
            avatarCreatorStateMachine.gameObject.SetActive(false);

            var startTime = Time.time;
            avatarObjectLoader = new AvatarObjectLoader();
            avatarObjectLoader.AvatarConfig = inGameConfig;
            avatarObjectLoader.OnCompleted += (sender, args) =>
            {
                AvatarAnimationHelper.SetupAnimator(args.Metadata, args.Avatar);
                DebugPanel.AddLogWithDuration("Created avatar loaded", Time.time - startTime);
            };

            avatarObjectLoader.LoadAvatar($"{Env.RPM_MODELS_BASE_URL}/{avatarId}.glb");
        }

        private IEnumerator SaveAvatarToAPI(string avatarId)
        {
            // Get authentication token
            string authToken = GetAuthToken();
            if (string.IsNullOrEmpty(authToken))
            {
                Debug.LogError("No authentication token available. Cannot save avatar to API.");
                yield break;
            }

            // Get user ID
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

            // Create the request
            string apiUrl = "https://sweetflips-gg-env-develop-sweetflips-projects.vercel.app/api/avatar/upload";
            using (UnityWebRequest request = new UnityWebRequest(apiUrl, "POST"))
            {
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");
                
                // IMPORTANT: Make sure the token is properly formatted
                string formattedToken = authToken.StartsWith("Bearer ") ? authToken : $"Bearer {authToken}";
                request.SetRequestHeader("Authorization", formattedToken);
                
                Debug.Log($"Sending request with Authorization header: {formattedToken.Substring(0, 20)}..."); // Log first 20 chars for security

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
                    Debug.LogError($"Response Code: {request.responseCode}");
                    
                    // Additional debugging
                    if (request.responseCode == 401)
                    {
                        Debug.LogError("Authentication failed. Token may be invalid or expired.");
                        Debug.LogError($"Token used: {authToken.Substring(0, System.Math.Min(20, authToken.Length))}...");
                    }
                }
            }
        }

        private string GetAuthToken()
        {
            // Method 1: Try to get from AuthenticationManager first
            var authManager = FindObjectOfType<AuthenticationManager>();
            if (authManager != null)
            {
                string token = authManager.GetAuthToken();
                if (!string.IsNullOrEmpty(token))
                {
                    Debug.Log($"Got token from AuthenticationManager: {token.Substring(0, System.Math.Min(20, token.Length))}...");
                    return token;
                }
            }

            // Method 2: Try direct JavaScript bridge for WebGL
            #if UNITY_WEBGL && !UNITY_EDITOR
            try
            {
                string jsToken = GetAuthTokenFromJS();
                if (!string.IsNullOrEmpty(jsToken))
                {
                    Debug.Log($"Got token from JavaScript: {jsToken.Substring(0, System.Math.Min(20, jsToken.Length))}...");
                    return jsToken;
                }
            }
            catch (System.Exception e)
            {
                Debug.LogWarning($"Failed to get token from JavaScript: {e.Message}");
            }
            #endif

            Debug.LogWarning("No authentication token available from any source");
            return "";
        }

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

            // Fallback to default
            Debug.LogWarning("No user ID available, using default: 1");
            return 1;
        }

        [System.Serializable]
        private class AvatarUploadData
        {
            public int userId;
            public AvatarPropertiesData avatarProperties;
        }

        [System.Serializable]
        private class AvatarPropertiesData
        {
            public string Id;
            public string Partner;
            public string Gender;
            public string BodyType;
            public string avatarLink;
            public string avatarUrl;
            public bool isDraft;
            // Add more properties as needed based on the API documentation
        }
    }
}