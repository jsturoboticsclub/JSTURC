import { useState, useEffect, useCallback } from 'react';

export interface StoredUser {
  id?: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
  student_id?: string;
  uniqueId?: string;
  profile_photo?: string | null;
  [key: string]: any;
}

export const AUTH_SYNC_EVENT = 'jstu-auth-sync';

/**
 * Safely parse JSON from storage
 */
const safeParse = (str: string | null): any => {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

/**
 * Retrieves the currently active user across localStorage and sessionStorage
 */
export const getStoredUser = (): StoredUser | null => {
  try {
    const raw =
      localStorage.getItem('user') ||
      localStorage.getItem('authUser') ||
      sessionStorage.getItem('user');
    return safeParse(raw);
  } catch {
    return null;
  }
};

/**
 * Retrieves the currently active JWT token across storage locations
 */
export const getStoredToken = (): string | null => {
  try {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('authToken');

    if (!token || token === 'portfolio-demo-token') return null;
    return token;
  } catch {
    return null;
  }
};

/**
 * Persists user and token to all known storage keys and broadcasts sync events
 */
export const setStoredAuth = (user: StoredUser, token: string): void => {
  try {
    const userStr = JSON.stringify(user);
    // Sync to all known keys used by different contexts and pages
    localStorage.setItem('user', userStr);
    localStorage.setItem('authUser', userStr);
    localStorage.setItem('token', token);
    localStorage.setItem('authToken', token);

    sessionStorage.setItem('user', userStr);
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('authToken', token);

    // Broadcast change to same window listeners
    window.dispatchEvent(
      new CustomEvent(AUTH_SYNC_EVENT, { detail: { user, token } })
    );
    // Broadcast storage event for other listeners
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to save stored auth:', err);
  }
};

/**
 * Clears user authentication from all storage locations and broadcasts logout
 */
export const clearStoredAuth = (): void => {
  try {
    localStorage.removeItem('user');
    localStorage.removeItem('authUser');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfileImage');

    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authToken');

    window.dispatchEvent(
      new CustomEvent(AUTH_SYNC_EVENT, { detail: { user: null, token: null } })
    );
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Failed to clear stored auth:', err);
  }
};

/**
 * React hook to keep authentication state synchronized across all pages & tabs
 */
export const useAuthSync = () => {
  const [user, setUser] = useState<StoredUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const sync = useCallback(() => {
    setUser(getStoredUser());
    setToken(getStoredToken());
  }, []);

  useEffect(() => {
    // Initial sync
    sync();

    const handleCustomSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setUser(customEvent.detail.user ?? null);
        setToken(customEvent.detail.token ?? null);
      } else {
        sync();
      }
    };

    window.addEventListener(AUTH_SYNC_EVENT, handleCustomSync);
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);

    return () => {
      window.removeEventListener(AUTH_SYNC_EVENT, handleCustomSync);
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, [sync]);

  return {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    logout: clearStoredAuth,
    refreshAuth: sync
  };
};
