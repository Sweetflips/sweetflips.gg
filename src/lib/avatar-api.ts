// Avatar API Helper Functions

// Enums from Ready Player Me
export enum OutfitGender {
  None = 'none',
  Masculine = 'masculine', 
  Feminine = 'feminine',
  Neutral = 'neutral'
}

export enum BodyType {
  None = 'none',
  FullBody = 'fullbody',
  HalfBody = 'halfbody',
  FullBodyXR = 'fullbody-xr'
}

export enum BodyShape {
  None = 'none',
  Average = 'average',
  Athletic = 'athletic',
  HeavySet = 'heavyset',
  PlusSize = 'plussize'
}

export enum RenderPose {
  None = 'none',
  Relaxed = 'relaxed',
  PowerStance = 'powerStance',
  Standing = 'standing',
  ThumbsUp = 'thumbsUp'
}

export enum Expression {
  None = 'none',
  Happy = 'happy',
  Lol = 'lol',
  Sad = 'sad',
  Scared = 'scared',
  Rage = 'rage'
}

export enum AssetType {
  None = 'None',
  SkinColor = 'SkinColor',
  BeardStyle = 'BeardStyle',
  EyeColor = 'EyeColor',
  EyeShape = 'EyeShape',
  EyebrowStyle = 'EyebrowStyle',
  FaceMask = 'FaceMask',
  FaceShape = 'FaceShape',
  Glasses = 'Glasses',
  HairStyle = 'HairStyle',
  Facewear = 'Facewear',
  Headwear = 'Headwear',
  LipShape = 'LipShape',
  NoseShape = 'NoseShape',
  Outfit = 'Outfit',
  Shirt = 'Shirt',
  HairColor = 'HairColor',
  EyebrowColor = 'EyebrowColor',
  BeardColor = 'BeardColor',
  Bottom = 'Bottom',
  Top = 'Top',
  Footwear = 'Footwear',
  AvatarTemplate = 'AvatarTemplate',
  BodyShape = 'BodyShape',
  Costume = 'Costume'
}

export interface AvatarProperties {
  // Core properties from Unity AvatarProperties.cs
  Id?: string;
  Partner?: string;
  Gender?: OutfitGender | string;
  BodyType?: BodyType | string;
  BodyShape?: BodyShape | string;
  Assets?: Record<AssetType | string, any>;
  Base64Image?: string;
  isDraft?: boolean;
  
  // Additional properties for web integration
  avatarUrl?: string;
  avatarLink?: string;
  thumbnailUrl?: string;
  renderPose?: RenderPose | string;
  expression?: Expression | string;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

const API_BASE = '/api/avatar';

/**
 * Upload or create a new avatar for a user
 * @param userId - The user ID
 * @param avatarProperties - The avatar properties from Unity
 * @returns Promise with the created/updated avatar
 */
export async function uploadAvatar(userId: number, avatarProperties: AvatarProperties) {
  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, avatarProperties }),
  });

  if (!response.ok) {
    throw new Error(`Failed to upload avatar: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update an existing avatar for a user
 * @param userId - The user ID
 * @param avatarProperties - The avatar properties to update
 * @returns Promise with the updated avatar
 */
export async function updateAvatar(userId: number, avatarProperties: Partial<AvatarProperties>) {
  const response = await fetch(`${API_BASE}/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, avatarProperties }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update avatar: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get avatar properties for a user by public user ID
 * @param userId - The user ID
 * @returns Promise with the avatar properties
 */
export async function getAvatarProperties(userId: number) {
  const response = await fetch(`${API_BASE}/${userId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null; // Avatar not found
    }
    throw new Error(`Failed to get avatar: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get avatar properties for a user by auth user ID
 * @param authUserId - The auth user ID (from Supabase)
 * @returns Promise with the avatar properties
 */
export async function getAvatarPropertiesByAuth(authUserId: string) {
  const response = await fetch(`${API_BASE}/by-auth/${authUserId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null; // Avatar not found
    }
    throw new Error(`Failed to get avatar: ${response.statusText}`);
  }

  return response.json();
}