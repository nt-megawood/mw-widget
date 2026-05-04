import { useEffect, useState } from 'react';

const AUTH_STORAGE_KEY = 'auth';
const AUTH_CHANGE_EVENT = 'auth-changed';

export interface AuthProfile {
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  country?: string;
  postal_code?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  groups: Record<string, string>;
  profile: AuthProfile;
}

export interface AuthData {
  registered: boolean;
  user?: AuthUser;
  blocked: boolean;
}

/**
 * Utility function to read auth data from localStorage.
 * Safe to call from anywhere (not just React components).
 */
export function getAuthData(): AuthData | null {
  try {
    const authJson = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authJson) return null;
    return JSON.parse(authJson) as AuthData;
  } catch {
    return null;
  }
}

/**
 * React hook to access auth data with reactivity.
 * Re-renders when localStorage changes (if storage event is fired).
 */


export function clearAuthData(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function useAuth(): AuthData | null {
  const [authData, setAuthData] = useState<AuthData | null>(() => getAuthData());

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === AUTH_STORAGE_KEY) {
        setAuthData(getAuthData());
      }
    };

    const handleAuthChange = () => setAuthData(getAuthData());

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, []);

  return authData;
}

/**
 * Check if user is a business user (B2B) based on groups.
 * B2B groups: 12 (Händler), 38 (Werksverkauf), 40 (Admin)
 */
export function isB2BUser(auth: AuthData | null): boolean {
  if (!auth?.user) return false;
  const b2bGroupIds = ['12', '38', '40'];
  return b2bGroupIds.some((id) => id in auth.user!.groups);
}

/**
 * Extract audience path from auth data.
 */
export function getAudiencePath(auth: AuthData | null): 'privatkunde' | 'gewerblich' | null {
  if (!auth?.registered) {
    return null;
  }
  return isB2BUser(auth) ? 'gewerblich' : 'privatkunde';
}
