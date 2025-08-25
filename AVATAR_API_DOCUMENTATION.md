# Avatar API Documentation

## Overview
This API provides endpoints for managing Ready Player Me avatars integrated with the Unity WebGL avatar creator.

## Data Structure

### Avatar Properties
The avatar system stores comprehensive data matching Ready Player Me's AvatarProperties structure:

```typescript
{
  // Core Properties
  Id: string           // Ready Player Me avatar ID
  Partner: string      // Partner identifier
  
  // Body Configuration
  Gender: string       // Options: masculine, feminine, neutral
  BodyType: string     // Options: fullbody, halfbody, fullbody-xr
  BodyShape: string    // Options: average, athletic, heavyset, plussize
  
  // Customization Assets
  Assets: {
    SkinColor: string
    HairStyle: string
    HairColor: string
    EyeColor: string
    EyeShape: string
    EyebrowStyle: string
    EyebrowColor: string
    BeardStyle: string
    BeardColor: string
    FaceShape: string
    NoseShape: string
    LipShape: string
    Outfit: string
    Top: string
    Bottom: string
    Footwear: string
    Glasses: string
    Headwear: string
    Facewear: string
    // ... and more
  }
  
  // Visual Data
  Base64Image: string  // Base64 encoded preview image
  avatarUrl: string    // URL to 3D model (.glb file)
  avatarLink: string   // Ready Player Me shareable avatar link (e.g. https://readyplayer.me/avatar/[id])
  thumbnailUrl: string // URL to thumbnail image
  
  // Display Settings
  renderPose: string   // Options: relaxed, powerStance, standing, thumbsUp
  expression: string   // Options: happy, lol, sad, scared, rage
  
  // Status
  isDraft: boolean     // Whether avatar is in draft state
  isPublic: boolean    // Whether avatar is publicly visible
  
  // Additional Data
  metadata: object     // Any additional platform-specific data
}
```

## API Endpoints

### 1. Upload/Create Avatar
**POST** `/api/avatar/upload`

Creates a new avatar or updates an existing one for a user.

**Request Body:**
```json
{
  "userId": 123,
  "avatarProperties": {
    "Id": "avatar-id-123",
    "Partner": "readyplayerme",
    "Gender": "masculine",
    "BodyType": "fullbody",
    "Assets": {
      "HairStyle": "short",
      "HairColor": "#000000"
    },
    "Base64Image": "data:image/png;base64,...",
    "avatarLink": "https://readyplayer.me/avatar/12345abc",
    "isDraft": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "avatar": { /* avatar data */ }
}
```

### 2. Update Avatar
**PUT/PATCH** `/api/avatar/update`

Updates specific properties of an existing avatar.

**Request Body:**
```json
{
  "userId": 123,
  "avatarProperties": {
    "Assets": {
      "HairColor": "#FF0000"
    },
    "expression": "happy"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Avatar updated successfully",
  "avatar": { /* updated avatar data */ }
}
```

### 3. Get Avatar Properties
**GET** `/api/avatar/{userId}`

Retrieves avatar properties for a specific user.

**Response:**
```json
{
  "success": true,
  "avatar": {
    "Id": "avatar-id-123",
    "Partner": "readyplayerme",
    "Gender": "masculine",
    "BodyType": "fullbody",
    "Assets": { /* assets data */ },
    "Base64Image": "data:image/png;base64,...",
    "avatarLink": "https://readyplayer.me/avatar/12345abc",
    "isDraft": false,
    // ... other properties
  }
}
```

## Error Responses

All endpoints may return the following error responses:

- **400 Bad Request**: Missing or invalid parameters
- **401 Unauthorized**: No authentication provided
- **403 Forbidden**: User lacks permission for this operation
- **404 Not Found**: Avatar not found for specified user
- **500 Internal Server Error**: Server error during operation

## Authentication

The upload and update endpoints require authentication. The requesting user must either:
1. Be the owner of the avatar (matching userId)
2. Have admin role

## Unity Integration

### JavaScript to Unity Communication
```javascript
// Send avatar data to Unity
const avatarData = await getAvatarProperties(userId);
unityInstance.SendMessage('AvatarManager', 'LoadAvatar', JSON.stringify(avatarData));
```

### Unity to JavaScript Communication
```javascript
// Receive avatar updates from Unity
window.SaveAvatarFromUnity = async (avatarJson) => {
  const avatarData = JSON.parse(avatarJson);
  await uploadAvatar(userId, avatarData);
};
```

## Helper Functions

Use the provided helper functions in `src/lib/avatar-api.ts`:

```typescript
import { uploadAvatar, updateAvatar, getAvatarProperties } from '@/lib/avatar-api';

// Upload new avatar
const result = await uploadAvatar(userId, avatarProperties);

// Update existing avatar
const updated = await updateAvatar(userId, { expression: 'happy' });

// Get avatar data
const avatar = await getAvatarProperties(userId);
```

## Database Schema

The avatar data is stored in PostgreSQL with the following structure:
- Primary storage in `Avatar` table
- Linked to `User` table via foreign key
- Assets stored as JSON for flexibility
- Indexes on userId and avatarId for performance