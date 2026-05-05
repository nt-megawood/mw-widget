import { useEffect, useState } from 'react';
import { getAuthData, isB2BUser } from './useAuth';
import { getBackendBaseUrl } from '../config/api';

const WIDGET_TOKEN_STORAGE_KEY = 'widget-bearer-token';
const WIDGET_TOKEN_EXPIRY_KEY = 'widget-bearer-token-expiry';

export interface WidgetTokenResponse {
  access_token: string;
  token_type: string;
  expires_in_seconds: number;
  expires_at: string;
  user_type: 'anonymous' | 'authenticated';
  role: string;
  permissions: string[];
}

/**
 * Get the backend API base URL (without chat endpoint)
 * Configured centrally in src/config/api.ts
 */
function getBackendUrl(): string {
  return getBackendBaseUrl();
}

/**
 * Fetch a new widget token from the backend
 */
async function fetchWidgetToken(): Promise<WidgetTokenResponse> {
  const auth = getAuthData();
  const isAuthenticated = auth?.registered && auth?.user;
  
  const baseUrl = getBackendUrl();
  const tokenUrl = `${baseUrl}/v1/auth/widget-token`;

  const requestBody = {
    user_type: isAuthenticated ? 'authenticated' : 'anonymous',
    ...(isAuthenticated && {
      user_id: auth.user?.id?.toString(),
      user_name: auth.user?.name,
      email: auth.user?.email,
      company: auth.user?.profile?.company,
      is_b2b: isB2BUser(auth),
    }),
  };

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch widget token: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get the stored widget token, or fetch a new one if expired
 */
export async function getWidgetToken(): Promise<string> {
  const stored = localStorage.getItem(WIDGET_TOKEN_STORAGE_KEY);
  const expiry = localStorage.getItem(WIDGET_TOKEN_EXPIRY_KEY);

  const now = Date.now();
  const expiryTime = expiry ? parseInt(expiry, 10) : 0;

  // Return stored token if still valid (with 1-minute buffer)
  if (stored && expiryTime > now + 60000) {
    return stored;
  }

  // Fetch new token
  const tokenResponse = await fetchWidgetToken();
  const expiresAt = new Date(tokenResponse.expires_at).getTime();

  localStorage.setItem(WIDGET_TOKEN_STORAGE_KEY, tokenResponse.access_token);
  localStorage.setItem(WIDGET_TOKEN_EXPIRY_KEY, expiresAt.toString());

  return tokenResponse.access_token;
}

/**
 * React hook to manage widget token lifecycle
 * Fetches token on mount and when auth state changes
 */
export function useWidgetToken(): { token: string | null; loading: boolean; error: Error | null } {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const auth = getAuthData();

  useEffect(() => {
    const initToken = async () => {
      try {
        setLoading(true);
        setError(null);
        const newToken = await getWidgetToken();
        setToken(newToken);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        console.error('Failed to initialize widget token:', errorObj);
      } finally {
        setLoading(false);
      }
    };

    initToken();
  }, [auth?.user?.id, auth?.registered]); // Re-fetch when auth changes

  return { token, loading, error };
}
