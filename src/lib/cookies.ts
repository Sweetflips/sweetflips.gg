/**
 * Cookie management utilities for authentication
 */

export const COOKIE_OPTIONS = {
  httpOnly: false, // Allow JavaScript access for Unity WebGL
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

/**
 * Set a cookie value (client-side)
 */
export function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; ${
    window.location.protocol === 'https:' ? 'secure; ' : ''
  }samesite=lax`;
  
  // Also store in localStorage and sessionStorage for redundancy
  try {
    localStorage.setItem(name, value);
    sessionStorage.setItem(name, value);
  } catch (e) {
    console.warn('Failed to store in localStorage/sessionStorage:', e);
  }
}

/**
 * Get a cookie value (client-side)
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try cookie first
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  
  // Fallback to localStorage
  try {
    const value = localStorage.getItem(name);
    if (value) return value;
  } catch (e) {
    console.warn('Failed to read from localStorage:', e);
  }
  
  // Fallback to sessionStorage
  try {
    const value = sessionStorage.getItem(name);
    if (value) return value;
  } catch (e) {
    console.warn('Failed to read from sessionStorage:', e);
  }
  
  return null;
}

/**
 * Delete a cookie (client-side)
 */
export function deleteCookie(name: string): void {
  if (typeof window === 'undefined') return;
  
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  
  try {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  } catch (e) {
    console.warn('Failed to remove from localStorage/sessionStorage:', e);
  }
}

/**
 * Store authentication data for Unity WebGL
 */
export function storeAuthForUnity(token: string, userId: string | number, authUserId?: string): void {
  // Store in multiple places for Unity to find
  setCookie('authToken', token);
  setCookie('userId', userId.toString());
  
  if (authUserId) {
    setCookie('authUserId', authUserId);
  }
  
  // Also set on window object for immediate access
  if (typeof window !== 'undefined') {
    (window as any).authToken = token;
    (window as any).userId = userId;
    (window as any).authUserId = authUserId;
  }
}

/**
 * Clear authentication data
 */
export function clearAuthData(): void {
  deleteCookie('authToken');
  deleteCookie('userId');
  deleteCookie('authUserId');
  
  if (typeof window !== 'undefined') {
    delete (window as any).authToken;
    delete (window as any).userId;
    delete (window as any).authUserId;
  }
}

/**
 * Get authentication data for Unity
 */
export function getAuthData(): { token: string | null; userId: string | null; authUserId: string | null } {
  return {
    token: getCookie('authToken'),
    userId: getCookie('userId'),
    authUserId: getCookie('authUserId'),
  };
}