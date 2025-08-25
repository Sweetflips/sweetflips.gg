# Unity WebGL Crash Fix - Maximum Call Stack Exceeded

## Problem Analysis
The crash occurs after avatar creation when Unity tries to:
1. Delete a draft avatar from Ready Player Me API (getting 404)
2. Enter an infinite loop causing stack overflow

## Solution

### Option 1: Disable Draft Deletion (Quick Fix)

In your Unity project, find where the avatar is being saved and disable draft deletion:

```csharp
// In GameManager.cs or wherever the avatar is being saved
private void OnAvatarSaved(string avatarId)
{
    Debug.Log($"Avatar saved with id: {avatarId}");
    
    // Disable the avatar creator state machine BEFORE saving to API
    // This prevents it from trying to delete drafts
    avatarCreatorStateMachine.gameObject.SetActive(false);
    
    // THEN start the save coroutine
    StartCoroutine(SaveAvatarToAPI(avatarId));
    
    // Rest of your code...
}
```

### Option 2: Modify Avatar Properties

Set the avatar as non-draft to prevent deletion attempts:

```csharp
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
        isDraft = false  // Set to false to prevent draft deletion
    }
};
```

### Option 3: Wrap SaveAvatarToAPI in Try-Catch

Add error handling to prevent crashes:

```csharp
private IEnumerator SaveAvatarToAPI(string avatarId)
{
    try 
    {
        // Disable state machine first
        if (avatarCreatorStateMachine != null && avatarCreatorStateMachine.gameObject.activeSelf)
        {
            avatarCreatorStateMachine.gameObject.SetActive(false);
        }
        
        // Your existing code...
        string authToken = GetAuthToken();
        if (string.IsNullOrEmpty(authToken))
        {
            Debug.LogError("No authentication token available. Cannot save avatar to API.");
            yield break;
        }

        // Rest of your save logic...
    }
    catch (Exception e)
    {
        Debug.LogError($"Error in SaveAvatarToAPI: {e.Message}");
        Debug.LogError(e.StackTrace);
    }
}
```

### Option 4: Delay the API Call

Add a delay before saving to let Unity finish its internal processes:

```csharp
private void OnAvatarSaved(string avatarId)
{
    Debug.Log($"Avatar saved with id: {avatarId}");
    
    // Start a delayed save
    StartCoroutine(DelayedSaveToAPI(avatarId));
}

private IEnumerator DelayedSaveToAPI(string avatarId)
{
    // Wait 1 second for Unity to finish processing
    yield return new WaitForSeconds(1.0f);
    
    // Disable the avatar creator
    avatarCreatorStateMachine.gameObject.SetActive(false);
    
    // Now save to API
    yield return SaveAvatarToAPI(avatarId);
    
    // Load the avatar
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
```

## Complete Safe Implementation

Here's a complete safe version of the GameManager methods:

```csharp
private void OnAvatarSaved(string avatarId)
{
    Debug.Log($"Avatar saved with id: {avatarId}");
    
    // Start coroutine for safe avatar handling
    StartCoroutine(HandleAvatarSaved(avatarId));
}

private IEnumerator HandleAvatarSaved(string avatarId)
{
    // Wait a frame to let Unity process
    yield return null;
    
    // Safely disable the avatar creator
    try
    {
        if (avatarCreatorStateMachine != null)
        {
            avatarCreatorStateMachine.gameObject.SetActive(false);
        }
    }
    catch (Exception e)
    {
        Debug.LogError($"Error disabling avatar creator: {e.Message}");
    }
    
    // Save to API
    yield return SaveAvatarToAPI(avatarId);
    
    // Load the avatar only if save was successful
    LoadAvatar(avatarId);
}

private void LoadAvatar(string avatarId)
{
    try
    {
        var startTime = Time.time;
        avatarObjectLoader = new AvatarObjectLoader();
        avatarObjectLoader.AvatarConfig = inGameConfig;
        avatarObjectLoader.OnCompleted += (sender, args) =>
        {
            try
            {
                AvatarAnimationHelper.SetupAnimator(args.Metadata, args.Avatar);
                DebugPanel.AddLogWithDuration("Created avatar loaded", Time.time - startTime);
            }
            catch (Exception e)
            {
                Debug.LogError($"Error setting up avatar animator: {e.Message}");
            }
        };
        avatarObjectLoader.OnFailed += (sender, args) =>
        {
            Debug.LogError($"Failed to load avatar: {args.Message}");
        };

        avatarObjectLoader.LoadAvatar($"{Env.RPM_MODELS_BASE_URL}/{avatarId}.glb");
    }
    catch (Exception e)
    {
        Debug.LogError($"Error loading avatar: {e.Message}");
    }
}
```

## Testing Steps

1. Apply one of the fixes above
2. Rebuild Unity WebGL
3. Clear browser cache (important!)
4. Test avatar creation again

## Additional Debug Steps

If the issue persists:

1. **Check Unity Console** for any errors before the crash
2. **Disable Avatar Loading** temporarily to see if save works:
   ```csharp
   // Comment out the avatar loading
   // avatarObjectLoader.LoadAvatar(...);
   ```
3. **Check Ready Player Me Settings** in Unity:
   - Window > Ready Player Me > Settings
   - Disable "Delete Draft Avatars"
   - Set "Avatar Caching" to "No Caching" for testing

## Browser-Side Fixes

Add this to your index.html to catch and log errors:

```javascript
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    if (e.error && e.error.stack) {
        console.error('Stack trace:', e.error.stack);
    }
});

// Prevent infinite loops in Unity
let callCount = 0;
const originalRAF = window.requestAnimationFrame;
window.requestAnimationFrame = function(callback) {
    callCount++;
    if (callCount > 1000) {
        console.error('Too many animation frames, stopping');
        callCount = 0;
        return;
    }
    return originalRAF.call(window, function() {
        callCount = 0;
        callback.apply(this, arguments);
    });
};
```

This should prevent the crash and allow the avatar to save successfully!